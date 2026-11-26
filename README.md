# SafeImpute

**Uncertainty-aware imputation of missing clinical lab values, with a differentially private variant and an empirical privacy audit.**

In intensive-care records, most laboratory values are missing at any given hour: in the PhysioNet 2019 cohort, **94.8% of lab values are missing on average**. Classical imputers (mean, k-NN, MICE) fill these gaps without saying how reliable each filled value is. SafeImpute uses a Masked Transformer that predicts, for every missing value, both an estimate and its uncertainty, and studies the privacy of the trained model.

SafeImpute started as a fourth-year academic project at ENSA Oujda (2025–2026) and includes a full web application (FastAPI + React) for clinicians and researchers.

---

## Results

All metrics are computed on **held-out patients** (20% of patients, never seen during training). In each held-out record, 20% of the observed values are hidden (fixed seed), imputed, and compared with the true values. Errors are in standardized units.

### Reconstruction accuracy

| Method | RMSE (all held-out records) | MAE | RMSE (10,000-record sample)\* |
|---|---|---|---|
| **Masked Transformer** | **0.799** | **0.568** | **0.813** |
| Masked Transformer, DP-SGD (ε = 8) | 0.849 | 0.587 | 0.862 |
| MICE | – | – | 0.837 |
| k-NN (k = 5) | – | – | 0.966 |
| Mean imputation | 0.992 | – | – |

\* k-NN and MICE are too slow on the 311,369 held-out records, so they are evaluated on a random sample of 10,000 records (seed 42). The two Transformer models are also evaluated on that exact sample, for a like-for-like comparison.

Differential privacy costs about 6% in RMSE. The private model stays close to MICE, while also providing a per-value uncertainty estimate and a formal privacy guarantee.

### Privacy audit

| | Standard model | DP-SGD model |
|---|---|---|
| Training-time guarantee | none | ε = 8.0, δ = 8.1 × 10⁻⁸ (per hourly record) |
| Membership-inference attack, AUC (0.5 = chance) | 0.500 | 0.506 |
| Median distance to closest training record: real panels / imputed panels | 0.874 / 0.974 | 0.815 / 0.821 |

- **Membership inference**: loss-threshold attack (Yeom et al., 2018) at the patient level, on 2,000 training patients vs. 2,000 held-out patients. Neither model lets the attacker tell them apart.
- **Distance to closest record**: imputed panels are not closer to training records than the real panels are, so there is no sign that the model copies training patients.
- **DP-SGD**: Opacus, per-sample gradient clipping (norm 1.0), noise multiplier 0.505, RDP accountant, 10 epochs.

These empirical tests do not prove that the standard model is private; only the DP-SGD model carries a formal guarantee.

---

## Method

- **Data**: [PhysioNet/Computing in Cardiology Challenge 2019](https://physionet.org/content/challenge-2019/) (training sets A and B). 38 variables per hourly record: 8 vital signs, 26 laboratory values and 4 demographic/admission variables. Patients are split 80/20 at the patient level (32,249 training / 8,063 held-out patients; 1,239,943 / 311,369 hourly records), so no patient appears in both sets.
- **Preprocessing**: standardization fitted on observed training values only; missing values are set to 0 after standardization and tracked with a binary mask.
- **Model**: Masked Transformer for tabular data (152,642 parameters, PyTorch). Each variable is a token (value embedding + feature embedding), followed by 3 self-attention layers (d_model 64, 4 heads). The output head predicts a mean and a variance (Softplus) for every variable.
- **Training**: 20% of the observed values are hidden at each step; the model is trained with a Gaussian negative log-likelihood on the hidden values only.
- **DP-SGD variant**: same architecture, with Opacus-compatible attention layers (`DPMultiheadAttention`), trained with per-sample gradient clipping and calibrated Gaussian noise.

---

## Repository structure

```
backend/
  app/                    FastAPI application
    ml/model.py           Masked Transformer and its DP-SGD variant
    ml/impute.py          Inference engine (standard or DP model)
    routers/              API routes: auth, users, patients, impute, evaluate, privacy, dashboard
  scripts/
    loaders.py            PhysioNet loading, patient-level split, Parquet cache
    train.py              Training of the standard model
    train_dp.py           Training with DP-SGD (Opacus)
    evaluate.py           RMSE / MAE of a model (--model standard|dp)
    evaluate_baselines.py Mean, k-NN and MICE baselines
    run_privacy_audit.py  Membership-inference attack and distance-to-closest-record audit
    models/               Trained weights, scaler, DP training metadata
    metrics.json          Evaluation results
    privacy_report*.json  Privacy audit results
frontend-unified/         React + Vite + MUI interface
docs/                     Project report (French), database schema, interface screenshots
explication_privacy.md    Detailed explanation of the privacy audit (French)
```

---

## Reproducing the results

Requires Python 3.10+. A GPU is recommended for training only.

```bash
cd backend
pip install -r requirements.txt
cd scripts

# The processed PhysioNet data is cached in scripts/data/processed (Parquet).
# To rebuild it, download the challenge data into dataset/training/training_setA and training_setB.

python train.py                         # standard model
python train_dp.py --epochs 10          # DP-SGD model (about 11 h on CPU, much faster on GPU)
python evaluate_baselines.py            # mean, k-NN, MICE
python evaluate.py                      # standard model
python evaluate.py --model dp
python run_privacy_audit.py             # -> privacy_report.json
python run_privacy_audit.py --model dp  # -> privacy_report_dp.json
```

The trained weights are included in `backend/scripts/models/`, so evaluation and the audit can be run without retraining.

## Running the web application

**Backend** (FastAPI + PostgreSQL). Create `backend/.env`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/safeimpute
SECRET_KEY=change-me
ALGORITHM=HS256
```

```bash
cd backend
python scripts/seed.py     # creates demo users (admin, clinician, researcher)
python run.py              # API on http://127.0.0.1:8000 (docs at /docs)
```

**Frontend**:

```bash
cd frontend-unified
npm install
npm run dev                # http://localhost:5173
```

In the interface, a **Standard / DP-SGD** selector lets users choose the model used for imputation and for the privacy report; the comparison page shows both models next to the baselines.

---

## Limitations

- Results come from a single public cohort and have not been validated clinically.
- The DP-SGD guarantee covers each hourly record, not each patient as a whole: a patient contributes several records, so their full chart is less protected than one record.
- The membership-inference and distance tests are empirical: stronger attacks could reveal more than these tests do.
- Interface screenshots in `docs/screenshots/` come from an earlier version of the application and show placeholder values, not the results above.

## Team

Fourth-year project, ENSA Oujda (Mohammed First University), 2025–2026.

- **Students**: Ismaël Gansonre, Mouctar Diallo, Félix Kiendrébéogo
- **Supervisors**: Prof. Rachid Naciri, Mohammed Rahmani (Engineer & Researcher)

Ismaël Gansonre co-developed the model, integrated inference and uncertainty estimation into the API, and contributed to the baseline comparisons. After the project (November 2026), he added the DP-SGD model, the evaluation of both models and the empirical privacy audit.
