from datetime import datetime
from pydantic import BaseModel, ConfigDict


class MetricRecordBase(BaseModel):
    metric_name: str
    value: float
    threshold: float
    is_violation: bool = False
    phase: str


class MetricRecordCreate(MetricRecordBase):
    deployment_id: str


class MetricRecordRead(MetricRecordBase):
    id: str
    deployment_id: str
    recorded_at: datetime

    model_config = ConfigDict(from_attributes=True)

