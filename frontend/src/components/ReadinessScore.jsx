import { useMemo } from "react";
import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

// ── SVG circular gauge ────────────────────────────────────────────────────────
function Gauge({ score, color }) {
  const R = 54;
  const CX = 68;
  const CY = 68;
  const GAP = 60; // degrees left open at bottom

  const totalDeg = 360 - GAP;
  const startDeg = 90 + GAP / 2; // start at bottom-left
  const toRad = (d) => (d * Math.PI) / 180;

  const arc = (cx, cy, r, startAngle, endAngle) => {
    const s = toRad(startAngle);
    const e = toRad(endAngle);
    const x1 = cx + r * Math.cos(s);
    const y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy + r * Math.sin(e);
    const lg = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${lg} 1 ${x2} ${y2}`;
  };

  const fillDeg = (score / 100) * totalDeg;
  const trackEnd = startDeg + totalDeg;
  const fillEnd = startDeg + fillDeg;

  const strokeColor =
    color === "green" ? "#00e878" : color === "amber" ? "#f59e0b" : "#ef4444";

  return (
    <svg viewBox="0 0 136 136" width="136" height="136">
      {/* Track */}
      <path
        d={arc(CX, CY, R, startDeg, trackEnd)}
        fill="none"
        stroke="#1c1c3e"
        strokeWidth={10}
        strokeLinecap="round"
      />
      {/* Fill */}
      {score > 0 && (
        <path
          d={arc(CX, CY, R, startDeg, fillEnd)}
          fill="none"
          stroke={strokeColor}
          strokeWidth={10}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${strokeColor}80)` }}
        />
      )}
      {/* Score text */}
      <text
        x={CX}
        y={CY - 6}
        textAnchor="middle"
        fill={strokeColor}
        fontFamily="JetBrains Mono, monospace"
        fontWeight="700"
        fontSize="28"
      >
        {score}
      </text>
      <text
        x={CX}
        y={CY + 12}
        textAnchor="middle"
        fill="#4a4a72"
        fontFamily="JetBrains Mono, monospace"
        fontWeight="400"
        fontSize="11"
      >
        / 100
      </text>
    </svg>
  );
}

function FactorRow({ factor }) {
  const dot =
    factor.status === "critical"
      ? "bg-cyber-red"
      : factor.status === "warning"
        ? "bg-cyber-amber"
        : "bg-cyber-green";
  const val =
    factor.status === "critical"
      ? "text-cyber-red"
      : factor.status === "warning"
        ? "text-cyber-amber"
        : "text-cyber-green";
  return (
    <div className="flex items-center justify-between text-[11px] font-mono py-1 border-b border-cyber-border/40 last:border-0">
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
        <span className="text-cyber-muted">{factor.name}</span>
      </div>
      <span className={val}>{factor.value}</span>
    </div>
  );
}

export default function ReadinessScore({ result, testStatus }) {
  const idle = testStatus === "idle";
  const running = testStatus === "running";

  const Icon = useMemo(() => {
    if (!result) return ShieldCheck;
    return result.recommendation === "GO"
      ? ShieldCheck
      : result.recommendation === "CAUTION"
        ? ShieldAlert
        : ShieldX;
  }, [result]);

  const recColor =
    result?.color === "green"
      ? "text-cyber-green"
      : result?.color === "amber"
        ? "text-cyber-amber"
        : "text-cyber-red";
  const recBg =
    result?.color === "green"
      ? "bg-cyber-green/10 border-cyber-green/30"
      : result?.color === "amber"
        ? "bg-cyber-amber/10 border-cyber-amber/30"
        : "bg-cyber-red/10 border-cyber-red/30";

  return (
    <div className="glass-card p-4 flex flex-col items-center animate-fade-in">
      <p className="text-[10px] font-mono text-cyber-muted uppercase tracking-widest mb-3 self-start">
        Release Readiness
      </p>

      {idle && (
        <div className="flex flex-col items-center justify-center flex-1 py-6 text-center space-y-2">
          <ShieldCheck size={36} className="text-cyber-muted opacity-40" />
          <p className="text-cyber-muted font-mono text-xs">
            Run a test to get your
            <br />
            readiness score
          </p>
        </div>
      )}

      {running && (
        <div className="flex flex-col items-center justify-center flex-1 py-6 text-center space-y-2">
          <div className="w-16 h-16 rounded-full border-2 border-cyber-cyan/20 flex items-center justify-center">
            <span className="text-cyber-cyan font-mono text-xs animate-pulse">
              TESTING
            </span>
          </div>
          <p className="text-cyber-muted font-mono text-xs">
            Analyzing under load...
          </p>
        </div>
      )}

      {result && testStatus === "complete" && (
        <div className="w-full space-y-3 animate-slide-up">
          {/* Gauge */}
          <div className="flex justify-center">
            <Gauge score={result.score} color={result.color} />
          </div>

          {/* Verdict badge */}
          <div
            className={`flex items-center justify-center gap-2 py-2 rounded-lg border font-mono font-bold text-sm ${recColor} ${recBg}`}
          >
            <Icon size={16} />
            {result.recommendation}
          </div>
          <p className="text-center font-mono text-[10px] text-cyber-muted">
            {result.verdict}
          </p>

          {/* Factors */}
          <div className="mt-3 space-y-0">
            {result.factors?.map((f, i) => (
              <FactorRow key={i} factor={f} />
            ))}
          </div>

          {/* Success rate */}
          <div className="flex justify-between text-xs font-mono pt-1">
            <span className="text-cyber-muted">Success Rate</span>
            <span
              className={
                result.successRate > 99
                  ? "text-cyber-green"
                  : result.successRate > 95
                    ? "text-cyber-amber"
                    : "text-cyber-red"
              }
            >
              {result.successRate}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
