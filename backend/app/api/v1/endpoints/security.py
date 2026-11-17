from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.security_scan import SecurityScanCreate, SecurityScanRead
from app.services.security_service import SecurityService

router = APIRouter(prefix="/security", tags=["Security Governance"])


@router.get("/scans", response_model=List[SecurityScanRead])
async def list_security_scans(
    deployment_id: Optional[str] = Query(None, description="Filter by deployment ID"),
    scanner_type: Optional[str] = Query(None, description="SEMGREP or TRIVY"),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve security scan reports."""
    return await SecurityService.get_scans(db, deployment_id=deployment_id, scanner_type=scanner_type, limit=limit)


@router.post("/scans/ingest", response_model=SecurityScanRead, status_code=status.HTTP_201_CREATED)
async def ingest_security_scan(
    scan_in: SecurityScanCreate,
    db: AsyncSession = Depends(get_db),
):
    """Ingest Semgrep SAST or Trivy container scan results from CI/CD pipeline."""
    return await SecurityService.ingest_scan(db, scan_in)


@router.get("/scans/{scan_id}", response_model=SecurityScanRead)
async def get_security_scan(scan_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch complete vulnerability report and individual findings."""
    scan = await SecurityService.get_scan_by_id(db, scan_id)
    if not scan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Security scan not found")
    return scan


@router.get("/stats")
async def get_security_statistics(db: AsyncSession = Depends(get_db)):
    """Aggregated vulnerability metrics across all scanned workloads."""
    return await SecurityService.get_aggregated_stats(db)

