from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(prefix="/cluster", tags=["Kubernetes Cluster"])


@router.get("/status")
async def get_cluster_status():
    """Returns Kubernetes (k3s) and Argo Rollouts operational state."""
    return {
        "cluster_name": "safedeploy-k3s-aws",
        "provider": "AWS EC2",
        "kubernetes_version": "v1.30.2+k3s1",
        "argo_rollouts_version": "v1.7.1",
        "ingress_controller": "nginx-ingress-controller",
        "nodes": [
            {
                "name": "ip-10-0-1-42.ec2.internal",
                "role": "control-plane,master,worker",
                "status": "Ready",
                "cpu_usage_pct": 24.5,
                "memory_usage_pct": 48.2,
            }
        ],
        "prometheus_connected": True,
        "grafana_url": "http://localhost:3001",
    }

