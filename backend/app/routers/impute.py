from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..models import User, Patient, Panel, AuditLog
from ..db.database import get_db
from ..auth.guards import get_current_clinician_or_admin

router = APIRouter(prefix="/impute", tags=["imputation"])

class ImputeRequest(BaseModel):
    observed: Dict[str, float]
    mask: List[str]
    patient_id: Optional[str] = None

@router.post("/")
def impute_panel(request: ImputeRequest, current_user: User = Depends(get_current_clinician_or_admin), db: Session = Depends(get_db)):
    # Real ML Imputation
    try:
        from ..ml.impute import run_inference
        imputed_values, uncertainty_values = run_inference(request.observed, request.mask)
    except Exception as e:
        print(f"Inference error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
            
    # Database persistence
    if request.patient_id:
        patient = db.query(Patient).filter(Patient.patient_identifier == request.patient_id).first()
        if not patient:
            patient = Patient(patient_identifier=request.patient_id)
            db.add(patient)
            db.commit()
            db.refresh(patient)
            
        panel = Panel(
            patient_id=patient.id,
            clinician_id=current_user.id,
            observed_data=request.observed,
            imputed_data={"imputed": imputed_values, "uncertainty": uncertainty_values}
        )
        db.add(panel)
        db.commit()
        
    # Audit Logging
    audit_entry = AuditLog(
        user_id=current_user.id,
        action="IMPUTATION_PERFORMED",
        resource=f"Patient {request.patient_id}" if request.patient_id else "Unknown Patient Panel"
    )
    db.add(audit_entry)
    db.commit()
            
    return {
        "imputed": imputed_values,
        "uncertainty": uncertainty_values
    }
