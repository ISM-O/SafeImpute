from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..db.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_identifier = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    panels = relationship("Panel", back_populates="patient")
