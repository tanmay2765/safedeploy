from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.security_scan import SecurityScanRead
from app.schemas.metric_record import MetricRecordRead
from app.schemas.rollback_event import RollbackEventRead


class DeploymentBase(BaseModel):
    target_version: str = Field(..., max_length=64)
    previous_version: Optional[str] = Field(default=None, max_length=64)
    docker_image: str = Field(..., max_length=255)
    current_canary_weight: int = Field(default=0, ge=0, le=100)


class DeploymentCreate(DeploymentBase):
    application_id: str


class DeploymentUpdate(BaseModel):
    status: Optional[str] = None
    current_canary_weight: Optional[int] = None
    completed_at: Optional[datetime] = None


class DeploymentRead(DeploymentBase):
    id: str
    application_id: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class DeploymentDetail(DeploymentRead):
    security_scans: List[SecurityScanRead] = []
    metric_records: List[MetricRecordRead] = []
    rollback_events: List[RollbackEventRead] = []

    model_config = ConfigDict(from_attributes=True)


class CanaryPromoteRequest(BaseModel):
    target_weight: Optional[int] = Field(default=None, description="Optional target weight: 5, 20, 50, 100")


class RollbackRequest(BaseModel):
    reason: str = Field(..., min_length=3, description="Reason for initiating manual rollback")

