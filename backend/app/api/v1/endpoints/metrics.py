from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.schemas.metric_record import MetricRecordCreate, MetricRecordRead
from app.schemas.rollback_event import RollbackEventRead
from app.models.rollback_event import RollbackEvent
from app.services.metric_service import MetricService

router = APIRouter(prefix="/metrics", tags=["Telemetry & Rollbacks"])


@router.post("/record", response_model=MetricRecordRead, status_code=status.HTTP_201_CREATED)
async def record_metric(
    metric_in: MetricRecordCreate,
    db: AsyncSession = Depends(get_db),
):
    """Ingest a deployment health metric check. Triggers automatic rollback on violation."""
    return await MetricService.record_metric(db, metric_in)


@router.get("/live/{deployment_id}")
async def get_live_telemetry(deployment_id: str):
    """Real-time Prometheus telemetry stream for canary vs stable pods."""
    return await MetricService.get_live_metrics_summary(deployment_id)


@router.get("/rollbacks", response_model=List[RollbackEventRead])
async def list_rollbacks(
    deployment_id: Optional[str] = Query(None, description="Filter by deployment ID"),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve audit log of automated and manual rollbacks."""
    stmt = select(RollbackEvent).order_by(RollbackEvent.executed_at.desc()).limit(limit)
    if deployment_id:
        stmt = stmt.where(RollbackEvent.deployment_id == deployment_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())

