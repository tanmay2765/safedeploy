from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.deployment import Deployment
from app.models.rollback_event import RollbackEvent
from app.models.application import Application
from app.schemas.deployment import DeploymentCreate


class DeploymentService:
    CANARY_STEPS = [0, 5, 20, 50, 100]

    @staticmethod
    async def get_all(
        session: AsyncSession,
        application_id: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 50,
    ) -> List[Deployment]:
        stmt = select(Deployment).order_by(Deployment.started_at.desc()).limit(limit)
        if application_id:
            stmt = stmt.where(Deployment.application_id == application_id)
        if status:
            stmt = stmt.where(Deployment.status == status)
        result = await session.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(session: AsyncSession, deployment_id: str) -> Optional[Deployment]:
        stmt = select(Deployment).where(Deployment.id == deployment_id)
        result = await session.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def create(session: AsyncSession, dep_in: DeploymentCreate) -> Deployment:
        deployment = Deployment(
            application_id=dep_in.application_id,
            target_version=dep_in.target_version,
            previous_version=dep_in.previous_version,
            docker_image=dep_in.docker_image,
            current_canary_weight=dep_in.current_canary_weight or 0,
            status="PENDING",
        )
        session.add(deployment)
        await session.commit()
        await session.refresh(deployment)
        return deployment

    @staticmethod
    async def promote(
        session: AsyncSession,
        deployment: Deployment,
        target_weight: Optional[int] = None,
    ) -> Deployment:
        current = deployment.current_canary_weight
        if target_weight is not None:
            new_weight = target_weight
        else:
            # Advance to next predefined step
            try:
                curr_idx = DeploymentService.CANARY_STEPS.index(current)
                new_idx = min(curr_idx + 1, len(DeploymentService.CANARY_STEPS) - 1)
                new_weight = DeploymentService.CANARY_STEPS[new_idx]
            except ValueError:
                new_weight = 5

        deployment.current_canary_weight = new_weight
        if new_weight == 100:
            deployment.status = "COMPLETED"
            deployment.completed_at = datetime.now(timezone.utc)
        else:
            deployment.status = "CANARY_ACTIVE"

        await session.commit()
        await session.refresh(deployment)
        return deployment

    @staticmethod
    async def trigger_rollback(
        session: AsyncSession,
        deployment: Deployment,
        reason: str,
        triggered_by: str = "MANUAL_OVERRIDE",
        violation_details: Optional[dict] = None,
    ) -> Deployment:
        deployment.status = "ROLLED_BACK"
        deployment.current_canary_weight = 0
        deployment.completed_at = datetime.now(timezone.utc)

        rollback = RollbackEvent(
            deployment_id=deployment.id,
            trigger_reason=reason,
            triggered_by=triggered_by,
            violation_details=violation_details or {},
            status="COMPLETED",
        )
        session.add(rollback)
        await session.commit()
        await session.refresh(deployment)
        return deployment

