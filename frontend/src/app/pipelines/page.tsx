"use client";

import { useQuery } from "@tanstack/react-query";
import { GitBranch, GitCommit, Clock, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { getPipelines, getApplications } from "@/lib/api";
import { formatDate, formatDuration } from "@/lib/utils";

export default function PipelinesPage() {
  const { data: apps = [] } = useQuery({
    queryKey: ["applications"],
    queryFn: getApplications,
  });

  const { data: pipelines = [], isLoading } = useQuery({
    queryKey: ["pipelines"],
    queryFn: () => getPipelines(),
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">CI/CD Pipeline History</h2>
        <p className="text-sm text-slate-400 mt-1">
          Jenkins automated pipeline runs with step-level telemetry, security gates, and artifact publishing.
        </p>
      </div>

      {/* Pipelines List */}
      <div className="space-y-4">
        {pipelines.map((run) => {
          const app = apps.find((a) => a.id === run.application_id);
          const totalDuration = Object.values(run.stage_durations || {}).reduce(
            (acc, curr) => acc + (typeof curr === "number" ? curr : 0),
            0
          );

          return (
            <div
              key={run.id}
              className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 backdrop-blur space-y-4 hover:border-slate-700 transition"
            >
              {/* Top Row: Build info & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      run.status === "SUCCESS"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {run.status === "SUCCESS" ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {app ? app.name : "Microservice"}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Build #{run.jenkins_build_number}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          run.status === "SUCCESS"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {run.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <GitCommit className="h-3.5 w-3.5 text-indigo-400" />
                      <span className="font-mono text-slate-300">{run.git_commit_hash.slice(0, 8)}</span>
                      <span>•</span>
                      <span className="text-slate-300">{run.git_commit_message || "Automated delivery run"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-1 font-medium text-slate-300">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {formatDuration(totalDuration)}
                  </div>
                  <span>•</span>
                  <span>{formatDate(run.started_at)}</span>
                  <a
                    href={run.jenkins_build_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 transition"
                    title="Open Jenkins Console"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Stage Progression Visualizer */}
              {run.stage_durations && Object.keys(run.stage_durations).length > 0 && (
                <div className="pt-2 border-t border-slate-800/60">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Pipeline Stages
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {Object.entries(run.stage_durations).map(([stage, duration]) => (
                      <div
                        key={stage}
                        className="p-2 rounded bg-slate-950/80 border border-slate-800/80 text-center"
                      >
                        <div className="text-[11px] font-medium text-slate-300 truncate" title={stage}>
                          {stage}
                        </div>
                        <div className="text-[10px] font-mono text-indigo-400 mt-0.5">
                          {typeof duration === "number" ? `${duration.toFixed(1)}s` : duration}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

