"""
Privacy audit of the trained SafeImpute model (real computations, no simulated values).

Two empirical tests are run on the trained Masked Transformer:

1. Membership inference attack (MIA), loss-threshold attack (Yeom et al., 2018).
   The privacy unit is the patient. For each patient we compute the model's mean
   Gaussian negative log-likelihood (NLL) on values that are artificially masked
   (20% of observed values, as during training). Patients seen during training
   ("members") should have a lower loss if the model memorised them. The attack
   score is -NLL and we report its ROC AUC for members vs. held-out patients.
   AUC ~ 0.5 means the attacker cannot tell members from non-members.

2. Distance to closest record (DCR).
   For held-out patients, we compare two versions of the same panel to a reference
   set of training panels (one random record per training patient):
     - "real_to_real":     the real panel (observed values kept)
     - "imputed_to_train": the same panel after 20% of its observed values were
                           masked and re-imputed by the model.
   If imputation copied training records, imputed panels would be markedly closer
   to the training set than the real panels are.

Differential privacy (DP-SGD) is NOT applied to the current model: the report says
so explicitly ("enabled": false). It is listed as future work in the README.

Run from backend/scripts:  python run_privacy_audit.py
Output: privacy_report.json (read by the /privacy/report API route).
"""

import datetime
import json
import os
import sys

import numpy as np
import pandas as pd
import torch
from sklearn.metrics import roc_auc_score
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(SCRIPTS_DIR))

from app.ml.model import MaskedTransformer  # noqa: E402
from scripts.loaders import PhysioNetLoader  # noqa: E402

SEED = 42
MASKING_RATIO = 0.20      # same ratio as in train.py / evaluate.py
N_MIA_PATIENTS = 2000     # patients per group (members / non-members)
N_DCR_QUERIES = 1000      # held-out patients used for the DCR test
MIA_TARGET_AUC = 0.55     # threshold shown in the dashboard
BATCH_SIZE = 4096


def standardize(X_train, mask_train, X_other, mask_other):
    """Fit the scaler on observed training values only (as in train.py)."""
    scaler = StandardScaler()
    raw_train = X_train.copy()
    raw_train[mask_train == 0] = np.nan
    scaler.fit(raw_train)

    def transform(X, mask):
        raw = X.copy()
        raw[mask == 0] = np.nan
        return pd.DataFrame(scaler.transform(raw), columns=X.columns).fillna(0).values.astype(np.float32)

    return transform(X_train, mask_train), transform(X_other, mask_other)


@torch.no_grad()
def predict(model, X):
    """Return mu and sigma^2 for an (n_rows, n_features) array, in batches."""
    mus, variances = [], []
    for start in range(0, len(X), BATCH_SIZE):
        mu, var = model(torch.from_numpy(X[start:start + BATCH_SIZE]))
        mus.append(mu.numpy())
        variances.append(var.numpy())
    return np.concatenate(mus), np.concatenate(variances)


def masked_inputs(X, mask, rng):
    """Hide MASKING_RATIO of the observed values (set to 0, as in training)."""
    hidden = (rng.random(X.shape) < MASKING_RATIO) & (mask == 1)
    X_in = X.copy()
    X_in[hidden] = 0.0
    return X_in, hidden


def per_patient_nll(model, X, mask, patient_ids, rng):
    """Mean Gaussian NLL on artificially hidden values, aggregated per patient."""
    X_in, hidden = masked_inputs(X, mask, rng)
    mu, var = predict(model, X_in)
    nll = 0.5 * (np.log(var) + (X - mu) ** 2 / var)          # constant term dropped
    nll_sum = pd.Series((nll * hidden).sum(axis=1)).groupby(patient_ids).sum()
    count = pd.Series(hidden.sum(axis=1)).groupby(patient_ids).sum()
    per_patient = (nll_sum / count).replace([np.inf, -np.inf], np.nan).dropna()
    return per_patient


def sample_patients(patient_ids, n, rng):
    unique = np.unique(patient_ids)
    return rng.choice(unique, size=min(n, len(unique)), replace=False)


def one_row_per_patient(patient_ids, rng):
    """Index of one random record (hour) per patient."""
    order = rng.permutation(len(patient_ids))
    first = pd.Series(order).groupby(np.asarray(patient_ids)[order]).first()
    return first.values


def complete(model, X, mask):
    """Fill originally missing values with the model's prediction (observed values kept)."""
    mu, _ = predict(model, X)
    return np.where(mask == 1, X, mu)


