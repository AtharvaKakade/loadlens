import { Zap, Wifi, WifiOff, Activity } from "lucide-react";

const STATUS_LABEL = { idle: "STANDBY", running: "LIVE", complete: "COMPLETE" };
const STATUS_COLOR = {
  idle: "text-cyber-muted",
  running: "text-cyber-green",
  complete: "text-cyber-accent",
};

export default function Header({
  testStatus,
  wsConnected,
  currentMetrics,
  config,
}) {
  const elapsed = currentMetrics?.elapsed ?? 0;
  const progress = currentMetrics?.progress ?? 0;
  const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const secs = String(Math.floor(elapsed % 60)).padStart(2, "0");

  return (
    <header className="h-14 bg-cyber-card border-b border-cyber-border flex items-center px-4 gap-4 relative overflow-hidden z-20">
      {/* Scan line animation when running */}
      {testStatus === "running" && (
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            background:
              "linear-gradient(transparent 40%, rgba(0,212,255,0.4) 50%, transparent 60%)",
            animation: "scanLine 3s linear infinite",
          }}
        />
      )}

      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="relative">
          <Zap size={20} className="text-cyber-cyan" fill="currentColor" />
          {testStatus === "running" && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-cyber-green rounded-full animate-pulse-fast" />
          )}
        </div>
        <span className="text-cyber-cyan font-mono font-bold text-sm tracking-widest">
          FINPULSE
        </span>
        <span className="text-cyber-accent font-mono font-bold text-sm tracking-widest">
          AI
        </span>
        <span className="hidden sm:block text-cyber-muted font-mono text-xs ml-1 tracking-wide">
          RELEASE READINESS PLATFORM
        </span>
      </div>

      <div className="h-5 w-px bg-cyber-border mx-1" />

      {/* Status */}
      <div className="flex items-center gap-2">
        {testStatus === "running" ? (
          <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse-fast" />
        ) : testStatus === "complete" ? (
          <span className="w-2 h-2 rounded-full bg-cyber-accent" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-cyber-muted" />
        )}
        <span
          className={`font-mono text-xs font-semibold tracking-widest ${STATUS_COLOR[testStatus]}`}
        >
          {STATUS_LABEL[testStatus]}
        </span>
      </div>

      {/* Live stats */}
      {testStatus === "running" && currentMetrics && (
        <>
          <div className="h-5 w-px bg-cyber-border mx-1" />
          <div className="flex items-center gap-4 font-mono text-xs">
            <span className="text-cyber-muted">
              USERS{" "}
              <span className="text-cyber-cyan font-bold">
                {currentMetrics.currentUsers?.toLocaleString()}
              </span>
            </span>
            <span className="text-cyber-muted">
              RPS{" "}
              <span className="text-cyber-green font-bold">
                {currentMetrics.rps}
              </span>
            </span>
            <span className="text-cyber-muted">
              ERR{" "}
              <span
                className={
                  currentMetrics.errorRate > 5
                    ? "text-cyber-red font-bold"
                    : currentMetrics.errorRate > 1
                      ? "text-cyber-amber font-bold"
                      : "text-cyber-green font-bold"
                }
              >
                {currentMetrics.errorRate}%
              </span>
            </span>
            <span className="text-cyber-muted">
              T+{" "}
              <span className="text-white font-bold">
                {mins}:{secs}
              </span>
            </span>
          </div>

          {/* Progress bar */}
          <div className="flex-1 max-w-40 hidden lg:block">
            <div className="progress-track h-1">
              <div
                className="progress-fill bg-cyber-cyan h-1"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-cyber-muted font-mono text-xs hidden lg:block">
            {progress.toFixed(0)}%
          </span>
        </>
      )}

      {testStatus === "complete" && (
        <>
          <div className="h-5 w-px bg-cyber-border mx-1" />
          <span className="font-mono text-xs text-cyber-accent">
            TEST COMPLETE — {config.users?.toLocaleString()} users /{" "}
            {config.duration}s
          </span>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* WS indicator */}
      <div className="flex items-center gap-1.5 font-mono text-xs">
        {wsConnected ? (
          <>
            <Wifi size={13} className="text-cyber-green" />
            <span className="text-cyber-green hidden sm:block">CONNECTED</span>
          </>
        ) : (
          <>
            <WifiOff size={13} className="text-cyber-red" />
            <span className="text-cyber-red hidden sm:block">RECONNECTING</span>
          </>
        )}
      </div>

      {/* Activity icon */}
      <Activity
        size={15}
        className={
          testStatus === "running"
            ? "text-cyber-green animate-pulse"
            : "text-cyber-muted"
        }
      />
    </header>
  );
}
