import uuid
from typing import List, Optional
from sqlalchemy import String, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class Application(Base, TimestampMixin):
    __tablename__ = "applications"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    repository_url: Mapped[str] = mapped_column(String(255), nullable=False)
    git_branch: Mapped[str] = mapped_column(String(100), default="main", nullable=False)
    k8s_namespace: Mapped[str] = mapped_column(String(63), default="default", nullable=False)
    threshold_config: Mapped[dict] = mapped_column(
        JSON,
        default=lambda: {
            "max_error_rate_percent": 1.0,
            "max_p99_latency_ms": 300,
            "security_gate_fail_on": ["CRITICAL", "HIGH"],
        },
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships (with selectin loading for seamless async queries)
    deployments: Mapped[List["Deployment"]] = relationship(
        "Deployment",
        back_populates="application",
        cascade="all, delete-orphan",
        order_by="desc(Deployment.started_at)",
        lazy="selectin",
    )
    pipeline_runs: Mapped[List["PipelineRun"]] = relationship(
        "PipelineRun",
        back_populates="application",
        cascade="all, delete-orphan",
        order_by="desc(PipelineRun.started_at)",
        lazy="selectin",
    )
