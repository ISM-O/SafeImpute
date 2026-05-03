from api.user import router as users_router
from config import settings
from db.db import init_db
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Créer l'application FastAPI
app = FastAPI(debug=True)

# Ajouter CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Initialiser la base de données
@app.on_event("startup")
def startup():
    """Événement au démarrage de l'application."""
    init_db()
    print("✓ Base de données initialisée")


# Inclure les routes
app.include_router(users_router)


@app.get("/")
def read_root():
    """Endpoint racine."""
    return {
        "message": "Bienvenue dans l'API FACE REGNONITION",
    }


@app.get("/health")
def health_check():
    """Vérifier la santé de l'application."""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
