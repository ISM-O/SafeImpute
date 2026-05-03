from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, Float, Integer, String, create_engine
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class UserRegister(BaseModel):
    nom_complet: str
    email: EmailStr
    face_descriptor: list[float]


class UserLogin(BaseModel):
    email: EmailStr
    face_descriptor: list[float]


class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer, primary_key=True, nullable=False, index=True, autoincrement=True
    )
    nom_complet = Column(String, nullable=False)
    mail = Column(String, nullable=False)
    face_descriptor = Column(ARRAY(Float), nullable=False)
