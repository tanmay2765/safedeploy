from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.deployment import (
    DeploymentCreate,
    DeploymentRead,
    DeploymentDetail,
    CanaryPromoteRequest,
    RollbackRequest,
)
from app.schemas.metric_record import MetricRecordRead
from app.services.deployment_service import DeploymentService
from app.services.metric_service import MetricService

router = APIRouter(prefix="/deployments", tags=["Deployments"])


@router.get("", response_model=List[DeploymentRead])
async def list_deployments(
    application_id: Optional[str] = Query(None, description="Filter by Application ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List deployment operations across applications."""
    return await DeploymentService.get_all(db, application_id=application_id, status=status, limit=limit)


@router.post("", response_model=DeploymentRead, status_code=status.HTTP_201_CREATED)
async def create_deployment(
    dep_in: DeploymentCreate,
    db: AsyncSession = Depends(get_db),
):
    """Trigger a new deployment release."""
    return await DeploymentService.create(db, dep_in)


@router.get("/{dep_id}", response_model=DeploymentDetail)
async def get_deployment(dep_id: str, db: AsyncSession = Depends(get_db)):
    """Get full deployment state including scans, metrics, and rollback history."""
    dep = await DeploymentService.get_by_id(db, dep_id)
    if not dep:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deployment not found")
    return dep


@router.post("/{dep_id}/promote", response_model=DeploymentRead)
async def promote_canary(
    dep_id: str,
    payload: CanaryPromoteRequest,
    db: AsyncSession = Depends(get_db),
):
    """Promote canary deployment weight (5% -> 20% -> 50% -> 100%)."""
    dep = await DeploymentService.get_by_id(db, dep_id)
    if not dep:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deployment not found")
    if dep.status in ["COMPLETED", "ROLLED_BACK", "FAILED"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot promote deployment in '{dep.status}' state",
        )
    return await DeploymentService.promote(db, dep, target_weight=payload.target_weight)


@router.post("/{dep_id}/rollback", response_model=DeploymentRead)
async def trigger_rollback(
    dep_id: str,
    payload: RollbackRequest,
    db: AsyncSession = Depends(get_db),
):
    """Manually abort canary rollout and restore stable deployment."""
    dep = await DeploymentService.get_by_id(db, dep_id)
    if not dep:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deployment not found")
    if dep.status == "ROLLED_BACK":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deployment is already rolled back",
        )
    return await DeploymentService.trigger_rollback(
        db,
        dep,
        reason=payload.reason,
        triggered_by="MANUAL_OVERRIDE",
    )


@router.get("/{dep_id}/metrics", response_model=List[MetricRecordRead])
async def get_deployment_metrics(dep_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch all recorded metric checks for a deployment."""
    return await MetricService.get_by_deployment(db, dep_id)

