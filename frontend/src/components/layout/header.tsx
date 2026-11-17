"use client";

import { Bell, RefreshCw, CheckCircle2, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function Header() {
  const { data: health, isLoading } = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const res = await api.get("/health");
      return res.data;
    },
    refetchInterval: 10000,
  });

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/70 backdrop-blur px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-slate-300">
          Continuous Delivery & Safety Governance
        </h1>
        <span className="text-slate-600">/</span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Environment: Production (Canary Enabled)
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Backend Connectivity Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
          <div
            className={`h-2 w-2 rounded-full ${
              isLoading || !health ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
            }`}
          />
          <span className="text-slate-300 font-medium">
            API: {health ? "Connected" : "Reconnecting..."}
          </span>
        </div>

        {/* Security Gate Status Pill */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 border-l border-slate-800 pl-4">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Gates Active: Semgrep + Trivy</span>
        </div>
      </div>
    </header>
  );
}

