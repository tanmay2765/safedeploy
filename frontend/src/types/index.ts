export interface Application {
  id: string;
  name: string;
  slug: string;
  repository_url: string;
  git_branch: string;
  k8s_namespace: string;
  threshold_config: {
    max_error_rate_percent: number;
    max_p99_latency_ms: number;
    security_gate_fail_on: string[];
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Deployment {
  id: string;
  application_id: string;
  target_version: string;
  previous_version?: string | null;
  docker_image: string;
  status:
    | "PENDING"
    | "BUILDING"
    | "SECURITY_SCANNING"
    | "CANARY_ACTIVE"
    | "ANALYZING"
    | "PROMOTING"
    | "COMPLETED"
    | "FAILED"
    | "ROLLED_BACK";
  current_canary_weight: number;
  started_at: string;
  completed_at?: string | null;
  security_scans?: SecurityScan[];
  metric_records?: MetricRecord[];
  rollback_events?: RollbackEvent[];
}

export interface PipelineRun {
  id: string;
  application_id: string;
  deployment_id?: string | null;
  jenkins_build_number: number;
  jenkins_build_url: string;
  git_commit_hash: string;
  git_commit_message?: string | null;
  status: "QUEUED" | "IN_PROGRESS" | "SUCCESS" | "FAILURE" | "ABORTED";
  stage_durations: Record<string, number>;
  started_at: string;
  completed_at?: string | null;
}

export interface SecurityFinding {
  id: string;
  security_scan_id: string;
  vulnerability_id: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  package_name?: string | null;
  installed_version?: string | null;
  fixed_version?: string | null;
  description?: string | null;
  file_path?: string | null;
  line_number?: number | null;
}

export interface SecurityScan {
  id: string;
  deployment_id: string;
  scanner_type: "SEMGREP" | "TRIVY";
  scan_target: string;
  status: "PASSED" | "WARNING" | "FAILED";
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  executed_at: string;
  findings: SecurityFinding[];
}

export interface MetricRecord {
  id: string;
  deployment_id: string;
  metric_name: string;
  value: number;
  threshold: number;
  is_violation: boolean;
  phase: string;
  recorded_at: string;
}

export interface RollbackEvent {
  id: string;
  deployment_id: string;
  trigger_reason: string;
  triggered_by: string;
  violation_details?: Record<string, any>;
  status: string;
  executed_at: string;
}

export interface ClusterStatus {
  cluster_name: string;
  provider: string;
  kubernetes_version: string;
  argo_rollouts_version: string;
  ingress_controller: string;
  nodes: Array<{
    name: string;
    role: string;
    status: string;
    cpu_usage_pct: number;
    memory_usage_pct: number;
  }>;
  prometheus_connected: boolean;
  grafana_url: string;
}

