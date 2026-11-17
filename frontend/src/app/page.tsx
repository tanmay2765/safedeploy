"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Rocket,
  ShieldAlert,
  GitBranch,
  Layers,
  ArrowUpRight,
  RotateCcw,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Link from "next/link";
import {
  getDeployments,
  getApplications,
  getSecurityStats,
  getPipelines,
  getRollbacks,
} from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function DashboardOverview() {
  const { data: apps = [] } = useQuery({
    queryKey: ["applications"],
    queryFn: getApplications,
  });

  const { data: deployments = [] } = useQuery({
    queryKey: ["deployments"],
    queryFn: () => getDeployments(),
    refetchInterval: 5000,
  });

  const { data: securityStats } = useQuery({
    queryKey: ["securityStats"],
    queryFn: getSecurityStats,
  });

  const { data: pipelines = [] } = useQuery({
    queryKey: ["pipelines"],
    queryFn: () => getPipelines(),
  });

  const { data: rollbacks = [] } = useQuery({
    queryKey: ["rollbacks"],
    queryFn: getRollbacks,
  });

  const activeCanaries = deployments.filter((d) => d.status === "CANARY_ACTIVE");
  const failedDeployments = deployments.filter((d) => d.status === "FAILED" || d.status === "ROLLED_BACK");

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Hero */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Platform Health & Delivery Status</h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time telemetry and canary rollout governance across connected microservices.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/deployments"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-indigo-600/20"
          >
            <Rocket className="h-4 w-4" />
            New Deployment
          </Link>
          <Link
            href="/applications"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-sm font-medium transition"
          >
            <Layers className="h-4 w-4" />
            Manage Services
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Canaries</span>
            <Activity className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-white mt-3">{activeCanaries.length}</div>
          <div className="text-xs text-amber-400/80 mt-1 flex items-center gap-1 font-medium">
            Progressive delivery in progress
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Security CVEs</span>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-3xl font-bold text-white mt-3">
            {securityStats ? securityStats.critical + securityStats.high : 0}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            <span className="text-rose-400 font-semibold">{securityStats?.critical || 0} Critical</span>,{" "}
            <span className="text-amber-400 font-semibold">{securityStats?.high || 0} High</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Automated Rollbacks</span>
            <RotateCcw className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white mt-3">{rollbacks.length}</div>
          <div className="text-xs text-emerald-400/80 mt-1 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Safe auto-recovery triggered
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Monitored Services</span>
            <Layers className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-bold text-white mt-3">{apps.length}</div>
          <div className="text-xs text-slate-400 mt-1">All gates active & configured</div>
        </div>
      </div>

      {/* Active Canary Progression Section */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 backdrop-blur">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Live Progressive Canary Rollouts</h3>
              <p className="text-xs text-slate-400">
                Argo Rollouts automated traffic shift with metric health gates
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
            <Clock className="h-3.5 w-3.5 text-indigo-400" /> Auto-evaluating every 15s
          </span>
        </div>

        {activeCanaries.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-lg">
            <p className="text-sm text-slate-400">No active canary rollouts in progress.</p>
            <p className="text-xs text-slate-500 mt-1">All services are currently running on stable baseline 100%.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeCanaries.map((canary) => {
              const app = apps.find((a) => a.id === canary.application_id);
              const steps = [5, 20, 50, 100];
              return (
                <div
                  key={canary.id}
                  className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">
                          {app ? app.name : "Microservice"}
                        </span>
                        <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-indigo-300">
                          {canary.target_version}
                        </span>
                        <span className="text-xs text-slate-400">
                          (Baseline: {canary.previous_version || "stable"})
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-1">
                        {canary.docker_image}
                      </div>
                    </div>
                    <Link
                      href={`/deployments/${canary.id}`}
                      className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20"
                    >
                      Inspect Rollout <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {/* Progressive Canary Step Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                      <span className="font-medium text-slate-300">
                        Canary Traffic Weight: <span className="text-amber-400 font-bold">{canary.current_canary_weight}%</span>
                      </span>
                      <span>Stable Traffic: {100 - canary.current_canary_weight}%</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {steps.map((step) => {
                        const isReached = canary.current_canary_weight >= step;
                        const isCurrent = canary.current_canary_weight === step;
                        return (
                          <div
                            key={step}
                            className={`p-2.5 rounded-lg border text-center transition ${
                              isCurrent
                                ? "bg-amber-500/10 border-amber-500/40 text-amber-300 ring-1 ring-amber-500/30"
                                : isReached
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                                : "bg-slate-900 border-slate-800 text-slate-500"
                            }`}
                          >
                            <div className="text-xs font-bold">{step}% Traffic</div>
                            <div className="text-[10px] mt-0.5">
                              {isCurrent ? "Analyzing Health" : isReached ? "Passed Gate" : "Pending"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid: Recent Deployments & Rollback Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Deployments Table */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Recent Deployments</h3>
            <Link href="/deployments" className="text-xs text-indigo-400 hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="pb-3 font-semibold">Service</th>
                  <th className="pb-3 font-semibold">Version</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Started</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {deployments.slice(0, 5).map((dep) => {
                  const app = apps.find((a) => a.id === dep.application_id);
                  return (
                    <tr key={dep.id} className="hover:bg-slate-900/30">
                      <td className="py-3 font-medium text-white">{app ? app.name : dep.application_id.slice(0, 8)}</td>
                      <td className="py-3 font-mono">{dep.target_version}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                            dep.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : dep.status === "CANARY_ACTIVE"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : dep.status === "ROLLED_BACK"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {dep.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">{formatDate(dep.started_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Automated Rollbacks Audit Trail */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-rose-400" />
              Automated Rollback Audit
            </h3>
            <span className="text-xs text-slate-500">Protection Log</span>
          </div>

          {rollbacks.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No rollback incidents recorded.</p>
          ) : (
            <div className="space-y-3">
              {rollbacks.slice(0, 4).map((rb) => (
                <div key={rb.id} className="p-3.5 rounded-lg bg-slate-950/70 border border-rose-500/20 text-xs">
                  <div className="flex items-center justify-between text-rose-400 font-semibold mb-1">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {rb.triggered_by.replace(/_/g, " ")}
                    </span>
                    <span className="text-slate-400 text-[11px]">{formatDate(rb.executed_at)}</span>
                  </div>
                  <p className="text-slate-300 text-xs">{rb.trigger_reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

