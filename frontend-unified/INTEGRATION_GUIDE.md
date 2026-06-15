# 🚀 Frontend Unifié - Documentation Intégration

## ✅ Implémentation Complète

Le **Frontend unifié** a été créé avec succès en fusionnant le meilleur des deux frontends existants !

### 📍 Localisation

```
c:\Projet PFA\frontend-unified\
```

### 🎯 Résumé de l'Intégration

Vous aviez deux frontends :

1. **Frontend 1** (`c:\Projet PFA\frontend\`) : MUI configuré ✓
2. **Frontend 2** (`PRO1\PRO1\Frontend\vite-project\`) : Architecture réutilisable ✓

Le nouveau **frontend-unified** combine :

- ✅ **Architecture réutilisable** du Frontend 2 (services, hooks, composants modulaires)
- ✅ **MUI + Phosphor Icons** comme demandé par le prof
- ✅ **React Router** pour la navigation propre
- ✅ **Face-API** pour reconnaissance faciale (du Frontend 1)
- ✅ **Connexion au backend** Python (`http://localhost:5000`)

---

## 🏗️ Architecture

```
frontend-unified/
├── public/models/              ← Modèles TensorFlow.js (face-api)
├── src/
│   ├── services/
│   │   ├── apiClient.js        ← Axios + interceptors
│   │   ├── authService.js      ← /register, /login/password, /login/face
│   │   └── faceAuthService.js  ← Face Recognition + face-api
│   ├── hooks/
│   │   └── useAuth.jsx         ← Context + hook pour state utilisateur
│   ├── components/             ← Composants MUI réutilisables
│   │   ├── AuthTextField.jsx   ← Input générique MUI
│   │   ├── PasswordField.jsx   ← Input password avec eye icon Phosphor
│   │   ├── FaceIdButton.jsx    ← Button Face ID avec Camera icon
│   │   ├── FaceIdModal.jsx     ← Dialog MUI pour capture Face ID
│   │   └── AuthCard.jsx        ← Container Card pour formulaires
│   ├── pages/
│   │   ├── LoginPage.jsx       ← Connexion email/password/Face ID
│   │   ├── RegisterPage.jsx    ← Inscription + enrôlement Face ID
│   │   └── HomePage.jsx        ← Dashboard après authentification
│   ├── router/
│   │   ├── router.jsx          ← Configuration React Router
│   │   └── ProtectedRoute.jsx  ← Guard pour routes protégées
│   ├── theme/
│   │   ├── theme.js            ← MUI theme global (Northwind Health colors)
│   │   └── GlobalStyles.jsx    ← CSS global
│   ├── App.jsx                 ← App principal
│   ├── main.jsx                ← Point d'entrée
│   └── index.css               ← Styles globaux
├── package.json                ← Dépendances (MUI, Phosphor, face-api, etc.)
├── vite.config.js              ← Config Vite
├── index.html
├── README.md
└── .env.example

```

---

## 🎨 Composants Réutilisables avec MUI

### **1. AuthTextField** - Input générique

```jsx
<AuthTextField
  label="Email"
  type="email"
  value={email}
  onChange={handleChange}
  error={!!errorEmail}
  helperText={errorEmail}
/>
```

### **2. PasswordField** - Input password avec toggle visibility

```jsx
<PasswordField
  label="Password"
  value={password}
  onChange={handleChange}
  error={!!errorPassword}
/>
```

### **3. FaceIdButton** - Bouton Face ID

```jsx
<FaceIdButton onClick={handleFaceIdClick} />
```

### **4. FaceIdModal** - Dialog pour capture Face ID

```jsx
<FaceIdModal
  open={modalOpen}
  onClose={() => setModalOpen(false)}
  onCapture={handleFaceCapture}
  mode="login" // ou "register"
/>
```

### **5. AuthCard** - Conteneur pour formulaires

```jsx
<AuthCard title="Sign in" subtitle="Welcome back">
  {/* Contenu */}
</AuthCard>
```

---

## 🔐 Authentification - Flux Complet

### **Endpoint Backend** : `http://localhost:5000`

#### **1. Vérification Email**

```javascript
POST /check-email
{ "email": "user@example.com" }
Response: { "email_exists": true, "face_id_enrolled": true }
```

#### **2. Inscription**

```javascript
POST /register
{
  "nom_complet": "John Doe",
  "email": "user@example.com",
  "password": "SecurePassword123",
  "face_descriptor": [0.123, 0.456, ...],  // Optional
  "is_admin": false
}
```

#### **3. Connexion Password**

```javascript
POST /login/password
{ "email": "user@example.com", "password": "SecurePassword123" }
Response: { "access_token": "...", "user": {...} }
```

#### **4. Connexion Face ID**

```javascript
POST /login/face
{
  "email": "user@example.com",
  "face_descriptor": [0.123, 0.456, ...]  // 128D vector
}
Response: { "access_token": "...", "user": {...} }
```

---

## 🎨 Thème Northwind Health

**Couleurs primaires** :

- 🟢 Vert teal : `#12B589`
- ⚪ Blanc : `#FFFFFF`
- 🔘 Gris : `#64748B`

**Responsive Design** :

- 📱 Mobile (xs) : < 600px
- 📱 Tablet (sm) : 600px - 900px
- 💻 Desktop (md) : 900px+

---

## 🚀 Démarrage

### 1️⃣ Installer les dépendances

```bash
cd c:\Projet PFA\frontend-unified
npm install --legacy-peer-deps
```

### 2️⃣ Créer `.env`

```bash
# Copier depuis .env.example
cp .env.example .env
```

### 3️⃣ Démarrer le serveur de développement

```bash
npm run dev
```

App disponible sur : `http://localhost:5173` (ou `5174` si 5173 est occupé)

### 4️⃣ Build pour production

```bash
npm run build
```

Output dans `dist/` folder

---

## 📋 Dépendances Principales

| Package                   | Version | Usage            |
| ------------------------- | ------- | ---------------- |
| **React**                 | 19.2.5  | Core framework   |
| **react-router-dom**      | 7.0.0   | Routing          |
| **@mui/material**         | 6.1.5   | UI Components    |
| **@phosphor-icons/react** | 2.1.10  | Icons            |
| **axios**                 | 1.7.5   | HTTP client      |
| **@vladmandic/face-api**  | 1.7.15  | Face Recognition |
| **react-webcam**          | 7.2.0   | Camera access    |

---

## ✨ Fonctionnalités

### ✅ Pages Implémentées

1. **LoginPage** (`/login`)
   - Email + Password login
   - Face ID authentication
   - Email verification avant Face ID
   - Lien "Contact administrator"

2. **RegisterPage** (`/register`)
   - Formulaire multi-étapes (Stepper)
   - Étape 1: Détails compte
   - Étape 2: Enrôlement Face ID (optionnel)
   - Étape 3: Confirmation
   - Lien "Sign in"

3. **HomePage** (`/home` ou `/`)
   - Dashboard après authentification
   - Affichage utilisateur connecté
   - Bouton Sign Out

### ✅ Sécurité

- 🔐 Token JWT stocké en `localStorage`
- 🔐 Bearer token automatiquement ajouté aux requêtes
- 🔐 Redirect vers login si token expiré (401)
- 🔐 Routes protégées avec `ProtectedRoute`

### ✅ Face Recognition

- 📷 Webcam accès + préview live
- 🟢 Cercle d'alignement visage
- ✓ Extraction vecteur facial 128D
- 🔄 Comparaison avec distance < 0.4
- ✅ Enrôlement + authentification

---

## 🔧 Variables d'Environnement

`.env.example` :

```
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Northwind Health
```

Copier et adapter en `.env` selon votre configuration.

---

## 📊 État du Projet

| Tâche                | Status |
| -------------------- | ------ |
| Structure créée      | ✅     |
| Services API         | ✅     |
| Composants MUI       | ✅     |
| Pages                | ✅     |
| Routing              | ✅     |
| Thème global         | ✅     |
| Face-API intégré     | ✅     |
| npm install réussi   | ✅     |
| Serveur Vite démarre | ✅     |

---

## 🎯 Prochaines Étapes (Optionnel)

1. **Testing** :
   - Ajouter Vitest + React Testing Library
   - Tests unitaires pour composants
   - Tests d'intégration pour flows auth

2. **TypeScript** (Optionnel mais recommandé) :
   - Migrer `.jsx` → `.tsx`
   - Ajouter type safety

3. **Déploiement** :
   - Build : `npm run build`
   - Déployer `dist/` folder sur Vercel, Netlify, ou serveur

4. **Améliorations UI** :
   - Ajouter animations Framer Motion
   - Dark mode theme
   - Notifications toast

---

## 📝 Notes Importantes

### ❗ Configuration Backend

Assurez-vous que le backend Python démarre sur le port 5000 :

```bash
cd c:\Projet PFA\backend
python main.py
# ou
uvicorn main:app --reload --port 5000
```

### ❗ CORS

Le backend doit avoir CORS activé pour `http://localhost:5173` (ou `5174`)

### ❗ Base de Données

Backend doit être connecté à PostgreSQL (voir `DATABASE_URL` env var)

---

## 🆘 Troubleshooting

### Erreur : "Cannot find module '@mui/material'"

```bash
npm install --legacy-peer-deps
```

### Erreur : "Port 5173 in use"

Vite cherchera automatiquement le port `5174`, `5175`, etc.

### Face-API Models Not Loading

Assurez-vous que les fichiers modèles sont dans `public/models/`

### Login Fails

Vérifiez que le backend démarre sur `http://localhost:5000` et CORS est activé

---

## 📞 Support

Pour toute question ou problème :

1. Vérifiez la console browser (F12)
2. Vérifiez les logs terminal npm
3. Assurez-vous que backend est en cours d'exécution
4. Vérifiez les variables d'environnement

---

**Status** : ✅ **Prêt pour développement**

Vous pouvez maintenant :

- ✅ Lancer le frontend avec `npm run dev`
- ✅ Tester les formulaires login/register
- ✅ Tester Face ID (capture + authentification)
- ✅ Développer des nouvelles pages/composants

Le nouveau frontend offre une architecture moderne, modulaire et facile à maintenir ! 🚀
