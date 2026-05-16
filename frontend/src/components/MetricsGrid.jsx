import {
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Clock,
  AlertTriangle,
  Users,
  Cpu,
  Database,
} from "lucide-react";

function MetricCard({
  label,
  value,
  unit,
  sub,
  icon: Icon,
  colorClass,
  glowClass,
  trend,
  animated,
}) {
  return (
    <div
      className={`glass-card p-4 relative overflow-hidden ${glowClass} transition-all duration-300`}
    >
      {/* Subtle corner accent */}
      <div
        className={`absolute top-0 right-0 w-12 h-12 opacity-10 ${colorClass}`}
        style={{
          background:
            "radial-gradient(circle at top right, currentColor, transparent 70%)",
        }}
      />

      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon size={12} className={colorClass} />}
          <span className="text-cyber-muted text-[10px] font-mono uppercase tracking-widest">
            {label}
          </span>
        </div>
        {trend === "up" && <TrendingUp size={12} className="text-cyber-red" />}
        {trend === "down" && (
          <TrendingDown size={12} className="text-cyber-green" />
        )}
        {trend === "flat" && <Minus size={12} className="text-cyber-muted" />}
      </div>

      <div className="flex items-baseline gap-1">
        <span
          className={`font-mono font-bold text-2xl leading-none ${colorClass} ${animated ? "transition-all duration-500" : ""}`}
        >
          {value ?? "—"}
        </span>
        {unit && (
          <span className="text-cyber-muted font-mono text-xs">{unit}</span>
        )}
      </div>

      {sub && (
        <p className="text-cyber-muted font-mono text-[10px] mt-1.5">{sub}</p>
      )}
    </div>
  );
}

function getLatencyColor(ms) {
  if (!ms) return { color: "text-cyber-muted", glow: "" };
  if (ms < 300) return { color: "text-cyber-green", glow: "card-glow-green" };
  if (ms < 800) return { color: "text-cyber-amber", glow: "card-glow-amber" };
  return { color: "text-cyber-red", glow: "card-glow-red" };
}

function getErrorColor(rate) {
  if (rate == null) return { color: "text-cyber-muted", glow: "" };
  if (rate < 1) return { color: "text-cyber-green", glow: "card-glow-green" };
  if (rate < 5) return { color: "text-cyber-amber", glow: "card-glow-amber" };
  return { color: "text-cyber-red", glow: "card-glow-red" };
}

function getCpuColor(pct) {
  if (pct == null) return "text-cyber-muted";
  if (pct < 60) return "text-cyber-green";
  if (pct < 80) return "text-cyber-amber";
  return "text-cyber-red";
}

const IDLE_VALUES = {
  rps: "—",
  lat: "—",
  err: "—",
  users: "—",
  cpu: "—",
  mem: "—",
};

export default function MetricsGrid({ metrics, testStatus }) {
  const m = metrics;
  const running = testStatus === "running";

  const latencyStyle = getLatencyColor(m?.avgLatency);
  const errorStyle = getErrorColor(m?.errorRate);
  const cpuColor = getCpuColor(m?.cpuUsage);

  // Simple trend detection (would compare against previous — kept simple here)
  const errTrend =
    m?.errorRate > 3 ? "up" : m?.errorRate > 0.5 ? "flat" : "down";
  const latTrend = m?.avgLatency > 500 ? "up" : "flat";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <MetricCard
        label="Requests/sec"
        value={running && m ? m.rps.toLocaleString() : IDLE_VALUES.rps}
        icon={Zap}
        colorClass="text-cyber-cyan"
        glowClass="card-glow-cyan"
        sub={
          m ? `Total: ${m.totalRequests?.toLocaleString()}` : "Waiting for test"
        }
        animated
      />
      <MetricCard
        label="Avg Latency"
        value={running && m ? m.avgLatency : IDLE_VALUES.lat}
        unit="ms"
        icon={Clock}
        colorClass={latencyStyle.color}
        glowClass={latencyStyle.glow}
        sub={m ? `P95: ${m.p95Latency}ms` : ""}
        trend={latTrend}
        animated
      />
      <MetricCard
        label="Error Rate"
        value={running && m ? `${m.errorRate}` : IDLE_VALUES.err}
        unit="%"
        icon={AlertTriangle}
        colorClass={errorStyle.color}
        glowClass={errorStyle.glow}
        sub={m ? `Failed: ${m.failedRequests?.toLocaleString()}` : ""}
        trend={errTrend}
        animated
      />
      <MetricCard
        label="Active Users"
        value={
          running && m ? m.currentUsers?.toLocaleString() : IDLE_VALUES.users
        }
        icon={Users}
        colorClass="text-cyber-purple"
        glowClass=""
        sub={m ? `Load factor: ${m.loadFactor}×` : ""}
        animated
      />
      <MetricCard
        label="CPU Usage"
        value={running && m ? m.cpuUsage : IDLE_VALUES.cpu}
        unit="%"
        icon={Cpu}
        colorClass={cpuColor}
        glowClass={
          m?.cpuUsage > 80
            ? "card-glow-red"
            : m?.cpuUsage > 60
              ? "card-glow-amber"
              : ""
        }
        sub={m ? `Mem: ${m.memoryUsage}%` : ""}
        animated
      />
      <MetricCard
        label="Throughput"
        value={running && m ? `${m.p95Latency}` : IDLE_VALUES.mem}
        unit="ms p95"
        icon={Database}
        colorClass={getLatencyColor(m?.p95Latency).color}
        glowClass=""
        sub={m ? `P99: ${m.p99Latency}ms` : ""}
        animated
      />
    </div>
  );
}
