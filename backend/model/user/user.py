from typing import Optional
from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, Float, Integer, String, Boolean
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.declarative import declarative_base

# C'est ici qu'on définit Base (et non dans db.py)
Base = declarative_base()

# ==========================================
# 1. SCHÉMAS PYDANTIC (Validation Frontend)
# ==========================================

class UserRegister(BaseModel):
    nom_complet: str
    email: EmailStr
    password: str
    is_admin: bool = False
    view_only: bool = False
    view_and_edit: bool = False
    is_superadmin: bool = False
    face_descriptor: Optional[list[float]] = None

class UserLoginPassword(BaseModel):
    email: EmailStr
    password: str

class UserLoginFace(BaseModel):
    email: EmailStr
    face_descriptor: list[float]

class EmailCheckRequest(BaseModel):
    email: EmailStr

# ==========================================
# 2. MODÈLES SQLALCHEMY (Base de données)
# ==========================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, nullable=False, index=True, autoincrement=True)
    nom_complet = Column(String, nullable=False)
    mail = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    face_descriptor = Column(ARRAY(Float), nullable=True)
    
    # Permissions
    is_superadmin = Column(Boolean, default=False)
    can_view = Column(Boolean, default=True)
    can_edit = Column(Boolean, default=False)