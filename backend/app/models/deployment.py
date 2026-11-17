import uuid
from typing import List, Optional
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Deployment(Base):
    __tablename__ = "deployments"

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
    target_version: Mapped[str] = mapped_column(String(64), nullable=False)
    previous_version: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    docker_image: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(
        String(32),
        index=True,
        default="PENDING",
        nullable=False,
    )  # PENDING, BUILDING, SCANNING, CANARY_ACTIVE, PROMOTING, COMPLETED, FAILED, ROLLED_BACK
    current_canary_weight: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
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
        back_populates="deployments",
        lazy="selectin",
    )
    pipeline_runs: Mapped[List["PipelineRun"]] = relationship(
        "PipelineRun",
        back_populates="deployment",
        lazy="selectin",
    )
    security_scans: Mapped[List["SecurityScan"]] = relationship(
        "SecurityScan",
        back_populates="deployment",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    metric_records: Mapped[List["MetricRecord"]] = relationship(
        "MetricRecord",
        back_populates="deployment",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    rollback_events: Mapped[List["RollbackEvent"]] = relationship(
        "RollbackEvent",
        back_populates="deployment",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
