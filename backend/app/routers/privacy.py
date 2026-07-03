from fastapi import APIRouter, Depends, HTTPException
import json
import os
from ..auth.guards import get_current_user
from ..models import User

router = APIRouter(prefix="/privacy", tags=["Privacy"])

@router.get("/report")
def get_privacy_report(current_user: User = Depends(get_current_user)):
    """
    Returns the cached privacy audit results from privacy_report.json
    """
    report_path = os.path.join(os.path.dirname(__file__), "..", "..", "scripts", "privacy_report.json")
    
    if not os.path.exists(report_path):
        raise HTTPException(status_code=404, detail="Privacy report not found. Run the audit script first.")
        
    try:
        with open(report_path, "r") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading privacy report: {str(e)}")
