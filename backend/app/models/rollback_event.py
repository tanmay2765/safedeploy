import uuid
from typing import Optional
from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class RollbackEvent(Base):
    __tablename__ = "rollback_events"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    deployment_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("deployments.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    trigger_reason: Mapped[str] = mapped_column(Text, nullable=False)
    triggered_by: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
    )  # AUTOMATED_METRIC_VIOLATION, SECURITY_GATE_FAILURE, MANUAL_OVERRIDE
    violation_details: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(
        String(32),
        default="COMPLETED",
        nullable=False,
    )  # INITIATED, IN_PROGRESS, COMPLETED, FAILED
    executed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    deployment: Mapped["Deployment"] = relationship(
        "Deployment",
        back_populates="rollback_events",
    )

