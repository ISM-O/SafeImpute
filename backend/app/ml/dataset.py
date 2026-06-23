import torch
from torch.utils.data import Dataset, DataLoader
import pandas as pd

class ClinicalDataset(Dataset):
    def __init__(self, X_df: pd.DataFrame, mask_df: pd.DataFrame):
        # Conversion en tenseurs Float (32 bits) pour le GPU
        self.X = torch.tensor(X_df.values, dtype=torch.float32)
        self.mask = torch.tensor(mask_df.values, dtype=torch.float32)

    def __len__(self):
        return len(self.X)

    def __getitem__(self, idx):
        return self.X[idx], self.mask[idx]