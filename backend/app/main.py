from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db.database import engine, Base
from .routers import auth, users, impute, patients, dashboard, evaluate, privacy

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SafeImpute API", description="Plateforme sécurisée d'imputation de valeurs de laboratoire clinique")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], # Explicit origins required when allow_credentials=True
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(impute.router)
app.include_router(patients.router)
app.include_router(dashboard.router)
app.include_router(evaluate.router)
app.include_router(privacy.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to SafeImpute API"}
