"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Rocket,
  ShieldAlert,
  RotateCcw,
  Activity,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Play,
  Clock,
} from "lucide-react";
import Link from "next/link";
import {
  getDeployment,
  promoteCanary,
  triggerRollback,
  getApplications,
} from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function DeploymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const depId = params.id as string;
  const [rollbackReason, setRollbackReason] = useState("");
  const [showRollbackModal, setShowRollbackModal] = useState(false);

  const { data: deployment, isLoading } = useQuery({
    queryKey: ["deployment", depId],
    queryFn: () => getDeployment(depId),
    refetchInterval: 3000,
  });

  const { data: apps = [] } = useQuery({
    queryKey: ["applications"],
    queryFn: getApplications,
  });

  const promoteMutation = useMutation({
    mutationFn: () => promoteCanary(depId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deployment", depId] });
      queryClient.invalidateQueries({ queryKey: ["deployments"] });
    },
  });

  const rollbackMutation = useMutation({
    mutationFn: (reason: string) => triggerRollback(depId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deployment", depId] });
      queryClient.invalidateQueries({ queryKey: ["deployments"] });
      setShowRollbackModal(false);
    },
  });

  if (isLoading || !deployment) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Activity className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-400" />
        Loading rollout telemetry...
      </div>
    );
  }

  const app = apps.find((a) => a.id === deployment.application_id);
  const steps = [5, 20, 50, 100];

  // Chart data from metric records
  const chartData = (deployment.metric_records || []).map((m) => ({
    time: new Date(m.recorded_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    value: m.value,
    threshold: m.threshold,
    metric: m.metric_name,
  }));

  const errorMetrics = chartData.filter((d) => d.metric === "http_error_rate_percent");
  const latencyMetrics = chartData.filter((d) => d.metric === "p99_latency_ms");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/deployments"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {app ? app.name : "Microservice Rollout"}
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {deployment.target_version}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">{deployment.docker_image}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {deployment.status === "CANARY_ACTIVE" && (
            <>
              <button
                onClick={() => promoteMutation.mutate()}
                disabled={promoteMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-emerald-600/20"
              >
                <Play className="h-4 w-4" />
                {promoteMutation.isPending ? "Promoting..." : "Promote Next Step"}
              </button>
              <button
                onClick={() => setShowRollbackModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-rose-600/20"
              >
                <RotateCcw className="h-4 w-4" />
                Abort & Rollback
              </button>
            </>
          )}
        </div>
      </div>

      {/* Rollback Alert Banner if status is ROLLED_BACK */}
      {deployment.status === "ROLLED_BACK" && deployment.rollback_events && deployment.rollback_events.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-5 text-rose-300">
          <div className="flex items-center gap-2 font-bold text-sm mb-1 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
            Canary Aborted: {deployment.rollback_events[0].triggered_by.replace(/_/g, " ")}
          </div>
          <p className="text-xs text-rose-200">{deployment.rollback_events[0].trigger_reason}</p>
          <div className="text-[11px] text-rose-400/80 mt-2 font-mono">
            Restored stable baseline version: {deployment.previous_version || "initial"} • Executed at{" "}
            {formatDate(deployment.rollback_events[0].executed_at)}
          </div>
        </div>
      )}

      {/* Canary Step Progression Card */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 backdrop-blur space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            Argo Rollouts Traffic Shifting
          </h3>
          <span className="text-xs text-amber-400 font-bold">
            Current Canary Weight: {deployment.current_canary_weight}%
          </span>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {steps.map((step) => {
            const isReached = deployment.current_canary_weight >= step;
            const isCurrent = deployment.current_canary_weight === step && deployment.status === "CANARY_ACTIVE";
            return (
              <div
                key={step}
                className={`p-4 rounded-xl border text-center transition ${
                  isCurrent
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-300 ring-2 ring-amber-500/30"
                    : isReached
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-slate-950 border-slate-800/80 text-slate-500"
                }`}
              >
                <div className="text-base font-bold">{step}% Traffic</div>
                <div className="text-xs mt-1">
                  {isCurrent
                    ? "Active Evaluation"
                    : isReached
                    ? "Verified Safe"
                    : "Scheduled"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Telemetry Visualizations (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Error Rate Chart */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-semibold text-white">HTTP 5xx Error Rate (%)</h4>
              <p className="text-xs text-slate-400">Threshold: 1.0% maximum allowable</p>
            </div>
            <Activity className="h-4 w-4 text-amber-400" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={errorMetrics.length > 0 ? errorMetrics : [{ time: "00:00", value: 0.14, threshold: 1.0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="%" domain={[0, 2]} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155" }} />
                <Legend />
                <Line type="monotone" dataKey="value" name="Observed Error %" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="threshold" name="Safety Threshold" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* P99 Latency Chart */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-semibold text-white">P99 Latency (ms)</h4>
              <p className="text-xs text-slate-400">Threshold: 250ms maximum allowable</p>
            </div>
            <Clock className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latencyMetrics.length > 0 ? latencyMetrics : [{ time: "00:00", value: 140, threshold: 250 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="ms" domain={[0, 300]} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155" }} />
                <Legend />
                <Line type="monotone" dataKey="value" name="P99 Latency" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="threshold" name="Safety Threshold" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Security Findings for this Rollout */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 backdrop-blur">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-emerald-400" />
          Security Scans & Findings for {deployment.target_version}
        </h3>

        {(!deployment.security_scans || deployment.security_scans.length === 0) ? (
          <p className="text-xs text-slate-500 py-4">No security scans recorded for this deployment.</p>
        ) : (
          <div className="space-y-4">
            {deployment.security_scans.map((scan) => (
              <div key={scan.id} className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {scan.scanner_type}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{scan.scan_target}</span>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      scan.status === "PASSED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {scan.status}
                  </span>
                </div>

                {/* Findings Table */}
                {scan.findings && scan.findings.length > 0 && (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-slate-500 uppercase text-[10px] border-b border-slate-800">
                        <tr>
                          <th className="pb-1.5">Vulnerability ID</th>
                          <th className="pb-1.5">Severity</th>
                          <th className="pb-1.5">Package / File</th>
                          <th className="pb-1.5">Fix Available</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40 text-slate-300">
                        {scan.findings.map((f) => (
                          <tr key={f.id}>
                            <td className="py-2 font-mono text-indigo-400">{f.vulnerability_id}</td>
                            <td className="py-2">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400">
                                {f.severity}
                              </span>
                            </td>
                            <td className="py-2 font-mono text-slate-400">{f.package_name || f.file_path}</td>
                            <td className="py-2 text-emerald-400 font-mono">{f.fixed_version || "N/A"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rollback Reason Modal */}
      {showRollbackModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2 text-rose-400">
              <RotateCcw className="h-5 w-5" /> Confirm Manual Rollback
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              This will immediately abort the canary rollout and restore 100% traffic to stable version{" "}
              <span className="font-bold text-white">{deployment.previous_version || "stable"}</span>.
            </p>

            <textarea
              required
              rows={3}
              placeholder="State reason for manual abort (e.g. Critical customer bug detected in staging)..."
              value={rollbackReason}
              onChange={(e) => setRollbackReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-rose-500"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowRollbackModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => rollbackMutation.mutate(rollbackReason || "Manual operator abort")}
                disabled={rollbackMutation.isPending}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium"
              >
                {rollbackMutation.isPending ? "Aborting..." : "Confirm Rollback"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

