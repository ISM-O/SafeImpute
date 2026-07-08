import sys
import os
from sqlalchemy.orm import Session
from passlib.context import CryptContext

# Add backend directory to sys.path to allow importing from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SessionLocal, engine, Base
from app.models import User, UserRole

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def seed_users():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    
    users_data = [
        {"email": "admin@hospital.org", "password": "adminpassword", "role": UserRole.Admin},
        {"email": "clinicien@hospital.org", "password": "clinicienpassword", "role": UserRole.Clinicien},
        {"email": "chercheur@hospital.org", "password": "chercheurpassword", "role": UserRole.Chercheur},
    ]
    
    try:
        for user_data in users_data:
            user = db.query(User).filter(User.email == user_data["email"]).first()
            if not user:
                print(f"Creating user {user_data['email']} with role {user_data['role']}")
                hashed_password = get_password_hash(user_data["password"])
                db_user = User(
                    email=user_data["email"],
                    bcrypt_hash=hashed_password,
                    role=user_data["role"]
                )
                db.add(db_user)
            else:
                print(f"User {user_data['email']} already exists.")
        
        db.commit()
        print("Database seeded successfully.")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_users()
