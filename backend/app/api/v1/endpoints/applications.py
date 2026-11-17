from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationRead
from app.services.application_service import ApplicationService

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.get("", response_model=List[ApplicationRead])
async def list_applications(db: AsyncSession = Depends(get_db)):
    """List all registered microservices and delivery configurations."""
    return await ApplicationService.get_all(db)


@router.post("", response_model=ApplicationRead, status_code=status.HTTP_201_CREATED)
async def create_application(app_in: ApplicationCreate, db: AsyncSession = Depends(get_db)):
    """Register a new application with canary thresholds."""
    existing = await ApplicationService.get_by_slug(db, app_in.slug)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Application with slug '{app_in.slug}' already exists",
        )
    return await ApplicationService.create(db, app_in)


@router.get("/{app_id}", response_model=ApplicationRead)
async def get_application(app_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve details and threshold settings for an application."""
    app = await ApplicationService.get_by_id(db, app_id)
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return app


@router.put("/{app_id}", response_model=ApplicationRead)
async def update_application(app_id: str, app_in: ApplicationUpdate, db: AsyncSession = Depends(get_db)):
    """Update application parameters and rollback thresholds."""
    app = await ApplicationService.get_by_id(db, app_id)
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return await ApplicationService.update(db, app, app_in)


@router.delete("/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(app_id: str, db: AsyncSession = Depends(get_db)):
    """Remove an application from SafeDeploy registry."""
    app = await ApplicationService.get_by_id(db, app_id)
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    await ApplicationService.delete(db, app)

