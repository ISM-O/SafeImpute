import torch
import joblib
import pandas as pd
import numpy as np
import os
from .model import MaskedTransformer

class SafeImputerEngine:
    def __init__(self, model_path="scripts/models/masked_transformer.pt", scaler_path="scripts/models/scaler.pkl"):
        # 1. On charge le modèle sur CPU
        self.device = torch.device("cpu")
        self.model = MaskedTransformer(num_features=38).to(self.device)
        
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        self.model.load_state_dict(torch.load(os.path.join(base_dir, model_path), map_location=self.device, weights_only=True))
        self.model.eval() # Coupe les gradients et le dropout
        
        # 2. On charge le Scaler
        self.scaler = joblib.load(os.path.join(base_dir, scaler_path))
        
        # 3. L'ordre exact des colonnes utilisé pendant l'entraînement
        self.feature_names = ['HR', 'O2Sat', 'Temp', 'SBP', 'MAP', 'DBP', 'Resp', 'EtCO2', 'BaseExcess', 'HCO3', 'FiO2', 'pH', 'PaCO2', 'SaO2', 'AST', 'BUN', 'Alkalinephos', 'Calcium', 'Chloride', 'Creatinine', 'Bilirubin_direct', 'Glucose', 'Lactate', 'Magnesium', 'Phosphate', 'Potassium', 'Bilirubin_total', 'TroponinI', 'Hct', 'Hgb', 'PTT', 'WBC', 'Fibrinogen', 'Platelets', 'Age', 'Gender', 'Unit1', 'Unit2']

    def predict(self, patient_data_dict: dict):
        """
        patient_data_dict ressemble à ça : {"HR": 85.0, "Glucose": 110.0} (avec des trous)
        """
        # 1. Créer un tableau vide avec les 34 colonnes
        df = pd.DataFrame(columns=self.feature_names)
        df.loc[0] = np.nan # On initialise la ligne du patient avec des NaN
        
        # 2. Remplir avec les données reçues du médecin
        for key, value in patient_data_dict.items():
            if key in self.feature_names:
                df.at[0, key] = float(value)
                
        # 3. Normaliser les données (comme à l'entraînement)
        # On ignore les NaN pendant la transformation
        df_scaled = pd.DataFrame(self.scaler.transform(df), columns=self.feature_names)
        
        # 4. Remplacer les trous par des 0 (format attendu par notre Masked Transformer)
        df_scaled = df_scaled.fillna(0)
        
        # 5. Conversion en tenseur
        X_tensor = torch.tensor(df_scaled.values, dtype=torch.float32).to(self.device)
        
        # 6. INFÉRENCE (La magie opère)
        with torch.no_grad():
            mu, sigma_squared = self.model(X_tensor)
            
        # 7. Dénormalisation des résultats pour que le médecin puisse les lire
        mu_np = mu.cpu().numpy()
        sigma_np = sigma_squared.cpu().numpy()
        
        mu_denorm = self.scaler.inverse_transform(mu_np)[0]
        
        # La variance est mathématiquement plus complexe à dénormaliser exactement avec un StandardScaler,
        # mais on peut donner un intervalle de confiance lisible (ex: écart-type)
        std_dev_denorm = np.sqrt(sigma_np[0]) * self.scaler.scale_ 

        # 8. Préparation du JSON de réponse
        results = {
            "imputed_values": {},
            "uncertainty_sigma": {}
        }
        
        for i, feature in enumerate(self.feature_names):
            # On ne renvoie que les prédictions pour les valeurs qui étaient manquantes
            if pd.isna(df.at[0, feature]):
                results["imputed_values"][feature] = round(float(mu_denorm[i]), 2)
                results["uncertainty_sigma"][feature] = round(float(std_dev_denorm[i]), 2)
                
        return results

# Singleton instance
engine = None

def run_inference(observed, mask):
    global engine
    if engine is None:
        engine = SafeImputerEngine()
    
    # Préparez les données patient pour le predict (observed ne contient que les données avec valeurs)
    # L'engine remplit les vides avec des NaN, donc ça gère bien le mask automatiquement.
    results = engine.predict(observed)
    
    # Extraire uniquement les valeurs qui sont dans le 'mask' demandé
    imputed = {}
    uncertainty = {}
    for m in mask:
        if m in results["imputed_values"]:
            imputed[m] = results["imputed_values"][m]
            uncertainty[m] = results["uncertainty_sigma"][m]
            
    return imputed, uncertainty