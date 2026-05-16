const API_META = {
  login: { label: "Auth / Login", icon: "🔑" },
  payment: { label: "Payment Processing", icon: "💳" },
  wallet: { label: "Wallet Balance", icon: "👛" },
  refund: { label: "Refund Processing", icon: "↩️" },
};

function StatusBadge({ status }) {
  const classes = {
    healthy: "badge-healthy",
    degraded: "badge-degraded",
    critical: "badge-critical",
    down: "badge-down",
    idle: "badge-idle",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider ${classes[status] ?? classes.idle}`}
    >
      {status ?? "idle"}
    </span>
  );
}

function LatencyBar({ value, max = 3000 }) {
  if (value == null)
    return <div className="text-cyber-muted text-xs font-mono">—</div>;
  const pct = Math.min((value / max) * 100, 100);
  const color =
    value < 300
      ? "bg-cyber-green"
      : value < 800
        ? "bg-cyber-amber"
        : "bg-cyber-red";
  return (
    <div className="flex items-center gap-2">
      <div className="progress-track h-1.5 w-16 flex-shrink-0">
        <div
          className={`progress-fill h-1.5 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-xs text-cyber-text">{value}ms</span>
    </div>
  );
}

function ErrorBadge({ rate }) {
  if (rate == null)
    return <span className="text-cyber-muted font-mono text-xs">—</span>;
  const color =
    rate < 1
      ? "text-cyber-green"
      : rate < 5
        ? "text-cyber-amber"
        : "text-cyber-red";
  return (
    <span className={`font-mono text-xs font-bold ${color}`}>{rate}%</span>
  );
}

export default function APIHealthTable({ byApi, testStatus }) {
  const apis = ["login", "payment", "wallet", "refund"];
  const running = testStatus === "running";
  const complete = testStatus === "complete";

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] font-mono text-cyber-muted uppercase tracking-widest">
            API Health Matrix
          </p>
          <p className="text-xs font-mono text-cyber-text">
            Per-endpoint Performance
          </p>
        </div>
        {running && (
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-cyber-green">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse-fast" />
            LIVE
          </span>
        )}
      </div>

      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="text-cyber-muted text-[10px] uppercase tracking-wide border-b border-cyber-border">
            <th className="text-left pb-2 pr-3">Endpoint</th>
            <th className="text-center pb-2 pr-3">Status</th>
            <th className="text-left pb-2 pr-3">Avg Latency</th>
            <th className="text-center pb-2 pr-3">RPS</th>
            <th className="text-center pb-2">Error Rate</th>
          </tr>
        </thead>
        <tbody>
          {apis.map((api) => {
            const data = byApi?.[api];
            const meta = API_META[api];

            return (
              <tr
                key={api}
                className={`border-b border-cyber-border/40 hover:bg-cyber-card2/50 transition-colors
                  ${data?.status === "critical" ? "bg-cyber-red/5" : ""}
                  ${data?.status === "down" ? "bg-cyber-red/10" : ""}`}
              >
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-2">
                    <span>{meta.icon}</span>
                    <div>
                      <div className="text-cyber-text font-semibold">
                        {meta.label}
                      </div>
                      <div className="text-cyber-muted text-[10px]">
                        /
                        {api === "login"
                          ? "auth/login"
                          : api === "payment"
                            ? "payments/process"
                            : api === "wallet"
                              ? "wallet/balance"
                              : "refunds/process"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 pr-3 text-center">
                  <StatusBadge
                    status={
                      (running || complete) && data ? data.status : "idle"
                    }
                  />
                </td>
                <td className="py-2.5 pr-3">
                  <LatencyBar
                    value={
                      (running || complete) && data ? data.avgLatency : null
                    }
                  />
                </td>
                <td className="py-2.5 pr-3 text-center">
                  {(running || complete) && data ? (
                    <span className="text-cyber-accent">{data.rps}</span>
                  ) : (
                    <span className="text-cyber-muted">—</span>
                  )}
                </td>
                <td className="py-2.5 text-center">
                  <ErrorBadge
                    rate={(running || complete) && data ? data.errorRate : null}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {!running && !complete && (
        <p className="text-center text-cyber-muted font-mono text-xs mt-3">
          Start a test to see API health
        </p>
      )}
    </div>
  );
}
