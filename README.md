# SafeDeploy: DevSecOps Deployment Platform

SafeDeploy is an automated, secure delivery platform engineered for progressive canary deployments, security governance, and automated rollbacks on Kubernetes and AWS.

## Architecture Pipeline
`GitHub` → `Jenkins` → `Automated Testing` → `Semgrep SAST` → `Docker Build` → `Trivy Vulnerability Scan` → `ECR/Registry` → `Kubernetes (k3s)` → `Argo Rollouts (5% -> 20% -> 50% -> 100%)` → `Prometheus/Grafana` → `Automated Health Analysis & Rollback`

## Repository Structure
- `backend/`: FastAPI application, async SQLAlchemy 2.0 ORM, Alembic migrations, telemetry & security services.
- `frontend/`: Next.js 14+ App Router, TypeScript, Tailwind CSS dashboard.
- `sample-app/`: Target microservice demonstrating progressive canary delivery.
- `docker/`: Local development environment definitions.
- `kubernetes/`: Kubernetes manifests, Argo Rollouts, and AnalysisTemplates.
- `terraform/`: AWS infrastructure provisioning (VPC, EC2, ECR, IAM).
- `docs/`: Technical specifications and operational runbooks.

## Getting Started
See respective directory READMEs for setup and execution instructions.

