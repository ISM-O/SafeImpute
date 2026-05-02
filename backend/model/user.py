from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    face_descriptor : list[float]

class UserLogin(BaseModel):
    email : EmailStr
    face_descriptor : list[float]


