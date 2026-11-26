"""
Reconstruction metrics (RMSE, MAE) of a trained model on held-out patients.

20% of the observed values of the validation patients are hidden (fixed seed),
the model imputes them, and the error is computed on those hidden cells, in
standardized units. The same cells are used for every model, so the standard
and DP-SGD models are directly comparable.

Run from backend/scripts:
    python evaluate.py                 # standard model
    python evaluate.py --model dp      # model trained with DP-SGD

Results are merged into metrics.json under "models" (baselines are kept).
The RMSE is also reported on the same 10,000-row sample that evaluate_baselines.py
uses for k-NN and MICE (too slow on the full set), for a like-for-like comparison.
"""

import json
import os

import numpy as np
import torch

from common import SCRIPTS_DIR, fit_scaler, load_data, load_model, parse_model_arg, predict, transform

MASKING_RATIO = 0.20
SEED = 42
BASELINE_SAMPLE_SIZE = 10000  # same sample as evaluate_baselines.py
METRICS_PATH = os.path.join(SCRIPTS_DIR, "metrics.json")


def evaluate(kind):
    print(f"Evaluating the '{kind}' model...")
    X_train, mask_train, _, X_val, mask_val, _ = load_data()
    scaler = fit_scaler(X_train, mask_train)
    X = transform(scaler, X_val, mask_val)
    M = mask_val.values.astype(np.float32)

    model = load_model(kind, num_features=X.shape[1])

    # Hide 20% of the observed values (same cells for every model: fixed seed)
    torch.manual_seed(SEED)
    hidden = ((torch.rand(M.shape) < MASKING_RATIO).numpy()) & (M == 1)
    X_input = X.copy()
    X_input[hidden] = 0.0

    mu, _ = predict(model, X_input)
    errors = mu[hidden] - X[hidden]
    rmse = float(np.sqrt(np.mean(errors ** 2)))
    mae = float(np.mean(np.abs(errors)))
    print(f"RMSE = {rmse:.4f} | MAE = {mae:.4f} ({int(hidden.sum())} hidden values)")

    # Same rows as the k-NN / MICE baselines (np.random.seed(42), 10,000 validation rows)
    np.random.seed(SEED)
    idx = np.random.choice(X.shape[0], size=BASELINE_SAMPLE_SIZE, replace=False)
    sample_errors = mu[idx][hidden[idx]] - X[idx][hidden[idx]]
    rmse_sample = float(np.sqrt(np.mean(sample_errors ** 2)))
    print(f"RMSE on the 10,000-row baseline sample = {rmse_sample:.4f}")

    data = {}
    if os.path.exists(METRICS_PATH):
        with open(METRICS_PATH) as f:
            data = json.load(f)
    entry = {
        "rmse": rmse,
        "mae": mae,
        "n_hidden_values": int(hidden.sum()),
        "rmse_baseline_sample": rmse_sample,
        "description": "Error on 20% of observed values artificially hidden in held-out patients "
                       "(standardized units).",
    }
    data.setdefault("models", {})[kind] = entry
    if kind == "standard":
        data["reconstruction"] = entry  # kept for backward compatibility
    with open(METRICS_PATH, "w") as f:
        json.dump(data, f, indent=4)
    print(f"Saved to {METRICS_PATH}")


if __name__ == "__main__":
    evaluate(parse_model_arg())
