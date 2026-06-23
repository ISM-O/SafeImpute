import torch
import numpy as np
import pandas as pd
import json
import os
import sys
import pickle
from sklearn.metrics import mean_squared_error, mean_absolute_error

# Ajout du dossier racine au path pour les imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.ml.model import MaskedTransformer
from scripts.loaders import PhysioNetLoader
from sklearn.preprocessing import StandardScaler

def evaluate_reconstruction():
    print("📊 Démarrage de l'évaluation (Axe 1: Reconstruction)...")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # 1. Chargement des données d'évaluation depuis le cache
    loader = PhysioNetLoader(folder_A_path="../../dataset/training/training_setA", folder_B_path="../../dataset/training/training_setB")
    X_train, mask_train, df_train, X_val, mask_val, df_val = loader.load()

    # Normalisation (Utilisation du scaler de l'entraînement)
    scaler_path = "models/scaler.pkl"
    if not os.path.exists(scaler_path):
        raise FileNotFoundError("Scaler introuvable. Entraînez le modèle d'abord (train.py) !")
    with open(scaler_path, "rb") as f:
        scaler = pickle.load(f)
    
    X_raw_for_scaling = X_val.copy()
    X_raw_for_scaling[mask_val == 0] = np.nan
    X_scaled = pd.DataFrame(scaler.transform(X_raw_for_scaling), columns=X_val.columns)
    X_scaled = X_scaled.fillna(0)

    # Conversion en tenseurs (Plus besoin de tronquer à 5000, on prend tout X_val)
    X_tensor = torch.tensor(X_scaled.values, dtype=torch.float32).to(device)
    mask_tensor = torch.tensor(mask_val.values, dtype=torch.float32).to(device)

    # 2. Chargement du modèle entraîné
    model_path = "models/masked_transformer.pt"
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Le modèle {model_path} est introuvable. Entraînez-le d'abord !")
        
    model = MaskedTransformer(num_features=X_val.shape[1]).to(device)
    model.load_state_dict(torch.load(model_path, map_location=device, weights_only=True))
    model.eval() # Mode évaluation : coupe le dropout et fige les poids

    # 3. Création du masque artificiel d'évaluation (On cache 20% des vraies données)
    torch.manual_seed(42) # Pour des résultats reproductibles
    rand_matrix = torch.rand(mask_tensor.shape).to(device)
    eval_mask = (rand_matrix < 0.20) * mask_tensor # 1 = Donnée artificiellement cachée
    
    # On efface les données cachées pour le modèle
    X_input = X_tensor.clone()
    X_input[eval_mask == 1] = 0

    # 4. Inférence (Prédiction)
    print("🧠 Inférence en cours...")
    with torch.no_grad(): # On ne calcule pas les gradients pour aller plus vite
        mu, sigma_squared = model(X_input)

    # 5. Extraction des valeurs pour le calcul des métriques
    # On ne s'intéresse QU'AUX cases qu'on a artificiellement cachées
    true_values = X_tensor[eval_mask == 1].cpu().numpy()
    predicted_values = mu[eval_mask == 1].cpu().numpy()

    # Dénormalisation pour avoir des métriques cliniquement lisibles (ex: en mg/dL)
    # Note : Simplification ici en prenant la moyenne globale pour l'exemple. 
    # En production, on dénormalise par colonne.
    true_values_denorm = scaler.inverse_transform(
        np.zeros((len(true_values), X_val.shape[1])) + true_values[:, np.newaxis]
    )[:, 0] # Approximation rapide
    predicted_values_denorm = scaler.inverse_transform(
        np.zeros((len(predicted_values), X_val.shape[1])) + predicted_values[:, np.newaxis]
    )[:, 0]

    # 6. Calcul des métriques
    rmse = np.sqrt(mean_squared_error(true_values, predicted_values))
    mae = mean_absolute_error(true_values, predicted_values)

    print(f"✅ RMSE (Erreur Quadratique Moyenne) : {rmse:.4f}")
    print(f"✅ MAE (Erreur Absolue Moyenne) : {mae:.4f}")

    # 7. Sauvegarde dans metrics.json
    results = {
        "reconstruction": {
            "rmse": float(rmse),
            "mae": float(mae),
            "description": "Erreur calculée sur 20% de données artificiellement masquées."
        }
    }
    
    with open("metrics.json", "w") as f:
        json.dump(results, f, indent=4)
        
    print("📁 Résultats sauvegardés dans metrics.json")

if __name__ == "__main__":
    evaluate_reconstruction()