def run_audit():
    print("Privacy audit: loading data and model...")
    rng = np.random.default_rng(SEED)
    torch.manual_seed(SEED)

    loader = PhysioNetLoader(
        folder_A_path="../../dataset/training/training_setA",
        folder_B_path="../../dataset/training/training_setB",
        cache_dir=os.path.join(SCRIPTS_DIR, "data", "processed"),
    )
    X_train, mask_train, df_train, X_val, mask_val, df_val = loader.load()
    ids_train = df_train["PatientID"].to_numpy()
    ids_val = df_val["PatientID"].to_numpy()

    Xtr, Xva = standardize(X_train, mask_train, X_val, mask_val)
    Mtr, Mva = mask_train.values.astype(np.float32), mask_val.values.astype(np.float32)

    model = MaskedTransformer(num_features=Xtr.shape[1])
    weights = os.path.join(SCRIPTS_DIR, "models", "masked_transformer.pt")
    model.load_state_dict(torch.load(weights, map_location="cpu", weights_only=True))
    model.eval()

    # ---------- 1. Membership inference attack (loss threshold) ----------
    print("1/2 Membership inference attack (loss threshold, patient level)...")
    members = sample_patients(ids_train, N_MIA_PATIENTS, rng)
    non_members = sample_patients(ids_val, N_MIA_PATIENTS, rng)
    in_tr = np.isin(ids_train, members)
    in_va = np.isin(ids_val, non_members)

    loss_members = per_patient_nll(model, Xtr[in_tr], Mtr[in_tr], ids_train[in_tr], rng)
    loss_non_members = per_patient_nll(model, Xva[in_va], Mva[in_va], ids_val[in_va], rng)

    labels = np.r_[np.ones(len(loss_members)), np.zeros(len(loss_non_members))]
    scores = -np.r_[loss_members.values, loss_non_members.values]   # lower loss => "member"
    mia_auc = float(roc_auc_score(labels, scores))
    print(f"    MIA AUC = {mia_auc:.3f} "
          f"({len(loss_members)} members vs. {len(loss_non_members)} held-out patients)")

    # ---------- 2. Distance to closest record ----------
    print("2/2 Distance to closest record (DCR)...")
    ref_idx = one_row_per_patient(ids_train, rng)
    reference = complete(model, Xtr[ref_idx], Mtr[ref_idx])

    query_patients = sample_patients(ids_val, N_DCR_QUERIES, rng)
    q_rows = one_row_per_patient(ids_val, rng)
    q_rows = q_rows[np.isin(ids_val[q_rows], query_patients)]
    Xq, Mq = Xva[q_rows], Mva[q_rows]

    real_panels = complete(model, Xq, Mq)                     # observed values kept
    Xq_in, hidden = masked_inputs(Xq, Mq, rng)
    mu_q, _ = predict(model, Xq_in)
    imputed_panels = np.where(hidden, mu_q, real_panels)      # 20% of observed re-imputed

    nn = NearestNeighbors(n_neighbors=1).fit(reference)
    real_to_real = nn.kneighbors(real_panels)[0].ravel()
    imputed_to_train = nn.kneighbors(imputed_panels)[0].ravel()
    print(f"    median DCR real = {np.median(real_to_real):.3f}, "
          f"imputed = {np.median(imputed_to_train):.3f}")

    # ---------- Report ----------
    report = {
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "seed": SEED,
        "dp_sgd": {
            "enabled": False,
            "epsilon": None,
            "delta": None,
            "clipping_norm": None,
            "note": "The current model is trained without differential privacy (planned work).",
        },
        "mia": {
            "auc": round(mia_auc, 4),
            "target": MIA_TARGET_AUC,
            "method": "Loss-threshold attack (Yeom et al., 2018), patient level, "
                      "mean Gaussian NLL on 20% artificially masked observed values",
            "n_members": int(len(loss_members)),
            "n_non_members": int(len(loss_non_members)),
        },
        "nn_distance": {
            "real_to_real": np.round(real_to_real, 4).tolist(),
            "imputed_to_train": np.round(imputed_to_train, 4).tolist(),
            "method": "Euclidean distance (standardized features) from held-out panels to the "
                      "closest training panel (one record per training patient); 'imputed' = "
                      "same panels with 20% of observed values re-imputed by the model",
            "reference_size": int(len(reference)),
        },
    }

    output_path = os.path.join(SCRIPTS_DIR, "privacy_report.json")
    with open(output_path, "w") as f:
        json.dump(report, f, indent=2)
    print(f"Report saved to {output_path}")


if __name__ == "__main__":
    run_audit()
