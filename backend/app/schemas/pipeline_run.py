from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class PipelineRunBase(BaseModel):
    jenkins_build_number: int
    jenkins_build_url: str
    git_commit_hash: str
    git_commit_message: Optional[str] = None
    status: str = "QUEUED"
    stage_durations: Dict[str, Any] = {}


class PipelineRunCreate(PipelineRunBase):
    application_id: str
    deployment_id: Optional[str] = None


class PipelineRunRead(PipelineRunBase):
    id: str
    application_id: str
    deployment_id: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

