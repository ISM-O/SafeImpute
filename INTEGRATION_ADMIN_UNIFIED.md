# Integration du Dashboard Admin dans Frontend-Unified

## Résumé des modifications

Le `frontend-admin` a été complètement intégré dans le `frontend-unified`. La redirection entre le dashboard admin et le dashboard utilisateur est maintenant basée sur la propriété `is_superadmin` de l'utilisateur.

## Structure du Routing

### 1. **Route Racine (`/`)**

- Utilise `RoleBasedRedirect.jsx` pour déterminer où envoyer l'utilisateur
- Les utilisateurs authentifiés avec `is_superadmin=true` → `/admin/dashboard`
- Les utilisateurs authentifiés avec `is_superadmin=false` → `/home`
- Les utilisateurs non authentifiés → `/login`

### 2. **Routes Publiques**

- `/login` - Page de connexion (pour tous)
- `/register` - Page d'inscription (pour tous)

### 3. **Routes Utilisateur (Protégées)**

```
/home - Dashboard utilisateur
/consultations - Historique des consultations
/results - Résultats des consultations
/settings - Paramètres utilisateur
```

- Protégées par `ProtectedRoute`
- Accessibles uniquement si l'utilisateur est authentifié

### 4. **Routes Admin (Doublement Protégées)**

```
/admin/dashboard - Dashboard administrateur
/admin/users - Gestion des utilisateurs
/admin/audit-logs - Journaux d'audit
```

- Protégées par `AdminProtectedRoute`
- Accessibles uniquement si:
  1. L'utilisateur est authentifié
  2. L'utilisateur a `is_superadmin=true`

## Backend - Modifications

### Endpoint de connexion (`/login/password` et `/login/face`)

Le backend retourne maintenant:

```json
{
  "access_token": "token...",
  "token_type": "bearer",
  "user": {
    "nom_complet": "...",
    "mail": "...",
    "is_superadmin": true/false,
    "role": "admin" ou "user"
  }
}
```

**Important:** `is_superadmin` est maintenant inclus dans les réponses d'authentification.

## Frontend - Modifications

### 1. **Fichiers Créés**

- `src/layout/AdminLayout.jsx` - Layout pour les pages admin
- `src/pages/AdminDashboard.jsx` - Dashboard admin
- `src/pages/UsersManagement.jsx` - Gestion des utilisateurs
- `src/pages/AuditLogs.jsx` - Journaux d'audit
- `src/services/adminService.js` - Services API pour l'admin
- `src/router/RoleBasedRedirect.jsx` - Redirection basée sur le rôle

### 2. **Fichiers Modifiés**

- `src/router/ProtectedRoute.jsx` - Ajout de `AdminProtectedRoute`
- `src/router/router.jsx` - Intégration des routes admin
- `src/pages/LoginPage.jsx` - Redirection intelligente post-connexion
- `src/hooks/useAuth.jsx` - Maintenant expose `user.is_superadmin`

## Logique de Redirection

### À la Connexion

1. L'utilisateur se connecte via email/password ou Face ID
2. Le backend vérifie les credentials et retourne `is_superadmin`
3. Le `LoginPage` vérifie `is_superadmin`:
   - `true` → Redirige vers `/admin/dashboard`
   - `false` → Redirige vers `/home`

### À l'Accès de la Racine (`/`)

Le `RoleBasedRedirect` redirige vers:

- `/admin/dashboard` si `is_superadmin=true`
- `/home` si `is_superadmin=false`
- `/login` si non authentifié

### À l'Accès des Routes Admin

Le `AdminProtectedRoute` redirige vers:

- Affiche le contenu si l'utilisateur a `is_superadmin=true`
- Redirige vers `/home` si `is_superadmin=false`
- Redirige vers `/login` si non authentifié

## Utilisation du Hook useAuth

L'objet `user` du hook `useAuth` contient:

```javascript
{
  nom_complet: "...",
  mail: "...",
  is_superadmin: true/false,
  role: "admin" ou "user"
}
```

### Exemple d'usage:

```jsx
import { useAuth } from "../hooks/useAuth";

function MyComponent() {
  const { user } = useAuth();

  return (
    <div>
      {user?.is_superadmin && <AdminPanel />}
      {!user?.is_superadmin && <UserPanel />}
    </div>
  );
}
```

## Permissions & Access Control

### AdminProtectedRoute

- Vérifie l'authentification
- Vérifie `is_superadmin`
- Redirige les non-admins vers `/home`

### ProtectedRoute

- Vérifie l'authentification
- N'implémente pas de contrôle de rôle
- Permet à tous les utilisateurs authentifiés d'accéder

## Notes Importantes

1. **Pas de dossiers séparés**: Les pages admin et utilisateur sont maintenant dans la même application
2. **Un seul LoginPage**: La même page de connexion pour tous, avec redirection intelligente
3. **Contrôle d'accès centralisé**: Le `AdminProtectedRoute` empêche les utilisateurs non-admin d'accéder aux routes admin
4. **Cohérence des données**: L'objet `user` dans le contexte Auth contient toujours les infos à jour

## Déploiement

Aucune autre modification n'est nécessaire. L'application fonctionne maintenant avec:

1. Un seul build de frontend
2. Une navigation intelligente basée sur les rôles
3. Une protection des routes admin intégrée
