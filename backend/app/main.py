from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db.database import engine, Base
from .routers import auth, users, impute

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SafeImpute API", description="Plateforme sécurisée d'imputation de valeurs de laboratoire clinique")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(impute.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to SafeImpute API"}
