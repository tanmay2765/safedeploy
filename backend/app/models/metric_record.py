import uuid
from datetime import datetime
from sqlalchemy import String, Float, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class MetricRecord(Base):
    __tablename__ = "metric_records"

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
    metric_name: Mapped[str] = mapped_column(String(64), nullable=False)  # http_error_rate_percent, p99_latency_ms
    value: Mapped[float] = mapped_column(Float, nullable=False)
    threshold: Mapped[float] = mapped_column(Float, nullable=False)
    is_violation: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    phase: Mapped[str] = mapped_column(String(32), nullable=False)  # CANARY_5, CANARY_20, CANARY_50, CANARY_100
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True,
        nullable=False,
    )

    # Relationships
    deployment: Mapped["Deployment"] = relationship(
        "Deployment",
        back_populates="metric_records",
    )

