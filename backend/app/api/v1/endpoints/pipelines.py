from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.pipeline_run import PipelineRunCreate, PipelineRunRead
from app.services.pipeline_service import PipelineService

router = APIRouter(prefix="/pipelines", tags=["CI/CD Pipelines"])


@router.get("", response_model=List[PipelineRunRead])
async def list_pipelines(
    application_id: Optional[str] = Query(None, description="Filter by Application ID"),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve CI/CD pipeline execution history."""
    return await PipelineService.get_all(db, application_id=application_id, limit=limit)


@router.post("", response_model=PipelineRunRead, status_code=status.HTTP_201_CREATED)
async def create_pipeline_run(
    run_in: PipelineRunCreate,
    db: AsyncSession = Depends(get_db),
):
    """Register or log a pipeline run."""
    return await PipelineService.create(db, run_in)


@router.get("/{run_id}", response_model=PipelineRunRead)
async def get_pipeline_run(run_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch details and stage breakdown for a specific pipeline execution."""
    run = await PipelineService.get_by_id(db, run_id)
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pipeline run not found")
    return run


@router.post("/webhook/jenkins", status_code=status.HTTP_200_OK)
async def jenkins_webhook(
    payload: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
):
    """Webhook callback receiver for Jenkins pipeline execution updates."""
    result = await PipelineService.handle_jenkins_webhook(db, payload)
    if not result:
        return {"status": "ignored", "message": "Missing application_id or invalid payload"}
    return {"status": "processed", "pipeline_run_id": result.id}

