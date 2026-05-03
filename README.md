# 🔐 App Auth Faciale

Système d'authentification par reconnaissance faciale avec FastAPI et React/Vite.

## 📋 Table des matières

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Architecture](#architecture)
- [Flux d'utilisation](#flux-dutilisation)

## 🔧 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Python 3.9+** - [Télécharger](https://www.python.org/)
- **Node.js 18+** - [Télécharger](https://nodejs.org/)
- **PostgreSQL 12+** - [Télécharger](https://www.postgresql.org/)
- **Git** - [Télécharger](https://git-scm.com/)

### Vérifier les versions installées

```bash
python --version
node --version
npm --version
```

## 📦 Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/ISM-O/app-auth-faciale.git
cd app-auth-faciale
```

### 2. Configuration Backend

#### 2.1 Créer un environnement virtuel Python

```bash
cd backend
python -m venv venv

# Activation (Windows)
venv\Scripts\activate

# Activation (Linux/Mac)
source venv/bin/activate
```

#### 2.2 Installer les dépendances Python

```bash
pip install -r requirements.txt
```

#### 2.3 Configurer les variables d'environnement

Créez un fichier `.env` dans le dossier `backend/` :

```env
# Base de données PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/face_auth_db
DEBUG=True
APP_NAME=Face Authentication API
VERSION=1.0.0

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**⚠️ Important:** Remplacez `username`, `password` et les URLs par vos propres informations.

### 3. Configuration Frontend

#### 3.1 Installer les dépendances Node.js

```bash
cd ../frontend
npm install
```

#### 3.2 Configurer les variables d'environnement

Créez un fichier `.env.local` dans le dossier `frontend/` :

```env
VITE_API_BASE_URL=http://localhost:5000
```

## 🗄️ Base de données

### Créer la base de données PostgreSQL

```bash
psql -U postgres

# Dans psql:
CREATE DATABASE face_auth_db;
CREATE USER face_user WITH PASSWORD 'your_password';
ALTER ROLE face_user SET client_encoding TO 'utf8';
ALTER ROLE face_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE face_user SET default_transaction_deferrable TO on;
ALTER ROLE face_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE face_auth_db TO face_user;
\q
```

Les tables se créeront automatiquement au premier démarrage du backend.

## 🚀 Démarrage

### Terminal 1 : Démarrer le Backend

```bash
cd backend

# Activer l'environnement virtuel (si pas déjà activé)
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Démarrer le serveur FastAPI
python main.py
```

Le serveur démarrera sur `http://localhost:5000`

✅ Vous verrez :

```
Uvicorn running on http://127.0.0.1:5000 (Press CTRL+C to quit)
```

### Terminal 2 : Démarrer le Frontend

```bash
cd frontend

# Démarrer le serveur de développement Vite
npm run dev
```

Le frontend démarrera sur `http://localhost:5173` (ou un port disponible)

✅ Vous verrez :

```
VITE v8.0.10  ready in XXX ms
➜  Local:   http://localhost:5173/
```

## 🌐 Accéder à l'application

Ouvrez votre navigateur et allez sur :

```
http://localhost:5173
```

## 🏗️ Architecture

```
app-auth-faciale/
├── backend/
│   ├── api/
│   │   └── user.py           # Routes d'authentification
│   ├── model/
│   │   └── user.py           # Modèles SQLAlchemy et Pydantic
│   ├── db/
│   │   └── db.py             # Configuration base de données
│   ├── pipeline/
│   │   └── compare.py        # Comparaison des vecteurs faciaux
│   ├── main.py               # Application FastAPI
│   ├── config.py             # Configuration
│   └── requirements.txt       # Dépendances Python
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx      # Composant connexion
│   │   │   └── Register.jsx   # Composant inscription
│   │   ├── services/
│   │   │   ├── api.js         # Appels API
│   │   │   └── face.js        # Utilisation face-api.js
│   │   └── faceDetection.js   # Détection faciale
│   ├── public/
│   │   └── models/            # Modèles face-api.js
│   └── package.json           # Dépendances Node.js
│
└── README.md
```

## 📱 Flux d'utilisation

### 🔐 Inscription

1. Remplissez votre nom complet et email
2. Capturez une photo de votre visage avec la webcam
3. Le système extrait le vecteur facial (descripteur)
4. Les données sont envoyées au backend
5. ✅ Succès : Compte créé | ❌ Email déjà utilisé

### 🔑 Connexion

1. Entrez votre email
2. Capturez une photo de votre visage
3. Le système compare le vecteur facial avec celui en base de données
4. ✅ Succès : Connexion acceptée | ❌ Visage non reconnu

## 🛠️ Commandes utiles

### Backend

```bash
# Générer requirements.txt
pip freeze > requirements.txt

# Exécuter les tests
pytest

# Format du code
black . --line-length=100
```

### Frontend

```bash
# Lancer le développement
npm run dev

# Construire pour la production
npm run build

# Vérifier le code avec ESLint
npm run lint

# Prévisualiser la build
npm run preview
```

## 🔍 Dépannage

### Erreur : "Connection refused on localhost:5000"

- Assurez-vous que le backend est en cours d'exécution
- Vérifiez que le port 5000 est disponible

### Erreur : "Failed to resolve import 'face-api.js'"

- Exécutez `npm install face-api.js` dans le dossier frontend

### Erreur de base de données

- Vérifiez votre fichier `.env` dans le backend
- Assurez-vous que PostgreSQL est en cours d'exécution
- Vérifiez les identifiants de connexion

### Les modèles face-api.js ne se chargent pas

- Téléchargez les modèles dans `frontend/public/models/`
- Téléchargez depuis : [face-api.js models](https://github.com/justadudewhohacks/face-api.js/tree/master/weights)

## 📝 Variables d'environnement

### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/face_auth_db
DEBUG=True
APP_NAME=Face Authentication API
VERSION=1.0.0
ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (.env.local)

```env
VITE_API_BASE_URL=http://localhost:5000
```

## 🔒 Sécurité

- Les descripteurs faciaux sont stockés de manière sécurisée en base de données
- La distance euclidienne entre les vecteurs est calculée avec un seuil de 0.5
- Les données sont validées côté backend avec Pydantic
- CORS est configuré pour accepter les requêtes du frontend

---

**Bon développement ! 🚀**
