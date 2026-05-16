import {
  Cpu,
  HardDrive,
  Database,
  Zap,
  RotateCcw,
  GitBranch,
  Server,
  AlertOctagon,
} from "lucide-react";

// ── Rule engine — deterministic, instant, no AI needed ───────────────────────
function detectSuggestions(summary) {
  if (!summary) return [];
  const suggestions = [];
  const pmt = (summary.byApi && summary.byApi.payment) || {};
  const ref = (summary.byApi && summary.byApi.refund) || {};

  // CPU saturation
  if (summary.peakCpu > 85) {
    suggestions.push({
      id: "cpu-high",
      icon: Cpu,
      severity: "critical",
      team: "OPS",
      title: `CPU Saturation (${summary.peakCpu}%)`,
      action: `Scale out: add ${Math.ceil(summary.peakCpu / 70)} more app instances or upgrade to a compute-optimised tier (e.g. c5.2xlarge → c5.4xlarge). Set auto-scale trigger at 60% CPU.`,
    });
  } else if (summary.peakCpu > 70) {
    suggestions.push({
      id: "cpu-warn",
      icon: Cpu,
      severity: "warning",
      team: "OPS",
      title: `CPU Headroom Low (${summary.peakCpu}%)`,
      action: `Configure horizontal auto-scaling policy: scale out at 65% CPU, scale in at 35%. Consider upgrading instance type before launch.`,
    });
  }

  // Memory pressure
  if (summary.peakMemory > 85) {
    suggestions.push({
      id: "mem-high",
      icon: HardDrive,
      severity: "critical",
      team: "OPS",
      title: `Memory Pressure (${summary.peakMemory}%)`,
      action: `Increase instance RAM — upgrade to 32GB+ per node. Check for memory leaks (heap profiling). Add JVM/Node heap size flags. Current trajectory: OOM kill at ~${Math.round((100 / summary.peakMemory) * summary.targetUsers)} users.`,
    });
  } else if (summary.peakMemory > 75) {
    suggestions.push({
      id: "mem-warn",
      icon: HardDrive,
      severity: "warning",
      team: "OPS",
      title: `Memory Headroom Low (${summary.peakMemory}%)`,
      action: `Increase container memory limits. Add Redis object caching to reduce in-memory state. Monitor heap with APM tooling.`,
    });
  }

  // High latency → caching
  if (summary.peakP95 > 1500) {
    suggestions.push({
      id: "latency-cache",
      icon: Zap,
      severity: "critical",
      team: "DEV",
      title: `P95 Latency ${summary.peakP95}ms — Add Caching`,
      action: `Deploy Redis (ElastiCache) in front of wallet balance + transaction history reads. Expected cache hit rate: 80-90%. Target: reduce P95 to <300ms. TTL: 30s for balances, 5min for statements.`,
    });
  } else if (summary.peakP95 > 800) {
    suggestions.push({
      id: "latency-warn",
      icon: Zap,
      severity: "warning",
      team: "DEV",
      title: `P95 Latency ${summary.peakP95}ms — Optimise Queries`,
      action: `Run EXPLAIN ANALYZE on top 5 slow DB queries. Add composite indexes for payment and wallet lookups. Consider read replicas for analytics queries.`,
    });
  }

  // Payment failures → async + circuit breaker
  if ((pmt.peakErrorRate || 0) > 10) {
    suggestions.push({
      id: "payment-async",
      icon: GitBranch,
      severity: "critical",
      team: "DEV",
      title: `Payment API ${pmt.peakErrorRate}% Failures — Go Async`,
      action: `Convert /payments/process to async: return HTTP 202 → push to Redis queue → worker processes → webhook callback. Add circuit breaker (trip at 30% error rate, reset after 30s). Estimated fix: eliminates ${pmt.peakErrorRate - 1}% of failures.`,
    });
  } else if ((pmt.peakErrorRate || 0) > 3) {
    suggestions.push({
      id: "payment-retry",
      icon: GitBranch,
      severity: "warning",
      team: "DEV",
      title: `Payment API ${pmt.peakErrorRate}% Failures — Add Retry`,
      action: `Implement exponential backoff retry (100ms, 400ms, 1600ms) on payment gateway calls. Add idempotency keys to prevent duplicate charges on retry.`,
    });
  }

  // DB connection pool (inferred from latency + error correlation)
  if (summary.peakP95 > 800 && summary.avgErrorRate > 3) {
    suggestions.push({
      id: "db-pool",
      icon: Database,
      severity: "critical",
      team: "DBA",
      title: `DB Connection Pool Exhaustion`,
      action: `Deploy PgBouncer in transaction-mode pooling. Increase max_connections to 500. Add read replica for SELECT-heavy wallet/history endpoints. Current pool likely exhausted at ~${Math.floor(summary.targetUsers * 0.5)} users.`,
    });
  }

  // Refund failures → queue
  if ((ref.peakErrorRate || 0) > 15) {
    suggestions.push({
      id: "refund-queue",
      icon: RotateCcw,
      severity: "warning",
      team: "DEV",
      title: `Refund API ${ref.peakErrorRate}% Failures — Use Queue`,
      action: `Move refund processing to async job queue (BullMQ/Redis). Return 202 Accepted immediately, process in background. Add dead-letter queue for failed refunds with alerting.`,
    });
  }

  // High overall error rate → load shedding
  if (summary.peakErrorRate > 20) {
    suggestions.push({
      id: "load-shed",
      icon: Server,
      severity: "critical",
      team: "OPS",
      title: `${summary.peakErrorRate}% Error Rate — Implement Load Shedding`,
      action: `Add NGINX rate limiting: 500 req/s per client, burst 1000. Deploy API Gateway with throttling. Enable queue-based load levelling. Consider feature flags to disable non-critical endpoints during peak.`,
    });
  }

  return suggestions;
}

