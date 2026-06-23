from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Dict, Any
import datetime
from ..db.database import get_db
from ..models import Patient, Panel, User
from ..auth.guards import get_current_clinician_or_admin

router = APIRouter(prefix="/patients", tags=["patients"])

@router.get("/")
def get_patients(db: Session = Depends(get_db), current_user: User = Depends(get_current_clinician_or_admin)):
    patients = db.query(Patient).order_by(desc(Patient.created_at)).all()
    
    result = []
    for p in patients:
        # Get the latest panel for this patient
        latest_panel = db.query(Panel).filter(Panel.patient_id == p.id).order_by(desc(Panel.created_at)).first()
        
        progress = {"observed": 0, "imputed": 0, "toImpute": 0}
        badges = []
        status = "New"
        statusColor = "default"
        demographics = "Unknown"
        dataset = "Custom"
        
        if latest_panel:
            status = "Imputed"
            statusColor = "success"
            
            observed_data = latest_panel.observed_data or {}
            imputed_data = latest_panel.imputed_data or {}
            imputed_dict = imputed_data.get("imputed", {})
            
            observed_count = len(observed_data.keys())
            imputed_count = len(imputed_dict.keys())
            to_impute = max(0, 38 - observed_count - imputed_count)
            
            progress = {
                "observed": observed_count,
                "imputed": imputed_count,
                "toImpute": to_impute
            }
            
            if imputed_count > 0:
                badges.append({"label": f"{imputed_count} variables inferred", "color": "success"})
            else:
                status = "Ready"
                statusColor = "info"
                
            # Try to extract Age and Gender from observed data
            age = observed_data.get("Age")
            gender_val = observed_data.get("Gender")
            if age is not None or gender_val is not None:
                age_str = f"{int(age)}" if age is not None else "?"
                gender_str = "M" if gender_val == 1.0 else ("F" if gender_val == 0.0 else "?")
                demographics = f"{age_str}{gender_str}"
        
        # Calculate time string
        now = datetime.datetime.utcnow()
        time_diff = now - p.created_at
        
        if time_diff.days > 0:
            time_str = f"{time_diff.days} d ago"
        elif time_diff.seconds > 3600:
            time_str = f"{time_diff.seconds // 3600} h ago"
        elif time_diff.seconds > 60:
            time_str = f"{time_diff.seconds // 60} min ago"
        else:
            time_str = "Just now"
            
        result.append({
            "id": p.patient_identifier,
            "status": status,
            "statusColor": statusColor,
            "demographics": demographics,
            "diagnosis": "Not specified", 
            "progress": progress,
            "badges": badges,
            "time": time_str,
            "dataset": dataset,
            "observed_data": latest_panel.observed_data if latest_panel else {},
            "imputed_data": latest_panel.imputed_data if latest_panel else None
        })
        
    return result
