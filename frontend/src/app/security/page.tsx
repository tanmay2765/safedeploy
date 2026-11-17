"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShieldAlert, ShieldCheck, Filter, Search, AlertCircle } from "lucide-react";
import { getSecurityScans, getSecurityStats } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function SecurityAuditPage() {
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: stats } = useQuery({
    queryKey: ["securityStats"],
    queryFn: getSecurityStats,
  });

  const { data: scans = [], isLoading } = useQuery({
    queryKey: ["securityScans"],
    queryFn: () => getSecurityScans(),
  });

  // Flatten all findings
  const allFindings = scans.flatMap((s) =>
    (s.findings || []).map((f) => ({
      ...f,
      scanTarget: s.scan_target,
      scannerType: s.scanner_type,
      executedAt: s.executed_at,
    }))
  );

  const filtered = allFindings.filter((f) => {
    const matchesSev = filterSeverity === "ALL" || f.severity === filterSeverity;
    const matchesSearch =
      f.vulnerability_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.package_name && f.package_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.description && f.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSev && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">DevSecOps Security Governance</h2>
        <p className="text-sm text-slate-400 mt-1">
          Automated SAST (Semgrep) and Container Vulnerability (Trivy) gates protecting delivery pipelines.
        </p>
      </div>

      {/* Severity Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-rose-500/30 rounded-xl p-4 backdrop-blur">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Critical CVEs</span>
          <div className="text-2xl font-bold text-white mt-2">{stats?.critical || 0}</div>
          <div className="text-[11px] text-rose-400/80 mt-1">Blocks canary rollout immediately</div>
        </div>

        <div className="bg-slate-900/40 border border-amber-500/30 rounded-xl p-4 backdrop-blur">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">High CVEs</span>
          <div className="text-2xl font-bold text-white mt-2">{stats?.high || 0}</div>
          <div className="text-[11px] text-amber-400/80 mt-1">Triggers security gate review</div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 backdrop-blur">
          <span className="text-xs font-semibold uppercase tracking-wider text-yellow-400">Medium CVEs</span>
          <div className="text-2xl font-bold text-white mt-2">{stats?.medium || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Scheduled for remediation</div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 backdrop-blur">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Total Scans</span>
          <div className="text-2xl font-bold text-white mt-2">{stats?.total_scans || scans.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Semgrep SAST + Trivy</div>
        </div>
      </div>

      {/* Controls: Search and Severity Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/30 border border-slate-800 p-4 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search CVE ID, package, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterSeverity === sev
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Findings Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6 font-semibold">Scanner</th>
                <th className="py-3.5 px-6 font-semibold">Vulnerability ID</th>
                <th className="py-3.5 px-6 font-semibold">Severity</th>
                <th className="py-3.5 px-6 font-semibold">Target / File</th>
                <th className="py-3.5 px-6 font-semibold">Installed Version</th>
                <th className="py-3.5 px-6 font-semibold">Fixed Version</th>
                <th className="py-3.5 px-6 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 text-xs">
                    No vulnerabilities found matching current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3.5 px-6">
                      <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {item.scannerType}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-indigo-400 font-semibold">
                      {item.vulnerability_id}
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.severity === "CRITICAL"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : item.severity === "HIGH"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : item.severity === "MEDIUM"
                            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            : "bg-blue-500/10 text-blue-400"
                        }`}
                      >
                        {item.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-slate-400 max-w-xs truncate">
                      {item.package_name || item.file_path || item.scanTarget}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-slate-400">{item.installed_version || "—"}</td>
                    <td className="py-3.5 px-6 font-mono text-emerald-400 font-semibold">
                      {item.fixed_version || "None"}
                    </td>
                    <td className="py-3.5 px-6 text-slate-300 max-w-sm truncate">{item.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

