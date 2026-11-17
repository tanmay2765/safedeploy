import uuid
from typing import Optional
from datetime import datetime
from sqlalchemy import String, Integer, Text, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class PipelineRun(Base):
    __tablename__ = "pipeline_runs"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    application_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("applications.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    deployment_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("deployments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    jenkins_build_number: Mapped[int] = mapped_column(Integer, nullable=False)
    jenkins_build_url: Mapped[str] = mapped_column(String(255), nullable=False)
    git_commit_hash: Mapped[str] = mapped_column(String(40), nullable=False)
    git_commit_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(32),
        default="QUEUED",
        nullable=False,
    )  # QUEUED, IN_PROGRESS, SUCCESS, FAILURE, ABORTED
    stage_durations: Mapped[dict] = mapped_column(
        JSON,
        default=lambda: {},
        nullable=False,
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Relationships
    application: Mapped["Application"] = relationship(
        "Application",
        back_populates="pipeline_runs",
    )
    deployment: Mapped[Optional["Deployment"]] = relationship(
        "Deployment",
        back_populates="pipeline_runs",
    )

