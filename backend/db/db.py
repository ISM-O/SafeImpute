from contextlib import contextmanager
from typing import Generator

from config import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

engine = create_engine(
    settings.database_url, pool_pre_ping=True, pool_size=10, max_overflow=20, echo=True
)


# Créer la fabrique de sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,
    class_=Session,
)


def get_db() -> Generator[Session, None, None]:
    """
    Dépendance pour obtenir une session de base de données.

    À utiliser avec FastAPI pour injecter une session dans les routes.

    Yields:
        Session: Une session SQLAlchemy
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_session() -> Generator[Session, None, None]:
    """
    Context manager pour utiliser la base de données de manière sûre.

    Gère automatiquement le commit et le rollback.

    Yields:
        Session: Une session SQLAlchemy

    Example:
        with get_db_session() as db:
            user = db.query(User).filter(User.id == 1).first()
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Erreur lors de la transaction: {e}")
        raise
    finally:
        db.close()


def init_db() -> None:
    """
    Initialiser la base de données en créant toutes les tables.

    Cette fonction doit être appelée au démarrage de l'application.
    Elle crée toutes les tables définies par les modèles SQLAlchemy.
    """
    try:
        from model.user.user import Base

        Base.metadata.create_all(bind=engine)
        print("✓ Tables de la base de données créées avec succès")
    except Exception as e:
        print(f"✗ Erreur lors de la création des tables: {e}")
        raise


def close_db() -> None:
    """
    Fermer la connexion à la base de données.

    À appeler lors de l'arrêt de l'application.
    """
    try:
        engine.dispose()
        print("✓ Connexion à la base de données fermée")
    except Exception as e:
        print(f"✗ Erreur lors de la fermeture de la connexion: {e}")
