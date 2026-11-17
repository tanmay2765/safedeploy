import axios from "axios";
import {
  Application,
  Deployment,
  PipelineRun,
  SecurityScan,
  MetricRecord,
  RollbackEvent,
  ClusterStatus,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Applications
export const getApplications = async (): Promise<Application[]> => {
  const { data } = await api.get<Application[]>("/applications");
  return data;
};

export const getApplication = async (id: string): Promise<Application> => {
  const { data } = await api.get<Application>(`/applications/${id}`);
  return data;
};

export const createApplication = async (payload: Partial<Application>): Promise<Application> => {
  const { data } = await api.post<Application>("/applications", payload);
  return data;
};

// Deployments
export const getDeployments = async (applicationId?: string): Promise<Deployment[]> => {
  const params = applicationId ? { application_id: applicationId } : {};
  const { data } = await api.get<Deployment[]>("/deployments", { params });
  return data;
};

export const getDeployment = async (id: string): Promise<Deployment> => {
  const { data } = await api.get<Deployment>(`/deployments/${id}`);
  return data;
};

export const createDeployment = async (payload: {
  application_id: string;
  target_version: string;
  previous_version?: string;
  docker_image: string;
}): Promise<Deployment> => {
  const { data } = await api.post<Deployment>("/deployments", payload);
  return data;
};

export const promoteCanary = async (
  deploymentId: string,
  targetWeight?: number
): Promise<Deployment> => {
  const { data } = await api.post<Deployment>(`/deployments/${deploymentId}/promote`, {
    target_weight: targetWeight,
  });
  return data;
};

export const triggerRollback = async (
  deploymentId: string,
  reason: string
): Promise<Deployment> => {
  const { data } = await api.post<Deployment>(`/deployments/${deploymentId}/rollback`, {
    reason,
  });
  return data;
};

// Security
export const getSecurityScans = async (deploymentId?: string): Promise<SecurityScan[]> => {
  const params = deploymentId ? { deployment_id: deploymentId } : {};
  const { data } = await api.get<SecurityScan[]>("/security/scans", { params });
  return data;
};

export const getSecurityStats = async (): Promise<{
  critical: number;
  high: number;
  medium: number;
  low: number;
  total_scans: number;
}> => {
  const { data } = await api.get("/security/stats");
  return data;
};

// Pipelines
export const getPipelines = async (applicationId?: string): Promise<PipelineRun[]> => {
  const params = applicationId ? { application_id: applicationId } : {};
  const { data } = await api.get<PipelineRun[]>("/pipelines", { params });
  return data;
};

// Metrics & Cluster
export const getLiveMetrics = async (deploymentId: string) => {
  const { data } = await api.get(`/metrics/live/${deploymentId}`);
  return data;
};

export const getRollbacks = async (): Promise<RollbackEvent[]> => {
  const { data } = await api.get<RollbackEvent[]>("/metrics/rollbacks");
  return data;
};

export const getClusterStatus = async (): Promise<ClusterStatus> => {
  const { data } = await api.get<ClusterStatus>("/cluster/status");
  return data;
};

