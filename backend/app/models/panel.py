from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
from ..db.database import Base

class Panel(Base):
    __tablename__ = "panels"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    clinician_id = Column(Integer, ForeignKey("users.id"))
    observed_data = Column(JSONB, nullable=False)
    imputed_data = Column(JSONB, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="panels")
    clinician = relationship("User", back_populates="panels_submitted")
