.PHONY: help install-backend install-frontend dev-backend dev-frontend test-backend build-frontend

help:
	@echo "SafeDeploy Development Commands:"
	@echo "  make install-backend   - Install backend Python dependencies"
	@echo "  make install-frontend  - Install frontend Node.js dependencies"
	@echo "  make dev-backend       - Run FastAPI backend locally with uvicorn"
	@echo "  make dev-frontend      - Run Next.js frontend locally"
	@echo "  make test-backend      - Run pytest on backend"
	@echo "  make build-frontend    - Build production Next.js frontend"

install-backend:
	cd backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt

install-frontend:
	cd frontend && npm install

dev-backend:
	cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	cd frontend && npm run dev

test-backend:
	cd backend && source .venv/bin/activate && pytest -v

build-frontend:
	cd frontend && npm run build

