from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, Float, Integer, String, Boolean, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class ProfilMedical(Base):
    __tablename__ = "profils_medicaux"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Informations de base (utiles pour toute IA médicale)
    date_naissance = Column(DateTime, nullable=True)
    sexe = Column(String, nullable=True)
    groupe_sanguin = Column(String, nullable=True)
    
    # Historique sous format JSON pour un maximum de flexibilité
    # Exemple: {"allergies": ["Pénicilline"], "fumeur": false, "diabete": true}
    antecedents = Column(JSON, nullable=True)
    
    # --- RELATIONS ---
    patient = relationship("User", back_populates="profil")