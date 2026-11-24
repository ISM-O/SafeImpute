from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
import json
import os
from ..auth.guards import get_current_user
from ..models import User

router = APIRouter(prefix="/privacy", tags=["Privacy"])

@router.get("/report")
def get_privacy_report(model: Literal["standard", "dp"] = "standard", current_user: User = Depends(get_current_user)):
    """
    Returns the cached privacy audit results of the requested model:
    privacy_report.json (standard) or privacy_report_dp.json (trained with DP-SGD).
    """
    name = "privacy_report.json" if model == "standard" else f"privacy_report_{model}.json"
    report_path = os.path.join(os.path.dirname(__file__), "..", "..", "scripts", name)

    if not os.path.exists(report_path):
        hint = "python run_privacy_audit.py" if model == "standard" else "python train_dp.py, then python run_privacy_audit.py --model dp"
        raise HTTPException(status_code=404, detail=f"Privacy report for the '{model}' model not found. Run: {hint}")
        
    try:
        with open(report_path, "r") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading privacy report: {str(e)}")
