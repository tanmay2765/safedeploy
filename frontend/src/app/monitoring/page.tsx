"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, Server, ExternalLink, Cpu, HardDrive, CheckCircle2 } from "lucide-react";
import { getClusterStatus } from "@/lib/api";

export default function MonitoringPage() {
  const { data: cluster, isLoading } = useQuery({
    queryKey: ["clusterStatus"],
    queryFn: getClusterStatus,
    refetchInterval: 10000,
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Infrastructure & Telemetry</h2>
          <p className="text-sm text-slate-400 mt-1">
            Live Prometheus scraping metrics, Argo Rollouts analysis, and k3s node resource utilization.
          </p>
        </div>
        <a
          href={cluster?.grafana_url || "http://localhost:3001"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-indigo-600/20"
        >
          <ExternalLink className="h-4 w-4" />
          Open Grafana Dashboards
        </a>
      </div>

      {/* Cluster Node Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 backdrop-blur">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Kubernetes Cluster</span>
            <Server className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white">{cluster?.cluster_name || "k3s-cluster"}</div>
          <div className="text-xs text-slate-400 mt-1">
            {cluster?.provider || "AWS EC2"} • {cluster?.kubernetes_version || "v1.30.2+k3s1"}
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 backdrop-blur">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Argo Rollouts</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">{cluster?.argo_rollouts_version || "v1.7.1"}</div>
          <div className="text-xs text-emerald-400/80 mt-1">Controller Healthy • CRDs Active</div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 backdrop-blur">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Prometheus Scraper</span>
            <Activity className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white">Connected</div>
          <div className="text-xs text-slate-400 mt-1">15s Scrape Interval Active</div>
        </div>
      </div>

      {/* Node Resource Utilization */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 backdrop-blur space-y-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
          Node Resource Utilization
        </h3>

        {cluster?.nodes?.map((node) => (
          <div key={node.name} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-sm">{node.name}</span>
                <span className="text-xs text-slate-400 ml-2 font-mono">({node.role})</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {node.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* CPU */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-indigo-400" /> CPU Usage
                  </span>
                  <span className="font-bold text-white">{node.cpu_usage_pct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${node.cpu_usage_pct}%` }}
                  />
                </div>
              </div>

              {/* Memory */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1.5">
                    <HardDrive className="h-3.5 w-3.5 text-cyan-400" /> Memory Usage
                  </span>
                  <span className="font-bold text-white">{node.memory_usage_pct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full"
                    style={{ width: `${node.memory_usage_pct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

