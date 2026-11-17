from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class RollbackEventBase(BaseModel):
    trigger_reason: str
    triggered_by: str  # AUTOMATED_METRIC_VIOLATION, SECURITY_GATE_FAILURE, MANUAL_OVERRIDE
    violation_details: Optional[Dict[str, Any]] = None
    status: str = "COMPLETED"


class RollbackEventCreate(RollbackEventBase):
    deployment_id: str


class RollbackEventRead(RollbackEventBase):
    id: str
    deployment_id: str
    executed_at: datetime

    model_config = ConfigDict(from_attributes=True)

