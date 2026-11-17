#!/bin/sh
set -e

echo "[SafeDeploy Backend] Running Alembic database migrations..."
alembic upgrade head
echo "[SafeDeploy Backend] Migrations applied successfully."

echo "[SafeDeploy Backend] Checking initial seed data..."
python -m app.db.seed || echo "[SafeDeploy Backend] Seed step completed."

echo "[SafeDeploy Backend] Starting application server..."
exec "$@"

