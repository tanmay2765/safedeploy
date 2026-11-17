import pytest
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select
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

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture
async def db_session():
    engine = create_async_engine(TEST_DB_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with session_factory() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.mark.asyncio
async def test_create_application_and_deployment(db_session: AsyncSession):
    # 1. Create Application
    app = Application(
        name="Payment Gateway Service",
        slug="payment-gateway",
        repository_url="https://github.com/safedeploy/payment-service.git",
        git_branch="main",
        k8s_namespace="production",
        threshold_config={
            "max_error_rate_percent": 1.0,
            "max_p99_latency_ms": 250,
            "security_gate_fail_on": ["CRITICAL", "HIGH"],
        },
    )
    db_session.add(app)
    await db_session.commit()
    await db_session.refresh(app)

    assert app.id is not None
    assert app.slug == "payment-gateway"

    # 2. Create Deployment
    deployment = Deployment(
        application_id=app.id,
        target_version="v2.1.0",
        previous_version="v2.0.0",
        docker_image="123456789.dkr.ecr.us-east-1.amazonaws.com/payment:v2.1.0",
        status="CANARY_ACTIVE",
        current_canary_weight=20,
    )
    db_session.add(deployment)
    await db_session.commit()
    await db_session.refresh(deployment)

    assert deployment.id is not None
    assert deployment.current_canary_weight == 20

    # 3. Add Security Scan & Findings
    scan = SecurityScan(
        deployment_id=deployment.id,
        scanner_type="TRIVY",
        scan_target="payment:v2.1.0",
        status="PASSED",
        critical_count=0,
        high_count=0,
        medium_count=1,
    )
    db_session.add(scan)
    await db_session.commit()
    await db_session.refresh(scan)

    finding = SecurityFinding(
        security_scan_id=scan.id,
        vulnerability_id="CVE-2023-4567",
        severity="MEDIUM",
        package_name="openssl",
        installed_version="1.1.1t",
        fixed_version="1.1.1u",
        description="Buffer over-read flaw in OpenSSL",
    )
    db_session.add(finding)
    await db_session.commit()

    # 4. Add Metric Record
    metric = MetricRecord(
        deployment_id=deployment.id,
        metric_name="http_error_rate_percent",
        value=0.15,
        threshold=1.0,
        is_violation=False,
        phase="CANARY_20",
    )
    db_session.add(metric)
    await db_session.commit()

    # Expire identity map cache so fresh relationships are queried
    db_session.expire_all()

    # Query back and verify relations
    stmt = select(Application).where(Application.slug == "payment-gateway")
    result = await db_session.execute(stmt)
    saved_app = result.scalars().first()
    assert saved_app is not None
    assert len(saved_app.deployments) == 1
    assert saved_app.deployments[0].target_version == "v2.1.0"
    assert len(saved_app.deployments[0].security_scans) == 1
    assert len(saved_app.deployments[0].security_scans[0].findings) == 1
    assert saved_app.deployments[0].security_scans[0].findings[0].vulnerability_id == "CVE-2023-4567"
    assert len(saved_app.deployments[0].metric_records) == 1
