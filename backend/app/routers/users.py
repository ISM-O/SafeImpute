from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..models import User
from ..auth.guards import get_current_admin

router = APIRouter(prefix="/users", tags=["users"])

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
