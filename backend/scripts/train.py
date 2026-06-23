import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
import os
import sys
import pickle
from sklearn.preprocessing import StandardScaler
import numpy as np
import pandas as pd

# Ajout du dossier racine au path pour les imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.ml.model import MaskedTransformer
from app.ml.dataset import ClinicalDataset
from scripts.loaders import PhysioNetLoader

def train_model():
    # 1. Configuration du matériel (GPU si dispo, sinon CPU)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"🚀 Démarrage de l'entraînement sur : {device}")

    # 2. Chargement des données (Utilise le cache Parquet créé précédemment)
    loader = PhysioNetLoader(
        folder_A_path="../../dataset/training/training_setA", 
        folder_B_path="../../dataset/training/training_setB"
    )
    X_train, mask_train, df_train, X_val, mask_val, df_val = loader.load()
    
    print("Standardisation des données cliniques...")
    scaler = StandardScaler()
    
    # On remplace temporairement les 0 (qui sont nos anciens NaN) par des vrais NaN 
    # pour que le scaler calcule la moyenne uniquement sur les VRAIES données de l'hôpital
    X_raw_for_scaling = X_train.copy()
    X_raw_for_scaling[mask_train == 0] = np.nan
    
    # On calcule la moyenne et on normalise
    X_scaled = pd.DataFrame(scaler.fit_transform(X_raw_for_scaling), columns=X_train.columns)
    
    # On remet nos 0 informatiques pour PyTorch
    X_scaled = X_scaled.fillna(0)

    # Sauvegarde du scaler pour evaluate.py
    os.makedirs("models", exist_ok=True)
    with open("models/scaler.pkl", "wb") as f:
        pickle.dump(scaler, f)

    # Création du Dataset avec les données normalisées !
    dataset = ClinicalDataset(X_scaled, mask_train)
    dataloader = DataLoader(dataset, batch_size=64, shuffle=True)

    # 3. Initialisation du modèle et de l'optimiseur
    model = MaskedTransformer(num_features=X_train.shape[1]).to(device)
    # AVANT : optimizer = optim.Adam(model.parameters(), lr=1e-3)
    # APRÈS :
    optimizer = optim.Adam(model.parameters(), lr=1e-4)
    
    # La fonction de perte pour gérer mu et sigma_squared
    # reduction='none' nous permet d'appliquer notre masque artificiel ensuite
    criterion = nn.GaussianNLLLoss(reduction='none')

    # Paramètres d'entraînement
    epochs = 10
    masking_ratio = 0.20 # On cache artificiellement 20% des données

    model.train()
    
    for epoch in range(epochs):
        total_loss = 0
        
        for batch_X, batch_mask in dataloader:
            batch_X, batch_mask = batch_X.to(device), batch_mask.to(device)
            
            optimizer.zero_grad()
            
            # --- ÉTAPE CLÉ : LE MASQUAGE ARTIFICIEL ---
            # On génère des probabilités aléatoires pour chaque valeur
            rand_matrix = torch.rand(batch_mask.shape).to(device)
            
            # On masque UNIQUEMENT si la donnée existait à l'origine (batch_mask == 1)
            # et si le tirage aléatoire est inférieur à 20%
            artificial_mask = (rand_matrix < masking_ratio) * batch_mask
            
            # On crée l'entrée du modèle : on remplace par 0 les valeurs cachées
            X_input = batch_X.clone()
            X_input[artificial_mask == 1] = 0
            
            # --- FORWARD PASS ---
            mu, sigma_squared = model(X_input)
            
            # --- CALCUL DE L'ERREUR (LOSS) ---
            # L'erreur brute calculée sur TOUTE la matrice
            loss_matrix = criterion(mu, batch_X, sigma_squared)
            
            # On annule l'erreur partout, SAUF sur les valeurs qu'on a artificiellement cachées
            masked_loss = (loss_matrix * artificial_mask).sum() / (artificial_mask.sum() + 1e-8)
            
            # --- BACKPROPAGATION ---
            masked_loss.backward()
            
            # (Optionnel mais recommandé) Écrêtage des gradients pour la stabilité
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            
            optimizer.step()
            total_loss += masked_loss.item()
            
        avg_loss = total_loss / len(dataloader)
        print(f"Époque [{epoch+1}/{epochs}] - NLL Loss: {avg_loss:.4f}")

    # 4. Sauvegarde de l'artefact (Les poids du modèle)
    os.makedirs("models", exist_ok=True)
    model_path = "models/masked_transformer.pt"
    torch.save(model.state_dict(), model_path)
    print(f"✅ Entraînement terminé. Modèle sauvegardé dans : {model_path}")

if __name__ == "__main__":
    train_model()