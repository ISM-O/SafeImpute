import pandas as pd
import numpy as np
import glob
import os

class PhysioNetLoader:
    def __init__(self, folder_A_path: str, folder_B_path: str, cache_dir: str = "data/processed"):
        self.folder_A_path = folder_A_path
        self.folder_B_path = folder_B_path
        self.cache_dir = cache_dir
        
        # Créer le dossier de cache s'il n'existe pas
        os.makedirs(self.cache_dir, exist_ok=True)
        
        # Chemins de sauvegarde (format Parquet pour des performances optimales)
        self.cache_x_train = os.path.join(self.cache_dir, "physionet_X_train.parquet")
        self.cache_mask_train = os.path.join(self.cache_dir, "physionet_mask_train.parquet")
        self.cache_full_train = os.path.join(self.cache_dir, "physionet_full_train.parquet")
        self.cache_x_val = os.path.join(self.cache_dir, "physionet_X_val.parquet")
        self.cache_mask_val = os.path.join(self.cache_dir, "physionet_mask_val.parquet")
        self.cache_full_val = os.path.join(self.cache_dir, "physionet_full_val.parquet")
        
    def _read_folder(self, folder_path: str) -> pd.DataFrame:
        """Lit tous les fichiers .psv d'un dossier et les fusionne."""
        all_files = glob.glob(os.path.join(folder_path, "*.psv"))
        df_list = []
        
        for filename in all_files:
            df = pd.read_csv(filename, sep='|')
            patient_id = os.path.basename(filename).split('.')[0]
            df['PatientID'] = patient_id
            df_list.append(df)
            
        return pd.concat(df_list, ignore_index=True)

    def load(self) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """Retourne (X_train, mask_train, df_train, X_val, mask_val, df_val), soit depuis le cache, soit depuis les fichiers bruts."""
        
        from sklearn.model_selection import train_test_split
        
        # 1. Vérification du Cache
        cache_exists = all(os.path.exists(p) for p in [
            self.cache_x_train, self.cache_mask_train, self.cache_full_train,
            self.cache_x_val, self.cache_mask_val, self.cache_full_val
        ])
        
        if cache_exists:
            print("⚡ Chargement instantané depuis le cache Parquet...")
            X_train = pd.read_parquet(self.cache_x_train)
            mask_train = pd.read_parquet(self.cache_mask_train)
            df_train = pd.read_parquet(self.cache_full_train)
            X_val = pd.read_parquet(self.cache_x_val)
            mask_val = pd.read_parquet(self.cache_mask_val)
            df_val = pd.read_parquet(self.cache_full_val)
            return X_train, mask_train, df_train, X_val, mask_val, df_val
            
        # 2. Si aucun cache, on fait le traitement lourd
        print("Aucun cache trouvé. Fusion des fichiers bruts en cours (cela peut prendre quelques minutes)...")
        print("Chargement du Dataset A...")
        df_A = self._read_folder(self.folder_A_path)
        
        print("Chargement du Dataset B...")
        df_B = self._read_folder(self.folder_B_path)
        
        df_full = pd.concat([df_A, df_B], ignore_index=True)
        
        # Séparation en train et eval selon le PatientID pour éviter le data leakage
        patient_ids = df_full['PatientID'].unique()
        # Conversion en numpy array pour éviter l'erreur de type pyarrow avec sklearn
        train_ids, val_ids = train_test_split(patient_ids.to_numpy(), test_size=0.2, random_state=42)
        
        df_train = df_full[df_full['PatientID'].isin(train_ids)].copy()
        df_val = df_full[df_full['PatientID'].isin(val_ids)].copy()
        
        cols_to_drop = ['PatientID', 'SepsisLabel', 'HospAdmTime', 'ICULOS']
        
        # Train
        X_raw_train = df_train.drop(columns=cols_to_drop, errors='ignore')
        mask_train = (~X_raw_train.isna()).astype(int)
        X_train = X_raw_train.fillna(0)
        
        # Val
        X_raw_val = df_val.drop(columns=cols_to_drop, errors='ignore')
        mask_val = (~X_raw_val.isna()).astype(int)
        X_val = X_raw_val.fillna(0)
        
        # 3. Sauvegarde dans le Cache
        print(f"Sauvegarde des matrices dans {self.cache_dir}...")
        X_train.to_parquet(self.cache_x_train)
        mask_train.to_parquet(self.cache_mask_train)
        df_train.to_parquet(self.cache_full_train)
        
        X_val.to_parquet(self.cache_x_val)
        mask_val.to_parquet(self.cache_mask_val)
        df_val.to_parquet(self.cache_full_val)
        
        print("✅ Données prêtes et mises en cache !")
        return X_train, mask_train, df_train, X_val, mask_val, df_val