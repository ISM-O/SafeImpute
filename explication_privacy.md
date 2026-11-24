# Explication du Système de Confidentialité (Privacy Audit)

Ce document explique le fonctionnement complet du système de rapport de confidentialité (Privacy Report), de la génération des données côté Backend (Python) à leur affichage côté Frontend (React).

Ce système sert à tester empiriquement si le modèle d'imputation a mémorisé des patients d'entraînement. Ces tests ne constituent pas une garantie formelle de confidentialité (seule une méthode comme DP-SGD en apporterait une).

---

## 1. Le Backend (Génération des données et API)

Le backend est responsable de calculer les métriques de sécurité et de les mettre à disposition de manière sécurisée. Il est divisé en deux parties : le script d'audit et la route de l'API.

### A. Le script d'audit : `backend/scripts/run_privacy_audit.py`
Script Python indépendant qui **calcule réellement** les métriques de confidentialité sur le modèle entraîné (`models/masked_transformer.pt`) et les données PhysioNet 2019, puis les sauvegarde dans `backend/scripts/privacy_report.json`. Toutes les graines aléatoires sont fixées (`SEED = 42`).

**Fonction principale : `run_audit()`**
1. **Membership Inference Attack (MIA), attaque par seuil de perte (Yeom et al., 2018)** : l'unité de confidentialité est le patient. Pour 2 000 patients d'entraînement (« membres ») et 2 000 patients jamais vus (« non-membres »), le script masque 20 % des valeurs observées (comme à l'entraînement) et calcule la NLL gaussienne moyenne du modèle par patient. Si le modèle avait mémorisé ses patients d'entraînement, leur perte serait plus faible. Le score d'attaque est −NLL ; on rapporte son AUC ROC. **Résultat actuel : AUC = 0.500**, l'attaquant ne distingue pas les membres des non-membres.
2. **Distance to Closest Record (DCR)** : pour 1 000 patients jamais vus, on compare deux versions du même panel à un jeu de référence d'entraînement (un enregistrement aléatoire par patient d'entraînement) : le panel réel (`real_to_real`) et le même panel après ré-imputation par le modèle de 20 % des valeurs observées (`imputed_to_train`). **Résultat actuel : distance médiane 0.874 (réel) contre 0.974 (imputé)** : les panels imputés ne sont pas plus proches des données d'entraînement que les panels réels, aucun signe de recopie.
3. **DP-SGD** : le modèle actuel **n'est pas** entraîné avec la confidentialité différentielle. Le rapport l'indique explicitement (`"enabled": false`) ; c'est un travail prévu.
4. **Sauvegarde** : le rapport (horodatage, graine, méthodes, résultats) est écrit dans `backend/scripts/privacy_report.json`.

Exécution : `cd backend/scripts && python run_privacy_audit.py` (environ 1 min 30 sur CPU).

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
* **Carte MIA (Jauge) :** Dessine un demi-cercle avec `recharts` pour visualiser le score d'attaque (actuellement 0.500, la valeur d'un attaquant qui répond au hasard).
* **Carte Traceability (Courbes) :** Dessine les données traitées par `buildHistogramData` pour comparer les vraies données et les données de l'IA.
* **Carte DP-SGD (Textes) :** Affiche « DP-SGD Off » tant que le modèle n'est pas entraîné avec la confidentialité différentielle ; affichera epsilon, delta et la norme d'écrêtage une fois DP-SGD implémenté.

---

## 3. Deux modèles : standard et DP-SGD

SafeImpute peut utiliser deux versions du même Masked Transformer (même architecture, 152 642 paramètres, mêmes données, même masquage de 20 %) :

| | Modèle standard | Modèle DP-SGD |
|---|---|---|
| Entraînement | `scripts/train.py` | `scripts/train_dp.py` (Opacus : écrêtage des gradients par exemple + bruit gaussien) |
| Poids | `models/masked_transformer.pt` | `models/masked_transformer_dp.pt` + `models/dp_training.json` (ε, δ, bruit, écrêtage) |
| Évaluation | `python evaluate.py` | `python evaluate.py --model dp` |
| Audit | `python run_privacy_audit.py` → `privacy_report.json` | `python run_privacy_audit.py --model dp` → `privacy_report_dp.json` |

Les deux modèles sont évalués et audités sur **exactement les mêmes patients et les mêmes valeurs masquées** (graine 42), ce qui permet de mesurer le coût du DP-SGD en précision (RMSE, MAE) et son effet sur l'attaque MIA.

**Unité de confidentialité** : un enregistrement (une ligne horaire). Un patient ayant plusieurs lignes, la garantie (ε, δ) porte sur un enregistrement, pas sur un patient entier ; c'est indiqué dans `dp_training.json`.

**Dans l'interface** : un sélecteur « Standard / DP-SGD » permet de choisir le modèle pour l'imputation (fenêtre du patient) et pour le rapport de confidentialité ; la page de comparaison affiche le modèle DP-SGD à côté du modèle standard dès qu'il a été évalué. Côté API : `POST /impute/` accepte `"model": "standard" | "dp"`, et `GET /privacy/report?model=dp`.

Ordre d'exécution pour le modèle DP (depuis `backend/scripts`, GPU recommandé) :
```bash
python train_dp.py                     # ε = 8 par défaut ; --target-epsilon 3 pour une garantie plus forte
python evaluate.py --model dp
python run_privacy_audit.py --model dp
```
