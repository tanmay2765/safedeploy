from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.security_scan import SecurityScan, SecurityFinding
from app.models.deployment import Deployment
from app.models.application import Application
from app.schemas.security_scan import SecurityScanCreate


class SecurityService:
    @staticmethod
    async def get_scans(
        session: AsyncSession,
        deployment_id: Optional[str] = None,
        scanner_type: Optional[str] = None,
        limit: int = 50,
    ) -> List[SecurityScan]:
        stmt = select(SecurityScan).order_by(SecurityScan.executed_at.desc()).limit(limit)
        if deployment_id:
            stmt = stmt.where(SecurityScan.deployment_id == deployment_id)
        if scanner_type:
            stmt = stmt.where(SecurityScan.scanner_type == scanner_type)
        result = await session.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_scan_by_id(session: AsyncSession, scan_id: str) -> Optional[SecurityScan]:
        stmt = select(SecurityScan).where(SecurityScan.id == scan_id)
        result = await session.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def ingest_scan(
        session: AsyncSession,
        scan_in: SecurityScanCreate,
    ) -> SecurityScan:
        # Check deployment
        dep_stmt = select(Deployment).where(Deployment.id == scan_in.deployment_id)
        dep_res = await session.execute(dep_stmt)
        deployment = dep_res.scalars().first()

        crit_count = 0
        high_count = 0
        med_count = 0
        low_count = 0

        for f in scan_in.findings:
            sev = f.severity.upper()
            if sev == "CRITICAL":
                crit_count += 1
            elif sev == "HIGH":
                high_count += 1
            elif sev == "MEDIUM":
                med_count += 1
            else:
                low_count += 1

        # Check gate violation if deployment has application config
        status = "PASSED"
        if crit_count > 0 or high_count > 0:
            status = "FAILED"
        elif med_count > 0:
            status = "WARNING"

        scan = SecurityScan(
            deployment_id=scan_in.deployment_id,
            scanner_type=scan_in.scanner_type,
            scan_target=scan_in.scan_target,
            status=status,
            critical_count=crit_count,
            high_count=high_count,
            medium_count=med_count,
            low_count=low_count,
            raw_report_json=scan_in.raw_report_json,
        )
        session.add(scan)
        await session.flush()

        for finding_in in scan_in.findings:
            finding = SecurityFinding(
                security_scan_id=scan.id,
                vulnerability_id=finding_in.vulnerability_id,
                severity=finding_in.severity.upper(),
                package_name=finding_in.package_name,
                installed_version=finding_in.installed_version,
                fixed_version=finding_in.fixed_version,
                description=finding_in.description,
                file_path=finding_in.file_path,
                line_number=finding_in.line_number,
            )
            session.add(finding)

        # Update deployment status if security failed
        if status == "FAILED" and deployment:
            deployment.status = "FAILED"

        await session.commit()
        await session.refresh(scan)
        return scan

    @staticmethod
    async def get_aggregated_stats(session: AsyncSession) -> Dict[str, Any]:
        stmt = select(
            func.coalesce(func.sum(SecurityScan.critical_count), 0).label("critical"),
            func.coalesce(func.sum(SecurityScan.high_count), 0).label("high"),
            func.coalesce(func.sum(SecurityScan.medium_count), 0).label("medium"),
            func.coalesce(func.sum(SecurityScan.low_count), 0).label("low"),
            func.count(SecurityScan.id).label("total_scans"),
        )
        result = await session.execute(stmt)
        row = result.first()
        return {
            "critical": row.critical if row else 0,
            "high": row.high if row else 0,
            "medium": row.medium if row else 0,
            "low": row.low if row else 0,
            "total_scans": row.total_scans if row else 0,
        }

