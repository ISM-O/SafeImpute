import torch
import torch.nn as nn
import torch.nn.functional as F

class MaskedTransformer(nn.Module):
    def __init__(self, num_features=34, d_model=64, nhead=4, num_layers=3, dim_feedforward=256):
        """
        Architecture du modèle d'imputation.
        Avec ces paramètres par défaut, on a un modèle léger d'environ 180 000 paramètres, 
        idéal pour converger vite et respecter le cahier des charges.
        """
        super().__init__()
        
        # 1. Encodage de la valeur : transforme le scalaire brut en un vecteur dense
        self.value_embedding = nn.Linear(1, d_model)
        
        # 2. Encodage de la caractéristique : dit au modèle "c'est de la Température" ou "c'est du Glucose"
        self.feature_embedding = nn.Embedding(num_features, d_model)
        
        # 3. L'Encodeur Transformer (Le Cerveau)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model, 
            nhead=nhead, 
            dim_feedforward=dim_feedforward, 
            batch_first=True,  # Important pour avoir les dimensions (Batch, Sequence, Features)
            dropout=0.1
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        
        # 4. Tête de Prédiction (Double sortie)
        # La couche linéaire sort 2 valeurs par analyte : pour la moyenne et la variance
        self.output_head = nn.Linear(d_model, 2)
        
    def forward(self, x):
        """
        x: tenseur de dimension (batch_size, num_features)
        Retourne mu (prédiction) et sigma_squared (incertitude)
        """
        batch_size, seq_len = x.size()
        
        # Ajout d'une dimension pour passer à (batch_size, num_features, 1)
        x = x.unsqueeze(-1)
        
        # Calcul de l'embedding de valeur
        val_embed = self.value_embedding(x)
        
        # Création des IDs de caractéristiques (0 à 33) pour tout le batch
        feature_ids = torch.arange(seq_len, device=x.device).unsqueeze(0).expand(batch_size, -1)
        
        # Calcul de l'embedding de caractéristique
        feat_embed = self.feature_embedding(feature_ids)
        
        # On additionne les deux pour donner le contexte complet à l'IA
        x_embed = val_embed + feat_embed
        
        # Passage dans les couches d'attention
        encoded = self.transformer(x_embed)
        
        # Projection finale
        out = self.output_head(encoded) # Dimension : (batch_size, num_features, 2)
        
        # Séparation de la sortie
        mu = out[:, :, 0]
        
        # Astuce mathématique cruciale : la variance ne peut pas être négative !
        # On utilise une fonction Softplus pour forcer la positivité, plus 1e-6 pour éviter les zéros stricts.
        # AVANT : sigma_squared = F.softplus(out[:, :, 1]) + 1e-6
        # APRÈS (Protection renforcée) :
        sigma_squared = F.softplus(out[:, :, 1]) + 1e-2
        
        return mu, sigma_squared