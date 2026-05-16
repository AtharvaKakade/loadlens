import { Play, Square, ChevronRight, Users, Clock, Layers } from "lucide-react";

const SCENARIOS = [
  {
    label: "Normal Day",
    users: 1000,
    duration: 60,
    trafficType: "normal",
    color: "text-cyber-green",
  },
  {
    label: "Payment Rush",
    users: 2500,
    duration: 90,
    trafficType: "payment_rush",
    color: "text-cyber-amber",
  },
  {
    label: "Market Open",
    users: 3500,
    duration: 90,
    trafficType: "market_open",
    color: "text-cyber-accent",
  },
  {
    label: "Black Friday",
    users: 5000,
    duration: 120,
    trafficType: "black_friday",
    color: "text-cyber-red",
  },
];

const TRAFFIC_LABELS = {
  normal: "Normal Day",
  payment_rush: "Payment Rush",
  market_open: "Market Open",
  black_friday: "Black Friday",
};

const USER_OPTIONS = [200, 500, 1000, 2000, 3500, 5000, 10000];
const DURATION_OPTIONS = [30, 60, 90, 120, 180, 300];

export default function TestConfig({
  config,
  setConfig,
  testStatus,
  onStart,
  onStop,
  wsConnected,
}) {
  const isRunning = testStatus === "running";
  const isIdle = testStatus === "idle";

  const apply = (s) =>
    setConfig({
      users: s.users,
      duration: s.duration,
      trafficType: s.trafficType,
    });

  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <div>
        <p className="text-xs font-mono text-cyber-muted uppercase tracking-widest mb-1">
          Load Configuration
        </p>
        <div className="h-px bg-cyber-border" />
      </div>

      {/* Quick Scenarios */}
      <div className="space-y-2">
        <p className="text-xs font-mono text-cyber-muted uppercase tracking-wide">
          Quick Scenarios
        </p>
        {SCENARIOS.map((s) => (
          <button
            key={s.label}
            disabled={isRunning}
            onClick={() => apply(s)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-xs font-mono
              ${
                config.trafficType === s.trafficType && config.users === s.users
                  ? "border-cyber-accent bg-cyber-accent/10 text-cyber-accent"
                  : "border-cyber-border bg-cyber-card2 hover:border-cyber-accent/50 text-cyber-text"
              }
              ${isRunning ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <span className={s.color}>{s.label}</span>
            <span className="text-cyber-muted">
              {s.users.toLocaleString()} users
            </span>
          </button>
        ))}
      </div>

      <div className="h-px bg-cyber-border" />

      {/* Concurrent Users */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Users size={12} className="text-cyber-muted" />
          <p className="text-xs font-mono text-cyber-muted uppercase tracking-wide">
            Concurrent Users
          </p>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {USER_OPTIONS.map((u) => (
            <button
              key={u}
              disabled={isRunning}
              onClick={() => setConfig((c) => ({ ...c, users: u }))}
              className={`py-1.5 rounded text-xs font-mono transition-all border
                ${
                  config.users === u
                    ? "border-cyber-cyan bg-cyber-cyan/15 text-cyber-cyan"
                    : "border-cyber-border bg-cyber-card2 text-cyber-muted hover:border-cyber-cyan/40 hover:text-cyber-text"
                }
                ${isRunning ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {u >= 1000 ? `${u / 1000}k` : u}
            </button>
          ))}
        </div>
        <p className="text-cyber-cyan font-mono text-sm font-bold text-center">
          {config.users.toLocaleString()} users
        </p>
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-cyber-muted" />
          <p className="text-xs font-mono text-cyber-muted uppercase tracking-wide">
            Duration
          </p>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {DURATION_OPTIONS.map((d) => (
            <button
              key={d}
              disabled={isRunning}
              onClick={() => setConfig((c) => ({ ...c, duration: d }))}
              className={`py-1.5 rounded text-xs font-mono transition-all border
                ${
                  config.duration === d
                    ? "border-cyber-cyan bg-cyber-cyan/15 text-cyber-cyan"
                    : "border-cyber-border bg-cyber-card2 text-cyber-muted hover:border-cyber-cyan/40 hover:text-cyber-text"
                }
                ${isRunning ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {d}s
            </button>
          ))}
        </div>
      </div>

      {/* Traffic Type */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Layers size={12} className="text-cyber-muted" />
          <p className="text-xs font-mono text-cyber-muted uppercase tracking-wide">
            Traffic Pattern
          </p>
        </div>
        <select
          disabled={isRunning}
          value={config.trafficType}
          onChange={(e) =>
            setConfig((c) => ({ ...c, trafficType: e.target.value }))
          }
          className={`w-full bg-cyber-card2 border border-cyber-border rounded px-3 py-2 text-xs font-mono text-cyber-text
            focus:outline-none focus:border-cyber-cyan transition-colors
            ${isRunning ? "opacity-40 cursor-not-allowed" : ""}`}
        >
          <option value="normal">Normal Day (Balanced)</option>
          <option value="payment_rush">Payment Rush (60% payment)</option>
          <option value="market_open">Market Open (40% login burst)</option>
          <option value="black_friday">Black Friday (Extreme)</option>
        </select>
      </div>

      <div className="h-px bg-cyber-border" />

      {/* Summary */}
      <div className="glass-card p-3 space-y-1.5 text-xs font-mono">
        <p className="text-cyber-muted uppercase tracking-wide text-[10px] mb-2">
          Test Summary
        </p>
        <div className="flex justify-between">
          <span className="text-cyber-muted">Users</span>
          <span className="text-white font-bold">
            {config.users.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-cyber-muted">Duration</span>
          <span className="text-white font-bold">{config.duration}s</span>
        </div>
        <div className="flex justify-between">
          <span className="text-cyber-muted">Pattern</span>
          <span className="text-cyber-accent">
            {TRAFFIC_LABELS[config.trafficType]}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-cyber-muted">Est. Requests</span>
          <span className="text-white">
            {Math.round(
              (config.users / 10) * config.duration * 0.75,
            ).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        {isRunning ? (
          <button
            onClick={onStop}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-cyber-red/50 bg-cyber-red/10 text-cyber-red font-mono text-sm font-bold hover:bg-cyber-red/20 transition-all active:scale-95"
          >
            <Square size={14} fill="currentColor" />
            ABORT TEST
          </button>
        ) : (
          <button
            onClick={onStart}
            disabled={!wsConnected}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-mono text-sm font-bold transition-all
              ${
                wsConnected
                  ? "border border-cyber-green/60 bg-cyber-green/10 text-cyber-green hover:bg-cyber-green/20 active:scale-95 shadow-lg shadow-cyber-green/10"
                  : "border border-cyber-muted/30 bg-cyber-muted/5 text-cyber-muted cursor-not-allowed"
              }`}
          >
            <Play size={14} fill="currentColor" />
            {wsConnected ? "LAUNCH TEST" : "CONNECTING..."}
          </button>
        )}
      </div>

      {/* Running progress */}
      {isRunning && (
        <div className="text-center">
          <p className="text-cyber-green font-mono text-xs animate-pulse">
            ● STRESS TEST IN PROGRESS
          </p>
        </div>
      )}
    </div>
  );
}
