from db.db import get_db
from fastapi import APIRouter, Depends, HTTPException
from model.user.user import (
    User, 
    UserLoginPassword, 
    UserLoginFace, 
    UserRegister, 
    EmailCheckRequest
)
from pipeline.compare import commpare_to_vector
from sqlalchemy.orm import Session
from utils.utils import create_access_token
import bcrypt

def get_password_hash(password: str) -> str:
    """Hache le mot de passe avec un salt."""
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_password.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifie si le mot de passe correspond au hash."""
    password_byte_enc = plain_password.encode('utf-8')
    hashed_password_byte_enc = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_byte_enc, hashed_password_byte_enc)

router = APIRouter()


# --- ENDPOINTS ---

# --- ENDPOINTS ---

@router.post("/check-email")
def check_email(request: EmailCheckRequest, db: Session = Depends(get_db)):
    """
    Vérifie si l'email existe et s'il est enrôlé pour Face ID.
    C'est ce qui permet au Frontend d'afficher le bouton Face ID dynamiquement.
    """
    user = db.query(User).filter(User.mail == request.email).first()
    
    if not user:
        return {"exists": False, "face_id_enrolled": False}
    
    # Vérifie si un vecteur facial valide existe
    is_enrolled = user.face_descriptor is not None and len(user.face_descriptor) > 0
    
    return {"exists": True, "face_id_enrolled": is_enrolled}

@router.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    # 1. Vérifier si l'utilisateur existe déjà
    existing_user = db.query(User).filter(User.mail == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Cet email est déjà enregistré.")

    # 2. Hacher le mot de passe
    hashed_password = get_password_hash(user.password)

    # 3. Créer l'objet utilisateur
    nouveau_user = User(
        nom_complet=user.nom_complet,
        mail=user.email,
        password_hash=hashed_password,
        face_descriptor=user.face_descriptor,
        is_superadmin=user.is_superadmin if hasattr(user, 'is_superadmin') else False
    )

    # 4. Sauvegarder
    db.add(nouveau_user)
    db.commit()
    db.refresh(nouveau_user) # Récupère l'ID généré par la DB

    # 5. Générer le Token pour connecter l'utilisateur immédiatement après l'inscription
    access_token = create_access_token(data={"sub": nouveau_user.mail})

    # 6. Retourner la structure attendue par React
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "nom_complet": nouveau_user.nom_complet,
            "mail": nouveau_user.mail,
            "is_superadmin": nouveau_user.is_superadmin,
            "role": "admin" if nouveau_user.is_superadmin else "user"
        }
    }


@router.post("/login/password")
def login_password(credentials: UserLoginPassword, db: Session = Depends(get_db)):
    """Flux de connexion classique (Mot de passe uniquement)"""
    user = db.query(User).filter(User.mail == credentials.email).first()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect.")

    # Générer le Token
    access_token = create_access_token(data={"sub": user.mail})

    # Retourner la structure attendue par React
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "nom_complet": user.nom_complet,
            "mail": user.mail,
            "is_superadmin": user.is_superadmin,
            "role": "admin" if user.is_superadmin else "user"
        }
    }


@router.post("/login/face")
def login_face(credentials: UserLoginFace, db: Session = Depends(get_db)):
    """Flux de connexion Face ID (Ignore le mot de passe)"""
    user = db.query(User).filter(User.mail == credentials.email).first()

    if not user or not user.face_descriptor:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé ou non enrôlé pour Face ID.")

    # Calcul de la distance
    distance_ok = commpare_to_vector(user.face_descriptor, credentials.face_descriptor)

    if distance_ok:
        # Générer le Token
        access_token = create_access_token(data={"sub": user.mail})

        # Retourner la structure attendue par React
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "nom_complet": user.nom_complet,
                "mail": user.mail,
                "is_superadmin": user.is_superadmin,
                "role": "admin" if user.is_superadmin else "user"
            }
        }
    else:
        raise HTTPException(status_code=401, detail="Face authentication failed")