// ── Severity colours ──────────────────────────────────────────────────────────
const SEV = {
  critical: {
    border: "border-cyber-red/30",
    bg: "bg-cyber-red/5",
    dot: "bg-cyber-red",
    tag: "text-cyber-red",
    tagBg: "bg-cyber-red/15",
  },
  warning: {
    border: "border-cyber-amber/30",
    bg: "bg-cyber-amber/5",
    dot: "bg-cyber-amber",
    tag: "text-cyber-amber",
    tagBg: "bg-cyber-amber/15",
  },
};

const TEAM_COLOR = {
  OPS: "text-cyber-cyan   bg-cyber-cyan/10   border-cyber-cyan/30",
  DEV: "text-cyber-purple bg-cyber-purple/10 border-cyber-purple/30",
  DBA: "text-cyber-green  bg-cyber-green/10  border-cyber-green/30",
};

export default function QuickSuggestions({ summary }) {
  const suggestions = detectSuggestions(summary);
  if (!suggestions.length) return null;

  const critCount = suggestions.filter((s) => s.severity === "critical").length;

  return (
    <div className="glass-card p-4 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertOctagon size={15} className="text-cyber-amber" />
          <p className="font-mono font-bold text-sm text-cyber-text">
            Operational Recommendations
          </p>
          <span className="font-mono text-[10px] text-cyber-muted">
            auto-detected from metrics
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px]">
          {critCount > 0 && (
            <span className="px-2 py-0.5 rounded bg-cyber-red/15 text-cyber-red border border-cyber-red/30 font-bold">
              {critCount} CRITICAL
            </span>
          )}
          <span className="px-2 py-0.5 rounded bg-cyber-muted/10 text-cyber-muted border border-cyber-muted/20">
            {suggestions.length} total
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {suggestions.map((s) => {
          const style = SEV[s.severity] || SEV.warning;
          const teamStyle = TEAM_COLOR[s.team] || TEAM_COLOR.DEV;
          const Icon = s.icon;
          return (
            <div
              key={s.id}
              className={`border rounded-lg p-3 space-y-2 ${style.border} ${style.bg}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon size={13} className={style.tag} />
                  <span className="font-mono font-semibold text-xs text-cyber-text">
                    {s.title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span
                    className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border ${teamStyle}`}
                  >
                    {s.team}
                  </span>
                  <span
                    className={`font-mono text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${style.tagBg} ${style.tag}`}
                  >
                    {s.severity}
                  </span>
                </div>
              </div>
              <p className="font-mono text-[11px] leading-relaxed text-cyber-muted pl-0">
                {s.action}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
