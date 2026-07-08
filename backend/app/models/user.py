from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
import enum
from ..db.database import Base

class UserRole(str, enum.Enum):
    Admin = "Admin"
    Clinicien = "Clinicien"
    Chercheur = "Chercheur"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    bcrypt_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)

    audit_logs = relationship("AuditLog", back_populates="user")
    panels_submitted = relationship("Panel", back_populates="clinician")
