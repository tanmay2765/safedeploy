"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layers, Plus, GitBranch, Shield, Trash2, CheckCircle2 } from "lucide-react";
import { getApplications, createApplication } from "@/lib/api";
import { Application } from "@/types";
import { formatDate } from "@/lib/utils";

export default function ApplicationsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    repository_url: "",
    git_branch: "main",
    k8s_namespace: "production",
    max_error_rate_percent: 1.0,
    max_p99_latency_ms: 250,
  });

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: getApplications,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return createApplication({
        name: data.name,
        slug: data.slug,
        repository_url: data.repository_url,
        git_branch: data.git_branch,
        k8s_namespace: data.k8s_namespace,
        threshold_config: {
          max_error_rate_percent: Number(data.max_error_rate_percent),
          max_p99_latency_ms: Number(data.max_p99_latency_ms),
          security_gate_fail_on: ["CRITICAL", "HIGH"],
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setIsModalOpen(false);
      setFormData({
        name: "",
        slug: "",
        repository_url: "",
        git_branch: "main",
        k8s_namespace: "production",
        max_error_rate_percent: 1.0,
        max_p99_latency_ms: 250,
      });
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Application Microservices</h2>
          <p className="text-sm text-slate-400 mt-1">
            Configure repositories, target Kubernetes namespaces, and automated canary thresholds.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-indigo-600/20"
        >
          <Plus className="h-4 w-4" />
          Register Application
        </button>
      </div>

      {/* Grid of Applications */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app) => (
          <div
            key={app.id}
            className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 backdrop-blur flex flex-col justify-between hover:border-slate-700 transition"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">{app.name}</h3>
                  <span className="text-xs font-mono text-slate-400">{app.slug}</span>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-slate-400">Branch:</span>
                  <span className="font-mono text-slate-200">{app.git_branch}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-slate-400">Namespace:</span>
                  <span className="font-mono text-slate-200">{app.k8s_namespace}</span>
                </div>
                <div className="text-slate-400 truncate">
                  Repo: <span className="font-mono text-slate-300">{app.repository_url}</span>
                </div>
              </div>

              {/* Thresholds Card */}
              <div className="mt-4 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] space-y-1.5">
                <div className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="h-3 w-3 text-amber-400" /> Rollback Thresholds
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Max Error Rate:</span>
                  <span className="font-bold text-amber-400">
                    {app.threshold_config?.max_error_rate_percent}%
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Max P99 Latency:</span>
                  <span className="font-bold text-cyan-400">
                    {app.threshold_config?.max_p99_latency_ms} ms
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>Added: {formatDate(app.created_at)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Register App Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Register New Microservice</h3>
            <p className="text-xs text-slate-400 mb-5">
              Bind a GitHub repository and set up automated canary deployment safety gates.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(formData);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Catalog Service"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
                    setFormData({ ...formData, name, slug });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Slug Identifier</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Git Repository URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/safedeploy/catalog-service.git"
                  value={formData.repository_url}
                  onChange={(e) => setFormData({ ...formData, repository_url: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Git Branch</label>
                  <input
                    type="text"
                    required
                    value={formData.git_branch}
                    onChange={(e) => setFormData({ ...formData, git_branch: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">K8s Namespace</label>
                  <input
                    type="text"
                    required
                    value={formData.k8s_namespace}
                    onChange={(e) => setFormData({ ...formData, k8s_namespace: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Max 5xx Error Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.max_error_rate_percent}
                    onChange={(e) =>
                      setFormData({ ...formData, max_error_rate_percent: parseFloat(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Max P99 Latency (ms)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.max_p99_latency_ms}
                    onChange={(e) =>
                      setFormData({ ...formData, max_p99_latency_ms: parseInt(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
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
                  {createMutation.isPending ? "Saving..." : "Register Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

