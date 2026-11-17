# syntax=docker/dockerfile:1

# 1. Builder stage
FROM python:3.12-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install dependencies into user site packages
RUN pip install --no-cache-dir --user -r requirements.txt

# 2. Production Runner stage
FROM python:3.12-slim AS runner

WORKDIR /app

# Install minimal runtime libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -g 1001 safedeploy && \
    useradd -u 1001 -g safedeploy -s /bin/bash -m safedeploy

# Copy installed Python packages from builder stage
COPY --from=builder /root/.local /home/safedeploy/.local

# Ensure path and python environment variables
ENV PATH=/home/safedeploy/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONPATH=/app

# Copy application files
COPY --chown=safedeploy:safedeploy . /app

USER safedeploy

EXPOSE 8000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

