from datetime import datetime, timedelta, timezone
import jwt # Ajoute cet import

# --- CONFIGURATION JWT ---
# IMPORTANT : En production, stocke cette clé dans un fichier .env
SECRET_KEY = "une_cle_secrete_tres_longue_et_tres_aleatoire_pour_ton_pfa"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # Le token expire dans 24 heures

def create_access_token(data: dict):
    """Génère un token JWT valide avec une date d'expiration."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt