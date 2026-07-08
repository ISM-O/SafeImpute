import pandas as pd
import numpy as np
import json
import os
import torch
import pickle
from sklearn.metrics import mean_squared_error
from sklearn.impute import KNNImputer, SimpleImputer
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer

def evaluate_baselines():
    print("📊 Loading validation data...")
    # Ensure paths work when run from backend/scripts/
    scaler_path = '../models/scaler.pkl'
    if not os.path.exists(scaler_path):
        # Fallback if run from backend/ root
        scaler_path = 'models/scaler.pkl'
        
    with open(scaler_path, 'rb') as f:
        scaler = pickle.load(f)
        
    val_path = 'data/processed/physionet_X_val.parquet'
    mask_path = 'data/processed/physionet_mask_val.parquet'
    
    if not os.path.exists(val_path):
        val_path = 'scripts/' + val_path
        mask_path = 'scripts/' + mask_path

    X_val = pd.read_parquet(val_path)
    mask_val = pd.read_parquet(mask_path)
    
    print(f"Validation set shape: {X_val.shape}")
    
    # Scale validation data
    X_raw_for_scaling = X_val.copy()
    X_raw_for_scaling[mask_val == 0] = np.nan
    X_scaled = pd.DataFrame(scaler.transform(X_raw_for_scaling), columns=X_val.columns)
    X_scaled = X_scaled.fillna(0)
    
    X_tensor = torch.tensor(X_scaled.values, dtype=torch.float32)
    mask_tensor = torch.tensor(mask_val.values, dtype=torch.float32)
    
    # Artificial mask 20% (exactly as in evaluate.py)
    torch.manual_seed(42)
    rand_matrix = torch.rand(mask_tensor.shape)
    eval_mask = (rand_matrix < 0.20) * mask_tensor
    
    X_input = X_tensor.clone().numpy()
    eval_mask_np = eval_mask.numpy()
    X_input[eval_mask_np == 1] = np.nan
    
    true_values = X_tensor[eval_mask_np == 1].numpy()
    
    results = {}
    
    # 1. Mean Imputation
    print("📈 Running Mean Imputer...")
    mean_imputer = SimpleImputer(strategy='mean')
    # Fit only on observed values
    mean_imputer.fit(X_input)
    X_mean = mean_imputer.transform(X_input)
    pred_mean = X_mean[eval_mask_np == 1]
    rmse_mean = np.sqrt(mean_squared_error(true_values, pred_mean))
    results["mean_rmse"] = float(rmse_mean)
    print(f"✅ Mean RMSE: {rmse_mean:.4f}")
    
    # 2. KNN & MICE are too slow on full 250k+ rows
    # We sample a representative subset (10,000 rows) to calculate their error
    print("📈 Preparing sample for KNN and MICE (10000 rows)...")
    np.random.seed(42)
    sample_idx = np.random.choice(X_input.shape[0], size=10000, replace=False)
    
    X_input_sample = X_input[sample_idx]
    X_tensor_sample = X_tensor.numpy()[sample_idx]
    eval_mask_sample = eval_mask_np[sample_idx]
    
    true_values_sample = X_tensor_sample[eval_mask_sample == 1]
    
    print("📈 Running KNN Imputer (k=5)...")
    knn_imputer = KNNImputer(n_neighbors=5)
    X_knn = knn_imputer.fit_transform(X_input_sample)
    pred_knn = X_knn[eval_mask_sample == 1]
    rmse_knn = np.sqrt(mean_squared_error(true_values_sample, pred_knn))
    results["knn_rmse"] = float(rmse_knn)
    print(f"✅ KNN RMSE: {rmse_knn:.4f}")
    
    print("📈 Running MICE (IterativeImputer)...")
    mice_imputer = IterativeImputer(max_iter=10, random_state=42)
    X_mice = mice_imputer.fit_transform(X_input_sample)
    pred_mice = X_mice[eval_mask_sample == 1]
    rmse_mice = np.sqrt(mean_squared_error(true_values_sample, pred_mice))
    results["mice_rmse"] = float(rmse_mice)
    print(f"✅ MICE RMSE: {rmse_mice:.4f}")
    
    # Update metrics.json
    metrics_path = "metrics.json"
    if not os.path.exists(metrics_path) and os.path.exists("scripts/metrics.json"):
        metrics_path = "scripts/metrics.json"
        
    if os.path.exists(metrics_path):
        with open(metrics_path, "r") as f:
            data = json.load(f)
    else:
        data = {}
        
    data["baselines"] = results
    
    with open(metrics_path, "w") as f:
        json.dump(data, f, indent=4)
        
    print(f"📁 Baselines appended successfully to {metrics_path}")

if __name__ == "__main__":
    evaluate_baselines()
