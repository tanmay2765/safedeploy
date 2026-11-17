from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class SecurityFindingBase(BaseModel):
    vulnerability_id: str
    severity: str
    package_name: Optional[str] = None
    installed_version: Optional[str] = None
    fixed_version: Optional[str] = None
    description: Optional[str] = None
    file_path: Optional[str] = None
    line_number: Optional[int] = None


class SecurityFindingCreate(SecurityFindingBase):
    pass


class SecurityFindingRead(SecurityFindingBase):
    id: str
    security_scan_id: str

    model_config = ConfigDict(from_attributes=True)


class SecurityScanBase(BaseModel):
    scanner_type: str  # SEMGREP, TRIVY
    scan_target: str
    status: str = "PASSED"
    critical_count: int = 0
    high_count: int = 0
    medium_count: int = 0
    low_count: int = 0


class SecurityScanCreate(SecurityScanBase):
    deployment_id: str
    raw_report_json: Optional[Dict[str, Any]] = None
    findings: List[SecurityFindingCreate] = []


class SecurityScanRead(SecurityScanBase):
    id: str
    deployment_id: str
    executed_at: datetime
    findings: List[SecurityFindingRead] = []

    model_config = ConfigDict(from_attributes=True)

