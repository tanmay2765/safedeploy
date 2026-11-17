from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, ConfigDict


class ThresholdConfig(BaseModel):
    max_error_rate_percent: float = Field(default=1.0, description="Max allowable 5xx error percentage")
    max_p99_latency_ms: float = Field(default=300.0, description="Max allowable P99 latency in ms")
    security_gate_fail_on: List[str] = Field(default=["CRITICAL", "HIGH"], description="Vulnerability levels that block rollout")


class ApplicationBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=100)
    repository_url: str = Field(..., max_length=255)
    git_branch: str = Field(default="main", max_length=100)
    k8s_namespace: str = Field(default="default", max_length=63)
    threshold_config: Optional[ThresholdConfig] = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    name: Optional[str] = None
    repository_url: Optional[str] = None
    git_branch: Optional[str] = None
    k8s_namespace: Optional[str] = None
    threshold_config: Optional[ThresholdConfig] = None
    is_active: Optional[bool] = None


class ApplicationRead(ApplicationBase):
    id: str
    is_active: bool
    threshold_config: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

