"""
Train the Masked Transformer with differential privacy (DP-SGD, Opacus).

Same data split, standardization, masking strategy (20% of observed values) and
architecture as train.py; the only change is the optimizer: per-sample gradients
are clipped to `--max-grad-norm` and Gaussian noise is added, with the noise level
chosen by Opacus to reach `--target-epsilon` at `--delta` after `--epochs` epochs.

Privacy unit: one record (one hourly row of a patient's chart). PhysioNet patients
have several records, so the guarantee is record-level, not patient-level; this is
stated in the saved metadata.

Run from backend/scripts (a GPU is strongly recommended for the full dataset):
    python train_dp.py                       # epsilon = 8 (default)
    python train_dp.py --target-epsilon 3
    python train_dp.py --max-rows 20000 --epochs 1   # quick smoke test on CPU

Outputs:
    models/masked_transformer_dp.pt   model weights
    models/dp_training.json           epsilon, delta, noise multiplier, clipping norm...
    models/scaler.pkl                 scaler (identical to the one from train.py)
"""

import argparse
import datetime
import json
import os
import time

import numpy as np
import torch
from opacus import PrivacyEngine
from opacus.utils.batch_memory_manager import BatchMemoryManager
from opacus.validators import ModuleValidator
from torch.utils.data import DataLoader, TensorDataset

from common import MODELS_DIR, build_model, fit_scaler, load_data, model_path, save_scaler, transform

MASKING_RATIO = 0.20  # same as train.py


def parse_args():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--target-epsilon", type=float, default=8.0)
    p.add_argument("--delta", type=float, default=None,
                   help="default: 1 / (10 x number of training records)")
    p.add_argument("--max-grad-norm", type=float, default=1.0, help="per-sample clipping norm")
    p.add_argument("--epochs", type=int, default=5)
    p.add_argument("--batch-size", type=int, default=1024, help="expected (logical) batch size")
    p.add_argument("--physical-batch-size", type=int, default=256, help="lower it if GPU memory runs out")
    p.add_argument("--lr", type=float, default=1e-3)
    p.add_argument("--max-rows", type=int, default=None, help="use only the first N training rows (testing)")
    p.add_argument("--seed", type=int, default=42)
    return p.parse_args()


def per_sample_masked_nll(mu, var, target, hidden):
    """Gaussian NLL averaged over the hidden cells of each sample (0 if none hidden)."""
    nll = 0.5 * (torch.log(var) + (target - mu) ** 2 / var)
    n_hidden = hidden.sum(dim=1)
    return (nll * hidden).sum(dim=1) / n_hidden.clamp(min=1)


def main():
    args = parse_args()
    torch.manual_seed(args.seed)
    np.random.seed(args.seed)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"DP-SGD training on {device}")

    X_train, mask_train, _, _, _, _ = load_data()
    scaler = fit_scaler(X_train, mask_train)
    save_scaler(scaler)
    X = transform(scaler, X_train, mask_train)
    M = mask_train.values.astype(np.float32)
    if args.max_rows:
        X, M = X[:args.max_rows], M[:args.max_rows]
    n_records = len(X)
    delta = args.delta if args.delta is not None else 1.0 / (10 * n_records)
    print(f"{n_records} training records, target epsilon = {args.target_epsilon}, delta = {delta:.2e}")

    loader = DataLoader(TensorDataset(torch.from_numpy(X), torch.from_numpy(M)),
                        batch_size=args.batch_size, shuffle=True)

    model = build_model("dp", num_features=X.shape[1])
    errors = ModuleValidator.validate(model, strict=False)
    assert not errors, f"Model is not compatible with Opacus: {errors}"
    model = model.to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=args.lr)

    privacy_engine = PrivacyEngine(accountant="rdp")
    model, optimizer, loader = privacy_engine.make_private_with_epsilon(
        module=model,
        optimizer=optimizer,
        data_loader=loader,
        target_epsilon=args.target_epsilon,
        target_delta=delta,
        epochs=args.epochs,
        max_grad_norm=args.max_grad_norm,
    )
    print(f"Noise multiplier chosen by Opacus: {optimizer.noise_multiplier:.3f}")

    start = time.time()
    for epoch in range(args.epochs):
        model.train()
        total, batches = 0.0, 0
        with BatchMemoryManager(data_loader=loader, max_physical_batch_size=args.physical_batch_size,
                                optimizer=optimizer) as memory_safe_loader:
            for batch_X, batch_M in memory_safe_loader:
                if len(batch_X) == 0:  # Poisson sampling can produce empty batches
                    continue
                batch_X, batch_M = batch_X.to(device), batch_M.to(device)
                hidden = ((torch.rand_like(batch_M) < MASKING_RATIO) * batch_M)
                X_input = batch_X.clone()
                X_input[hidden == 1] = 0

                optimizer.zero_grad()
                mu, var = model(X_input)
                loss = per_sample_masked_nll(mu, var, batch_X, hidden).mean()
                loss.backward()
                optimizer.step()
                total += loss.item()
                batches += 1
        epsilon = privacy_engine.get_epsilon(delta)
        print(f"Epoch {epoch + 1}/{args.epochs} - NLL {total / max(batches, 1):.4f} - epsilon so far {epsilon:.2f}")

    epsilon = privacy_engine.get_epsilon(delta)
    os.makedirs(MODELS_DIR, exist_ok=True)
    torch.save(model._module.state_dict(), model_path("dp"))

    metadata = {
        "enabled": True,
        "epsilon": round(float(epsilon), 3),
        "delta": delta,
        "clipping_norm": args.max_grad_norm,
        "noise_multiplier": round(float(optimizer.noise_multiplier), 4),
        "target_epsilon": args.target_epsilon,
        "epochs": args.epochs,
        "expected_batch_size": args.batch_size,
        "sample_rate": args.batch_size / n_records,
        "learning_rate": args.lr,
        "accountant": "RDP (Opacus)",
        "privacy_unit": "record (one hourly row); patients contribute several records, "
                        "so this is a record-level guarantee",
        "n_training_records": n_records,
        "training_time_minutes": round((time.time() - start) / 60, 1),
        "trained_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "device": str(device),
    }
    with open(os.path.join(MODELS_DIR, "dp_training.json"), "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"Done: epsilon = {epsilon:.2f} at delta = {delta:.2e}. Saved {model_path('dp')}")


if __name__ == "__main__":
    main()
