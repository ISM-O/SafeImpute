"""
Shared helpers for the training, evaluation and audit scripts.

All scripts use the same patient-level train/validation split (loaders.py,
random_state=42) and the same standardization (fitted on observed training
values only), so the standard and the DP-SGD models are compared on exactly
the same held-out patients.
"""

import os
import pickle
import sys

import numpy as np
import pandas as pd
import torch
from sklearn.preprocessing import StandardScaler

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPTS_DIR)
MODELS_DIR = os.path.join(SCRIPTS_DIR, "models")
sys.path.append(BACKEND_DIR)

from app.ml.model import MODEL_FILES, MODEL_KINDS, build_model  # noqa: E402
from scripts.loaders import PhysioNetLoader  # noqa: E402

BATCH_SIZE = 4096


def load_data():
    """Return (X_train, mask_train, df_train, X_val, mask_val, df_val) from the Parquet cache."""
    loader = PhysioNetLoader(
        folder_A_path=os.path.join(BACKEND_DIR, "..", "dataset", "training", "training_setA"),
        folder_B_path=os.path.join(BACKEND_DIR, "..", "dataset", "training", "training_setB"),
        cache_dir=os.path.join(SCRIPTS_DIR, "data", "processed"),
    )
    return loader.load()


def fit_scaler(X_train, mask_train):
    """Fit the scaler on observed training values only (missing values are ignored)."""
    raw = X_train.copy()
    raw[mask_train == 0] = np.nan
    return StandardScaler().fit(raw)


def transform(scaler, X, mask):
    """Standardize, then put 0 in missing cells (the format expected by the model)."""
    raw = X.copy()
    raw[mask == 0] = np.nan
    return pd.DataFrame(scaler.transform(raw), columns=X.columns).fillna(0).values.astype(np.float32)


def save_scaler(scaler):
    os.makedirs(MODELS_DIR, exist_ok=True)
    with open(os.path.join(MODELS_DIR, "scaler.pkl"), "wb") as f:
        pickle.dump(scaler, f)


def model_path(kind):
    return os.path.join(MODELS_DIR, MODEL_FILES[kind])


def load_model(kind, num_features):
    path = model_path(kind)
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"No trained '{kind}' model at {path}. "
            + ("Run train.py first." if kind == "standard" else "Run train_dp.py first.")
        )
    model = build_model(kind, num_features)
    model.load_state_dict(torch.load(path, map_location="cpu", weights_only=True))
    model.eval()
    return model


@torch.no_grad()
def predict(model, X, batch_size=BATCH_SIZE):
    """mu and sigma^2 for an (n_rows, n_features) float32 array, computed in batches."""
    mus, variances = [], []
    for start in range(0, len(X), batch_size):
        mu, var = model(torch.from_numpy(X[start:start + batch_size]))
        mus.append(mu.numpy())
        variances.append(var.numpy())
    return np.concatenate(mus), np.concatenate(variances)


def parse_model_arg(argv=None, default="standard"):
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", choices=MODEL_KINDS, default=default,
                        help="standard = trained without DP, dp = trained with DP-SGD")
    return parser.parse_args(argv).model
