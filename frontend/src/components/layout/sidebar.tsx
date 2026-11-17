"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Rocket,
  ShieldAlert,
  GitBranch,
  Activity,
  Server,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Applications", href: "/applications", icon: Layers },
  { name: "Deployments", href: "/deployments", icon: Rocket },
  { name: "Security Audit", href: "/security", icon: ShieldAlert },
  { name: "CI/CD Pipelines", href: "/pipelines", icon: GitBranch },
  { name: "Telemetry & Metrics", href: "/monitoring", icon: Activity },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
          SD
        </div>
        <div>
          <span className="font-bold text-base tracking-tight text-white block">SafeDeploy</span>
          <span className="text-[10px] text-slate-400 font-medium block uppercase tracking-wider">
            DevSecOps Platform
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        <div className="text-[11px] font-semibold text-slate-500 uppercase px-3 mb-2 tracking-wider">
          Platform Delivery
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-indigo-400" : "text-slate-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Infrastructure pill */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5 text-cyan-400" />
              k3s Cluster
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active
            </span>
          </div>
          <div className="text-[11px] text-slate-400">Argo Rollouts v1.7.1</div>
          <div className="text-[10px] text-slate-500 truncate">AWS EC2 (ap-south-1)</div>
        </div>
      </div>
    </aside>
  );
}

