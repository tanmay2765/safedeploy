"""initial_schema

Revision ID: 3c7a12bbde92
Revises: 
Create Date: 2026-11-17 01:19:15.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '3c7a12bbde92'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. applications
    op.create_table(
        'applications',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('name', sa.String(length=100), nullable=False, unique=True),
        sa.Column('slug', sa.String(length=100), nullable=False),
        sa.Column('repository_url', sa.String(length=255), nullable=False),
        sa.Column('git_branch', sa.String(length=100), nullable=False, server_default='main'),
        sa.Column('k8s_namespace', sa.String(length=63), nullable=False, server_default='default'),
        sa.Column('threshold_config', sa.JSON(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_applications_slug', 'applications', ['slug'], unique=True)

    # 2. deployments
    op.create_table(
        'deployments',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('application_id', sa.String(length=36), sa.ForeignKey('applications.id', ondelete='CASCADE'), nullable=False),
        sa.Column('target_version', sa.String(length=64), nullable=False),
        sa.Column('previous_version', sa.String(length=64), nullable=True),
        sa.Column('docker_image', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='PENDING'),
        sa.Column('current_canary_weight', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('ix_deployments_application_id', 'deployments', ['application_id'], unique=False)
    op.create_index('ix_deployments_status', 'deployments', ['status'], unique=False)

    # 3. pipeline_runs
    op.create_table(
        'pipeline_runs',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('application_id', sa.String(length=36), sa.ForeignKey('applications.id', ondelete='CASCADE'), nullable=False),
        sa.Column('deployment_id', sa.String(length=36), sa.ForeignKey('deployments.id', ondelete='SET NULL'), nullable=True),
        sa.Column('jenkins_build_number', sa.Integer(), nullable=False),
        sa.Column('jenkins_build_url', sa.String(length=255), nullable=False),
        sa.Column('git_commit_hash', sa.String(length=40), nullable=False),
        sa.Column('git_commit_message', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='QUEUED'),
        sa.Column('stage_durations', sa.JSON(), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('ix_pipeline_runs_application_id', 'pipeline_runs', ['application_id'], unique=False)
    op.create_index('ix_pipeline_runs_deployment_id', 'pipeline_runs', ['deployment_id'], unique=False)

    # 4. security_scans
    op.create_table(
        'security_scans',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('deployment_id', sa.String(length=36), sa.ForeignKey('deployments.id', ondelete='CASCADE'), nullable=False),
        sa.Column('scanner_type', sa.String(length=32), nullable=False),
        sa.Column('scan_target', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='PASSED'),
        sa.Column('critical_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('high_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('medium_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('low_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('raw_report_json', sa.JSON(), nullable=True),
        sa.Column('executed_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_security_scans_deployment_id', 'security_scans', ['deployment_id'], unique=False)

    # 5. security_findings
    op.create_table(
        'security_findings',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('security_scan_id', sa.String(length=36), sa.ForeignKey('security_scans.id', ondelete='CASCADE'), nullable=False),
        sa.Column('vulnerability_id', sa.String(length=128), nullable=False),
        sa.Column('severity', sa.String(length=16), nullable=False),
        sa.Column('package_name', sa.String(length=128), nullable=True),
        sa.Column('installed_version', sa.String(length=64), nullable=True),
        sa.Column('fixed_version', sa.String(length=64), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('file_path', sa.String(length=255), nullable=True),
        sa.Column('line_number', sa.Integer(), nullable=True),
    )
    op.create_index('ix_security_findings_security_scan_id', 'security_findings', ['security_scan_id'], unique=False)

    # 6. metric_records
    op.create_table(
        'metric_records',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('deployment_id', sa.String(length=36), sa.ForeignKey('deployments.id', ondelete='CASCADE'), nullable=False),
        sa.Column('metric_name', sa.String(length=64), nullable=False),
        sa.Column('value', sa.Float(), nullable=False),
        sa.Column('threshold', sa.Float(), nullable=False),
        sa.Column('is_violation', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('phase', sa.String(length=32), nullable=False),
        sa.Column('recorded_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_metric_records_deployment_id', 'metric_records', ['deployment_id'], unique=False)
    op.create_index('ix_metric_records_recorded_at', 'metric_records', ['recorded_at'], unique=False)

    # 7. rollback_events
    op.create_table(
        'rollback_events',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('deployment_id', sa.String(length=36), sa.ForeignKey('deployments.id', ondelete='CASCADE'), nullable=False),
        sa.Column('trigger_reason', sa.Text(), nullable=False),
        sa.Column('triggered_by', sa.String(length=32), nullable=False),
        sa.Column('violation_details', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='COMPLETED'),
        sa.Column('executed_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_rollback_events_deployment_id', 'rollback_events', ['deployment_id'], unique=False)


def downgrade() -> None:
    op.drop_table('rollback_events')
    op.drop_table('metric_records')
    op.drop_table('security_findings')
    op.drop_table('security_scans')
    op.drop_table('pipeline_runs')
    op.drop_table('deployments')
    op.drop_table('applications')
