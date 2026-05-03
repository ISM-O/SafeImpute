from db.db import get_db
from fastapi import APIRouter, Depends, HTTPException
from model.user import User, UserLogin, UserRegister
from pipeline.compare import commpare_to_vector
from sqlalchemy.orm import Session

router = APIRouter()

# --- ENDPOINTS ---


@router.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    # 1. Vérifier si l'utilisateur existe déjà en base
    existing_user = db.query(User).filter(User.mail == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Cet email est déjà enregistré.")

    # 2. Créer l'objet utilisateur pour la base de données
    nouveau_user = User(
        nom_complet=user.nom_complet,
        mail=user.email,
        face_descriptor=user.face_descriptor,
    )

    # 3. Sauvegarder en base
    db.add(nouveau_user)
    db.commit()

    return {
        "message": f"Utilisateur {user.nom_complet}  enregistré avec succès dans PostgreSQL !"
    }


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    # 1. Chercher l'utilisateur dans PostgreSQL
    stored_user = db.query(User).filter(User.mail == user.email).first()

    if not stored_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé.")

    # 2. Calculer la distance entre le vecteur reçu et celui de la BDD
    distance = commpare_to_vector(stored_user.face_descriptor, user.face_descriptor)

    if distance:
        return {
            "message": f"Connexion réussie ! Bienvenue {stored_user.nom_complet}",
            "fullName": stored_user.nom_complet,
            "email": stored_user.mail,
        }
    else:
        raise HTTPException(status_code=401, detail="Visage non reconnu.")
