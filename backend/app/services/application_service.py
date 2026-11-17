from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.application import Application
from app.schemas.application import ApplicationCreate, ApplicationUpdate


class ApplicationService:
    @staticmethod
    async def get_all(session: AsyncSession) -> List[Application]:
        stmt = select(Application).order_by(Application.created_at.desc())
        result = await session.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(session: AsyncSession, app_id: str) -> Optional[Application]:
        stmt = select(Application).where(Application.id == app_id)
        result = await session.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def get_by_slug(session: AsyncSession, slug: str) -> Optional[Application]:
        stmt = select(Application).where(Application.slug == slug)
        result = await session.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def create(session: AsyncSession, app_in: ApplicationCreate) -> Application:
        threshold_dict = (
            app_in.threshold_config.model_dump()
            if app_in.threshold_config
            else {
                "max_error_rate_percent": 1.0,
                "max_p99_latency_ms": 300.0,
                "security_gate_fail_on": ["CRITICAL", "HIGH"],
            }
        )
        app = Application(
            name=app_in.name,
            slug=app_in.slug,
            repository_url=app_in.repository_url,
            git_branch=app_in.git_branch,
            k8s_namespace=app_in.k8s_namespace,
            threshold_config=threshold_dict,
        )
        session.add(app)
        await session.commit()
        await session.refresh(app)
        return app

    @staticmethod
    async def update(session: AsyncSession, app: Application, app_in: ApplicationUpdate) -> Application:
        update_data = app_in.model_dump(exclude_unset=True)
        if "threshold_config" in update_data and update_data["threshold_config"] is not None:
            update_data["threshold_config"] = app_in.threshold_config.model_dump()

        for field, value in update_data.items():
            setattr(app, field, value)

        await session.commit()
        await session.refresh(app)
        return app

    @staticmethod
    async def delete(session: AsyncSession, app: Application) -> None:
        await session.delete(app)
        await session.commit()

