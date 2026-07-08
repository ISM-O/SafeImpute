from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..models import User
from ..auth.jwt import verify_password, create_access_token
from ..auth.guards import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

def format_user(user: User) -> dict:
    """Format user object into a consistent dict for the frontend."""
    nom_complet = user.email.split('@')[0].replace('.', ' ').title()
    return {
        "id": user.id,
        "email": user.email,
        "role": user.role.value,
        "nom_complet": nom_complet,
    }

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.bcrypt_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role.value})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": format_user(user)
    }

@router.get("/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    return format_user(current_user)
