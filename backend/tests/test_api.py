import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.main import app
from app.db.base import Base
from app.db.session import get_db

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture
async def test_session():
    engine = create_async_engine(TEST_DB_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async def override_get_db():
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    async with session_factory() as session:
        yield session

    app.dependency_overrides.clear()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.mark.asyncio
async def test_application_lifecycle(test_session: AsyncSession):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Create Application
        payload = {
            "name": "Order Microservice",
            "slug": "order-service",
            "repository_url": "https://github.com/safedeploy/order-service.git",
            "git_branch": "main",
            "k8s_namespace": "production",
            "threshold_config": {
                "max_error_rate_percent": 1.0,
                "max_p99_latency_ms": 300.0,
                "security_gate_fail_on": ["CRITICAL", "HIGH"],
            },
        }
        res = await client.post("/api/v1/applications", json=payload)
        assert res.status_code == 201
        app_data = res.json()
        assert app_data["slug"] == "order-service"
        app_id = app_data["id"]

        # 2. List Applications
        res_list = await client.get("/api/v1/applications")
        assert res_list.status_code == 200
        assert len(res_list.json()) == 1

        # 3. Create Deployment
        dep_payload = {
            "application_id": app_id,
            "target_version": "v1.0.0",
            "docker_image": "order:v1.0.0",
            "current_canary_weight": 0,
        }
        res_dep = await client.post("/api/v1/deployments", json=dep_payload)
        assert res_dep.status_code == 201
        dep_data = res_dep.json()
        dep_id = dep_data["id"]
        assert dep_data["status"] == "PENDING"

        # 4. Promote Canary to 5%
        res_promote = await client.post(f"/api/v1/deployments/{dep_id}/promote", json={})
        assert res_promote.status_code == 200
        assert res_promote.json()["current_canary_weight"] == 5
        assert res_promote.json()["status"] == "CANARY_ACTIVE"

        # 5. Ingest Security Scan
        scan_payload = {
            "deployment_id": dep_id,
            "scanner_type": "TRIVY",
            "scan_target": "order:v1.0.0",
            "findings": [
                {
                    "vulnerability_id": "CVE-2024-1234",
                    "severity": "LOW",
                    "package_name": "curl",
                    "installed_version": "8.0.0",
                    "fixed_version": "8.0.1",
                    "description": "Minor cookie disclosure issue",
                }
            ],
        }
        res_scan = await client.post("/api/v1/security/scans/ingest", json=scan_payload)
        assert res_scan.status_code == 201
        assert res_scan.json()["status"] == "PASSED"

        # 6. Test Metric Ingestion with violation -> Automated Rollback
        metric_payload = {
            "deployment_id": dep_id,
            "metric_name": "http_error_rate_percent",
            "value": 4.5,
            "threshold": 1.0,
            "phase": "CANARY_5",
        }
        res_metric = await client.post("/api/v1/metrics/record", json=metric_payload)
        assert res_metric.status_code == 201
        assert res_metric.json()["is_violation"] is True

        # Check deployment is now ROLLED_BACK
        res_dep_check = await client.get(f"/api/v1/deployments/{dep_id}")
        assert res_dep_check.status_code == 200
        assert res_dep_check.json()["status"] == "ROLLED_BACK"
        assert res_dep_check.json()["current_canary_weight"] == 0
        assert len(res_dep_check.json()["rollback_events"]) == 1

        # 7. Check Cluster Status
        res_cluster = await client.get("/api/v1/cluster/status")
        assert res_cluster.status_code == 200
        assert res_cluster.json()["cluster_name"] == "safedeploy-k3s-aws"

