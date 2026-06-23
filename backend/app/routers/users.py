from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..models import User, UserRole
from ..auth.guards import get_current_admin
from ..auth.jwt import get_password_hash

router = APIRouter(prefix="/users", tags=["users"])

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole

class UserRoleUpdate(BaseModel):
    role: UserRole

@router.get("/")
def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    users = db.query(User).all()
    # Format to match the frontend expectations for the mock
    formatted_users = []
    for u in users:
        formatted_users.append({
            "id": u.id,
            "name": u.email.split('@')[0].replace('.', ' ').title(),
            "email": u.email,
            "role": u.role.value,
            "status": "Active",
            "accessLevel": 23 if u.role.value == "Admin" else 13,
            "maxAccess": 23,
            "lastActive": "Active now" if u.id == current_user.id else "2 h ago",
            "description": "Full access" if u.role.value == "Admin" else "Restricted access",
            "color": "#10b981" if u.role.value == "Admin" else ("#6366f1" if u.role.value == "Clinicien" else "#ec4899")
        })
    return formatted_users

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        bcrypt_hash=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "User created successfully", "id": db_user.id}

@router.put("/{user_id}/role")
def update_user_role(user_id: int, role_update: UserRoleUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Prevent admin from changing their own role to something else and locking themselves out
    if db_user.id == current_user.id and role_update.role != UserRole.Admin:
        raise HTTPException(status_code=400, detail="Cannot demote yourself")
        
    db_user.role = role_update.role
    db.commit()
    return {"message": "User role updated successfully"}

