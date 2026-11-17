from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.pipeline_run import PipelineRun
from app.models.deployment import Deployment
from app.schemas.pipeline_run import PipelineRunCreate


class PipelineService:
    @staticmethod
    async def get_all(
        session: AsyncSession,
        application_id: Optional[str] = None,
        limit: int = 50,
    ) -> List[PipelineRun]:
        stmt = select(PipelineRun).order_by(PipelineRun.started_at.desc()).limit(limit)
        if application_id:
            stmt = stmt.where(PipelineRun.application_id == application_id)
        result = await session.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(session: AsyncSession, run_id: str) -> Optional[PipelineRun]:
        stmt = select(PipelineRun).where(PipelineRun.id == run_id)
        result = await session.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def create(session: AsyncSession, run_in: PipelineRunCreate) -> PipelineRun:
        run = PipelineRun(
            application_id=run_in.application_id,
            deployment_id=run_in.deployment_id,
            jenkins_build_number=run_in.jenkins_build_number,
            jenkins_build_url=run_in.jenkins_build_url,
            git_commit_hash=run_in.git_commit_hash,
            git_commit_message=run_in.git_commit_message,
            status=run_in.status,
            stage_durations=run_in.stage_durations,
        )
        session.add(run)
        await session.commit()
        await session.refresh(run)
        return run

    @staticmethod
    async def handle_jenkins_webhook(
        session: AsyncSession,
        payload: Dict[str, Any],
    ) -> Optional[PipelineRun]:
        build_num = payload.get("build_number")
        status = payload.get("status", "SUCCESS")
        git_hash = payload.get("commit_hash", "HEAD")
        git_msg = payload.get("commit_message", "")
        stages = payload.get("stages", {})
        deployment_id = payload.get("deployment_id")
        app_id = payload.get("application_id")

        if not app_id:
            return None

        run = PipelineRun(
            application_id=app_id,
            deployment_id=deployment_id,
            jenkins_build_number=build_num or 1,
            jenkins_build_url=payload.get("build_url", f"http://localhost:8080/job/deploy/{build_num}"),
            git_commit_hash=git_hash,
            git_commit_message=git_msg,
            status=status,
            stage_durations=stages,
            completed_at=datetime.now(timezone.utc) if status in ["SUCCESS", "FAILURE", "ABORTED"] else None,
        )
        session.add(run)

        # Update deployment status if linked
        if deployment_id:
            dep_stmt = select(Deployment).where(Deployment.id == deployment_id)
            dep_res = await session.execute(dep_stmt)
            deployment = dep_res.scalars().first()
            if deployment:
                if status == "SUCCESS":
                    deployment.status = "CANARY_ACTIVE"
                    deployment.current_canary_weight = 5
                elif status == "FAILURE":
                    deployment.status = "FAILED"

        await session.commit()
        await session.refresh(run)
        return run

