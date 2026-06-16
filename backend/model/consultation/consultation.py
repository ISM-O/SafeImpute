from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, Float, Integer, String, Boolean, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class Consultation(Base):
    __tablename__ = "consultations"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date_creation = Column(DateTime, default=datetime.utcnow)
    
    # 1. Ce que le patient envoie
    # Exemple: {"fievre": 39.5, "toux": true, "image_radio_url": "aws-s3-link..."}
    donnees_entrees = Column(JSON, nullable=False) 
    
    # 2. Ce que l'IA répond
    prediction_ia = Column(String, nullable=True) # Ex: "Risque élevé de Pneumonie"
    score_confiance = Column(Float, nullable=True) # Ex: 0.98 (98% de certitude)
    
    # 3. Le flux de travail (Workflow)
    # Statuts possibles: "En attente d'IA", "Analysé par IA", "Validé par Médecin"
    statut = Column(String, default="En attente d'IA")
    notes_medecin = Column(String, nullable=True) # Commentaire de l'admin
    
    # --- RELATIONS ---
    patient = relationship("User", back_populates="consultations")