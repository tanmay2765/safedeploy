import asyncio
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from app.db.session import AsyncSessionLocal, async_engine
from app.db.base import Base
from app.models import (
    Application,
    Deployment,
    PipelineRun,
    SecurityScan,
    SecurityFinding,
    MetricRecord,
    RollbackEvent,
)


async def seed_data():
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Check if already seeded
        res = await session.execute(select(Application))
        if res.scalars().first():
            print("Database already contains data. Skipping seed.")
            return

        print("Seeding SafeDeploy database with realistic engineering data...")

        # 1. Applications
        app1 = Application(
            name="Payment Processing Microservice",
            slug="payment-service",
            repository_url="https://github.com/safedeploy/payment-service.git",
            git_branch="main",
            k8s_namespace="production",
            threshold_config={
                "max_error_rate_percent": 1.0,
                "max_p99_latency_ms": 250,
                "security_gate_fail_on": ["CRITICAL", "HIGH"],
            },
        )
        app2 = Application(
            name="Authentication & Identity Service",
            slug="auth-service",
            repository_url="https://github.com/safedeploy/auth-service.git",
            git_branch="main",
            k8s_namespace="production",
            threshold_config={
                "max_error_rate_percent": 0.5,
                "max_p99_latency_ms": 180,
                "security_gate_fail_on": ["CRITICAL"],
            },
        )
        session.add_all([app1, app2])
        await session.commit()
        await session.refresh(app1)
        await session.refresh(app2)

        # 2. Deployments for Payment Service
        # Dep A: v1.0.0 (Completed stable baseline)
        now = datetime.now(timezone.utc)
        dep_stable = Deployment(
            application_id=app1.id,
            target_version="v1.0.0",
            previous_version=None,
            docker_image="123456789.dkr.ecr.us-east-1.amazonaws.com/payment:v1.0.0",
            status="COMPLETED",
            current_canary_weight=100,
            started_at=now - timedelta(days=2),
            completed_at=now - timedelta(days=2, hours=-1),
        )
        # Dep B: v1.1.0 (Automated rollback due to high error spike)
        dep_rolled_back = Deployment(
            application_id=app1.id,
            target_version="v1.1.0",
            previous_version="v1.0.0",
            docker_image="123456789.dkr.ecr.us-east-1.amazonaws.com/payment:v1.1.0",
            status="ROLLED_BACK",
            current_canary_weight=0,
            started_at=now - timedelta(days=1),
            completed_at=now - timedelta(days=1, minutes=-15),
        )
        # Dep C: v1.2.0 (Active canary currently at 20%)
        dep_active = Deployment(
            application_id=app1.id,
            target_version="v1.2.0",
            previous_version="v1.0.0",
            docker_image="123456789.dkr.ecr.us-east-1.amazonaws.com/payment:v1.2.0",
            status="CANARY_ACTIVE",
            current_canary_weight=20,
            started_at=now - timedelta(minutes=25),
        )

        session.add_all([dep_stable, dep_rolled_back, dep_active])
        await session.commit()
        await session.refresh(dep_rolled_back)
        await session.refresh(dep_active)

        # 3. Rollback Event for v1.1.0
        rollback = RollbackEvent(
            deployment_id=dep_rolled_back.id,
            trigger_reason="Automated Rollback Triggered: http_error_rate_percent reached 3.82% which violates threshold 1.0% during CANARY_20",
            triggered_by="AUTOMATED_METRIC_VIOLATION",
            violation_details={
                "metric_name": "http_error_rate_percent",
                "value": 3.82,
                "threshold": 1.0,
                "phase": "CANARY_20",
            },
            status="COMPLETED",
            executed_at=now - timedelta(days=1, minutes=-15),
        )
        session.add(rollback)

        # 4. Pipeline Runs
        pipe1 = PipelineRun(
            application_id=app1.id,
            deployment_id=dep_active.id,
            jenkins_build_number=42,
            jenkins_build_url="http://localhost:8080/job/payment-service/42",
            git_commit_hash="9f8a12b3c4d5e6f708192a3b4c5d6e7f8091a2b3",
            git_commit_message="feat(core): optimize db connection pool and retry logic",
            status="SUCCESS",
            stage_durations={
                "Declarative: Checkout SCM": 3.2,
                "Unit & Integration Tests": 38.5,
                "Semgrep SAST Scan": 12.1,
                "Docker Build": 42.0,
                "Trivy Container Scan": 15.3,
                "Deploy Canary (5%)": 8.7,
            },
            started_at=now - timedelta(minutes=30),
            completed_at=now - timedelta(minutes=25),
        )
        session.add(pipe1)

        # 5. Security Scans & Findings for v1.2.0
        scan_semgrep = SecurityScan(
            deployment_id=dep_active.id,
            scanner_type="SEMGREP",
            scan_target="src/",
            status="PASSED",
            critical_count=0,
            high_count=0,
            medium_count=1,
            low_count=2,
            executed_at=now - timedelta(minutes=27),
        )
        scan_trivy = SecurityScan(
            deployment_id=dep_active.id,
            scanner_type="TRIVY",
            scan_target="payment:v1.2.0",
            status="PASSED",
            critical_count=0,
            high_count=0,
            medium_count=2,
            low_count=5,
            executed_at=now - timedelta(minutes=26),
        )
        session.add_all([scan_semgrep, scan_trivy])
        await session.commit()
        await session.refresh(scan_semgrep)
        await session.refresh(scan_trivy)

        finding1 = SecurityFinding(
            security_scan_id=scan_semgrep.id,
            vulnerability_id="python.lang.security.audit.non-literal-import",
            severity="MEDIUM",
            file_path="src/handlers/router.py",
            line_number=84,
            description="Dynamically loading module via user-controlled string parameter",
        )
        finding2 = SecurityFinding(
            security_scan_id=scan_trivy.id,
            vulnerability_id="CVE-2023-45853",
            severity="MEDIUM",
            package_name="zlib",
            installed_version="1.2.11",
            fixed_version="1.2.12",
            description="Integer overflow and resultant buffer overflow in MiniZip in zlib",
        )
        session.add_all([finding1, finding2])

        # 6. Metric Records for Active Canary v1.2.0
        for i, val in enumerate([0.12, 0.15, 0.18, 0.14, 0.16]):
            session.add(
                MetricRecord(
                    deployment_id=dep_active.id,
                    metric_name="http_error_rate_percent",
                    value=val,
                    threshold=1.0,
                    is_violation=False,
                    phase="CANARY_20",
                    recorded_at=now - timedelta(minutes=15 - i * 3),
                )
            )

        for i, val in enumerate([145.2, 138.0, 142.1, 140.5, 139.2]):
            session.add(
                MetricRecord(
                    deployment_id=dep_active.id,
                    metric_name="p99_latency_ms",
                    value=val,
                    threshold=250.0,
                    is_violation=False,
                    phase="CANARY_20",
                    recorded_at=now - timedelta(minutes=15 - i * 3),
                )
            )

        await session.commit()
        print("Database successfully seeded.")


if __name__ == "__main__":
    asyncio.run(seed_data())

