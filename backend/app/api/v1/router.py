from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    applications,
    deployments,
    pipelines,
    security,
    metrics,
    cluster,
)

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(applications.router)
api_router.include_router(deployments.router)
api_router.include_router(pipelines.router)
api_router.include_router(security.router)
api_router.include_router(metrics.router)
api_router.include_router(cluster.router)
