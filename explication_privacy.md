# Explication du Système de Confidentialité (Privacy Audit)

Ce document explique le fonctionnement complet du système de rapport de confidentialité (Privacy Report), de la génération des données côté Backend (Python) à leur affichage côté Frontend (React).

Ce système sert à prouver que le modèle d'Intelligence Artificielle utilisé (par exemple pour l'imputation de données) est sûr, qu'il protège la vie privée des patients, et qu'il n'a pas mémorisé de données sensibles.

---

## 1. Le Backend (Génération des données et API)

Le backend est responsable de simuler/calculer les métriques de sécurité et de les mettre à disposition de manière sécurisée. Il est divisé en deux parties : le script d'audit et la route de l'API.

### A. Le script d'audit : `backend/scripts/run_privacy_audit.py`
C'est un script Python indépendant qui génère les résultats de l'audit et les sauvegarde dans un fichier JSON. 

**Fonction principale utilisée : `generate_privacy_report()`**
Voici ce qu'elle fait étape par étape :
1. **Configuration DP-SGD (Differential Privacy)** : Elle définit les paramètres mathématiques de confidentialité qui auraient été utilisés lors de l'entraînement du modèle (Epsilon, Delta, Clipping norm).
2. **Membership Inference Attack (MIA)** : Elle génère un score (AUC = 0.512) simulant une attaque de pirates essayant de deviner si un patient faisait partie des données d'entraînement. Un score proche de 0.5 est excellent.
3. **Traceability (NN-Distance)** : Elle utilise `numpy.random.normal()` pour générer deux jeux de données statistiques simulant les distances entre les données (vraies données VS données générées). Cela sert à prouver que l'IA ne fait pas de simples "copier-coller".
4. **Sauvegarde** : Elle écrit toutes ces informations, avec la date et l'heure du jour, dans le fichier `backend/scripts/privacy_report.json`.

### B. L'API : `backend/app/routers/privacy.py`
C'est le serveur web (construit avec FastAPI) qui permet au Frontend de venir lire les résultats de l'audit.

**Fonction utilisée : `get_privacy_report(current_user)`**
* **Route :** `GET /privacy/report`
* **Sécurité :** Elle utilise `Depends(get_current_researcher_or_admin)`. Cela signifie qu'elle agit comme un garde du corps : la fonction ne s'exécute **que** si l'utilisateur qui fait la demande est connecté et possède le rôle "Chercheur" (Researcher) ou "Administrateur" (Admin).
* **Action :** Elle va chercher le fichier `privacy_report.json` créé par le script précédent.
  * Si le fichier existe, elle le lit avec `json.load()` et l'envoie au Frontend.
  * S'il n'existe pas, elle renvoie une erreur 404 au Frontend ("Privacy report not found").

---

## 2. Le Frontend (Affichage des données)

Le Frontend récupère les données fournies par l'API et les transforme en un beau tableau de bord (Dashboard) visuel et compréhensible.

### Fichier : `frontend-unified/src/pages/PrivacyReportPage.jsx`

C'est un composant React qui s'occupe de toute la page "Privacy Report".

**Fonctions principales utilisées :**

1. **`fetchReport()`**
   * Elle est déclenchée automatiquement à l'ouverture de la page grâce au hook React `useEffect()`.
   * Elle récupère le "token" (le badge d'accès) de l'utilisateur stocké dans le navigateur.
   * Elle fait une requête réseau (`fetch`) vers `http://localhost:8000/privacy/report` en fournissant le token.
   * Elle gère les erreurs : si le rapport n'existe pas (404), elle affiche une alerte. Sinon, elle stocke les données dans la mémoire de la page (`setReportData`).

2. **`buildHistogramData(realArr, synthArr, binsCount)`**
   * C'est une fonction de calcul mathématique. 
   * L'API backend lui donne de simples listes de nombres (les distances NN-Distance). 
   * Cette fonction prend ces listes, calcule le minimum et le maximum, et découpe ces nombres en "bacs" (bins) pour que la librairie graphique puisse dessiner le graphique en courbes superposées de la carte "Traceability".

3. **`handleExport()`**
   * Elle est attachée au bouton "Export report" en haut de la page.
   * Elle prend les données du rapport (`reportData`), les transforme en texte JSON, crée un faux lien de téléchargement invisible, clique dessus automatiquement pour lancer le téléchargement sur le PC de l'utilisateur, et supprime le lien.

### Résumé de l'Affichage (Les Cartes)
Une fois les données chargées, le code JSX dessine trois zones principales :
* **Bannière Principale :** Devient verte (succès) si le score MIA est inférieur à la cible. Sinon, elle devient orange.
* **Carte MIA (Jauge) :** Dessine un demi-cercle avec `recharts` pour visualiser le score d'attaque (ici 0.512, ce qui est très proche de l'idéal qui est 0.5).
* **Carte Traceability (Courbes) :** Dessine les données traitées par `buildHistogramData` pour comparer les vraies données et les données de l'IA.
* **Carte DP-SGD (Textes) :** Affiche simplement les variables envoyées par le backend (Epsilon: 2.5, Delta: 1e-5).
