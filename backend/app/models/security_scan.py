import uuid
from typing import List, Optional
from datetime import datetime
from sqlalchemy import String, Integer, Text, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class SecurityScan(Base):
    __tablename__ = "security_scans"

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
    scanner_type: Mapped[str] = mapped_column(String(32), nullable=False)  # SEMGREP, TRIVY
    scan_target: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="PASSED", nullable=False)  # PASSED, WARNING, FAILED
    critical_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    high_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    medium_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    low_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    raw_report_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    executed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    deployment: Mapped["Deployment"] = relationship(
        "Deployment",
        back_populates="security_scans",
        lazy="selectin",
    )
    findings: Mapped[List["SecurityFinding"]] = relationship(
        "SecurityFinding",
        back_populates="scan",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class SecurityFinding(Base):
    __tablename__ = "security_findings"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    security_scan_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("security_scans.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    vulnerability_id: Mapped[str] = mapped_column(String(128), nullable=False)
    severity: Mapped[str] = mapped_column(String(16), nullable=False)
    package_name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    installed_version: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    fixed_version: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    file_path: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    line_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Relationships
    scan: Mapped["SecurityScan"] = relationship(
        "SecurityScan",
        back_populates="findings",
        lazy="selectin",
    )
