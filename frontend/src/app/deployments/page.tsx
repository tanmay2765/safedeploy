"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Rocket, Plus, ArrowUpRight, CheckCircle2, RotateCcw, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { getDeployments, getApplications, createDeployment } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function DeploymentsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    application_id: "",
    target_version: "v1.3.0",
    previous_version: "v1.2.0",
    docker_image: "123456789.dkr.ecr.us-east-1.amazonaws.com/service:v1.3.0",
  });

  const { data: apps = [] } = useQuery({
    queryKey: ["applications"],
    queryFn: getApplications,
  });

  const { data: deployments = [], isLoading } = useQuery({
    queryKey: ["deployments"],
    queryFn: () => getDeployments(),
    refetchInterval: 5000,
  });

  const createMutation = useMutation({
    mutationFn: createDeployment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deployments"] });
      setIsModalOpen(false);
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Canary Deployments</h2>
          <p className="text-sm text-slate-400 mt-1">
            Progressive rollout orchestration, Argo traffic weights, and deployment history.
          </p>
        </div>
        <button
          onClick={() => {
            if (apps.length > 0 && !formData.application_id) {
              setFormData({ ...formData, application_id: apps[0].id });
            }
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-indigo-600/20"
        >
          <Plus className="h-4 w-4" />
          Trigger Rollout
        </button>
      </div>

      {/* Deployments Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6 font-semibold">Service</th>
                <th className="py-3.5 px-6 font-semibold">Target Version</th>
                <th className="py-3.5 px-6 font-semibold">Docker Image Tag</th>
                <th className="py-3.5 px-6 font-semibold">Canary Traffic</th>
                <th className="py-3.5 px-6 font-semibold">Status</th>
                <th className="py-3.5 px-6 font-semibold">Started</th>
                <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {deployments.map((dep) => {
                const app = apps.find((a) => a.id === dep.application_id);
                return (
                  <tr key={dep.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-4 px-6 font-medium text-white">
                      {app ? app.name : dep.application_id.slice(0, 8)}
                    </td>
                    <td className="py-4 px-6 font-mono text-indigo-400 font-semibold">
                      {dep.target_version}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-400 max-w-xs truncate">
                      {dep.docker_image}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-400">{dep.current_canary_weight}%</span>
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all"
                            style={{ width: `${dep.current_canary_weight}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold uppercase ${
                          dep.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : dep.status === "CANARY_ACTIVE"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                            : dep.status === "ROLLED_BACK"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {dep.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400">{formatDate(dep.started_at)}</td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/deployments/${dep.id}`}
                        className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        Details <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trigger Deployment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Trigger Progressive Canary Rollout</h3>
            <p className="text-xs text-slate-400 mb-5">
              Deploys new Docker image with Argo Rollouts step progression (5% → 20% → 50% → 100%).
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(formData);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Microservice</label>
                <select
                  value={formData.application_id}
                  onChange={(e) => setFormData({ ...formData, application_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {apps.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name} ({app.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">New Target Version</label>
                  <input
                    type="text"
                    required
                    value={formData.target_version}
                    onChange={(e) => setFormData({ ...formData, target_version: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Previous Stable Version</label>
                  <input
                    type="text"
                    value={formData.previous_version}
                    onChange={(e) => setFormData({ ...formData, previous_version: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Immutable Docker Image Tag (AWS ECR)
                </label>
                <input
                  type="text"
                  required
                  value={formData.docker_image}
                  onChange={(e) => setFormData({ ...formData, docker_image: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition"
                >
                  {createMutation.isPending ? "Deploying..." : "Launch Canary"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

