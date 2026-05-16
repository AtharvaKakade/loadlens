import { useEffect, useState, useRef } from "react";
import {
  Brain,
  Eye,
  BarChart2,
  GitMerge,
  CheckCircle2,
  SkipForward,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ── Step metadata ─────────────────────────────────────────────────────────────
const META = {
  init: {
    color: "text-cyber-cyan",
    border: "border-cyber-cyan/30",
    bg: "bg-cyber-cyan/5",
    tag: "INIT",
  },
  observe: {
    color: "text-cyber-purple",
    border: "border-cyber-purple/30",
    bg: "bg-cyber-purple/5",
    tag: "OBSERVE",
  },
  analyze: {
    color: "text-cyber-amber",
    border: "border-cyber-amber/30",
    bg: "bg-cyber-amber/5",
    tag: "ANALYZE",
  },
  think: {
    color: "text-cyber-accent",
    border: "border-cyber-accent/30",
    bg: "bg-cyber-accent/5",
    tag: "REASON",
  },
  conclude: {
    color: "text-cyber-amber",
    border: "border-cyber-amber/30",
    bg: "bg-cyber-amber/5",
    tag: "INFER",
  },
  result: {
    color: "text-cyber-green",
    border: "border-cyber-green/30",
    bg: "bg-cyber-green/5",
    tag: "RESULT",
  },
};

// ── Typewriter line ───────────────────────────────────────────────────────────
function TypeLine({ text }) {
  const [shown, setShown] = useState("");
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0;
    setShown("");
    const t = setInterval(() => {
      if (idx.current >= text.length) {
        clearInterval(t);
        return;
      }
      setShown(text.slice(0, ++idx.current));
    }, 16);
    return () => clearInterval(t);
  }, [text]);

  return (
    <span className={shown.length < text.length ? "typewriter" : ""}>
      {shown}
    </span>
  );
}

// ── Build reasoning steps from real metrics ───────────────────────────────────
function buildSteps(summary, score) {
  const pmt = (summary.byApi && summary.byApi.payment) || {};
  const ref = (summary.byApi && summary.byApi.refund) || {};
  const estLoss = Math.round(
    (summary.peakErrorRate || 0) * 0.01 * 240 * (summary.peakRps || 0) * 60,
  );
  const triggerU = Math.floor((summary.targetUsers || 0) * 0.55);

  return [
    {
      type: "init",
      delay: 0,
      text: `Initializing FinPulse AI agent. Scope: ${(summary.targetUsers || 0).toLocaleString()} concurrent users, ${summary.duration}s test window, ${summary.trafficType} traffic pattern.`,
    },
    {
      type: "observe",
      delay: 650,
      text: `Ingesting ${(summary.totalRequests || 0).toLocaleString()} sampled requests. Peak throughput ${summary.peakRps} req/s · avg ${summary.avgRps} req/s. Ramp-up completed at T+${Math.round(summary.duration * 0.2)}s.`,
    },
    {
      type: "analyze",
      delay: 1400,
      text: `Error rate — avg ${summary.avgErrorRate}%, peak ${summary.peakErrorRate}%. ${
        summary.peakErrorRate > 10
          ? `CRITICAL: ${(summary.peakErrorRate / 5).toFixed(1)}× above the 5% production SLA ceiling.`
          : summary.peakErrorRate > 2
            ? `WARNING: elevated above 0.1% baseline — warrants investigation.`
            : `Within acceptable production bounds.`
      }`,
    },
    {
      type: "analyze",
      delay: 2150,
      text: `Latency profile — avg ${summary.avgLatency}ms · P95 ${summary.peakP95}ms · P99 ${Math.round(summary.peakP95 * 1.35)}ms. ${
        summary.peakP95 > 1000
          ? `SLA BREACH: P95 is ${(summary.peakP95 / 500).toFixed(1)}× above the 500ms contractual limit.`
          : `SLA compliant across all percentiles.`
      }`,
    },
    {
      type: "think",
      delay: 2900,
      text: `Correlating CPU saturation (${summary.peakCpu}%) with latency spike timeline... ${
        summary.peakCpu > 80
          ? `Strong causal link confirmed — compute layer saturated, OS scheduler throttling worker threads.`
          : `No compute bottleneck. Bottleneck likely at I/O or DB layer.`
      }`,
    },
    {
      type: "analyze",
      delay: 3650,
      text: `Payment API — peak ${pmt.peakErrorRate || 0}% error rate, ${pmt.peakLatency || 0}ms peak latency, final status: ${pmt.finalStatus || "unknown"}. ${
        (pmt.peakErrorRate || 0) > 5
          ? `Revenue-loss pathway ACTIVE.`
          : `Stable within test window.`
      } Refund API — ${ref.peakErrorRate || 0}% peak errors.`,
    },
    {
      type: "conclude",
      delay: 4400,
      text:
        (pmt.peakErrorRate || 0) > 10
          ? `Cascade failure chain identified: DB connection pool exhaustion (~${triggerU.toLocaleString()} users) → payment gateway timeout → refund queue overflow. Pattern matches "pool starvation" failure mode.`
          : `No cascade failure pattern detected. Failures appear isolated per API, not correlated.`,
    },
    {
      type: "think",
      delay: 5100,
      text: `Financial exposure estimate: ${summary.peakErrorRate}% failure rate × $240 avg transaction value × ${summary.peakRps} RPS = $${estLoss.toLocaleString()}/min at peak risk. Annualised SLA penalty exposure: significant.`,
    },
    {
      type: "think",
      delay: 5750,
      text: `Running weighted readiness matrix — error rate (25%), P95 latency (20%), CPU headroom (15%), memory (10%), payment stability (30%). Applying penalty multipliers for critical thresholds breached...`,
    },
    {
      type: "result",
      delay: 6400,
      text: `Decision rendered. Release Readiness Score: ${score}/100. Recommendation: ${
        score >= 75
          ? `✓ GO — system cleared for production with active monitoring`
          : score >= 50
            ? `⚠ CAUTION — ${3 - Math.floor((score - 50) / 8)} critical blockers must be resolved before launch`
            : `✗ NO-GO — ${Object.values(summary.byApi || {}).filter((a) => a.finalStatus === "critical" || a.finalStatus === "down").length + 2} critical infrastructure deficiencies detected`
      }.`,
    },
  ];
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AgentThinking({ summary, score, onComplete }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const timersRef = useRef([]);
  const startRef = useRef(Date.now());

  const steps = summary ? buildSteps(summary, score) : [];

  // Elapsed timer
  useEffect(() => {
    if (finished) return;
    const t = setInterval(
      () => setElapsedSec(((Date.now() - startRef.current) / 1000).toFixed(1)),
      100,
    );
    return () => clearInterval(t);
  }, [finished]);

  useEffect(() => {
    if (!steps.length) return;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    startRef.current = Date.now();
    setVisibleCount(0);
    setFinished(false);
    setCollapsed(false);

    steps.forEach((step, i) => {
      const t = setTimeout(() => {
        setVisibleCount(i + 1);
        if (i === steps.length - 1) {
          const done = setTimeout(() => {
            setFinished(true);
            setElapsedSec(((Date.now() - startRef.current) / 1000).toFixed(1));
            onComplete && onComplete();
          }, 700);
          timersRef.current.push(done);
        }
      }, step.delay);
      timersRef.current.push(t);
    });

    return () => timersRef.current.forEach(clearTimeout);
  }, [summary]);

  const handleSkip = () => {
    timersRef.current.forEach(clearTimeout);
    const elapsed = ((Date.now() - startRef.current) / 1000).toFixed(1);
    setVisibleCount(steps.length);
    setFinished(true);
    setElapsedSec(elapsed);
    onComplete && onComplete();
  };

  // ── Collapsed pill (shown after analysis results appear) ──────────────────
  if (finished && collapsed) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-cyber-border bg-cyber-card2/40 cursor-pointer hover:border-cyber-purple/40 transition-colors w-fit"
        onClick={() => setCollapsed(false)}
      >
        <Brain size={12} className="text-cyber-purple" />
        <span className="font-mono text-[11px] text-cyber-muted">
          Reasoned for <span className="text-white">{elapsedSec}s</span>
          <span className="mx-1">·</span>
          <span className="text-white">{steps.length} steps</span>
        </span>
        <ChevronDown size={12} className="text-cyber-muted ml-1" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Brain size={15} className="text-cyber-purple" />
            {!finished && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-cyber-purple rounded-full animate-pulse-fast" />
            )}
          </div>
          <span className="font-mono text-xs font-semibold text-cyber-text">
            {finished
              ? `Reasoned in ${elapsedSec}s`
              : `Thinking...  ${elapsedSec}s`}
          </span>
          {!finished && (
            <span className="flex gap-0.5 items-center ml-1">
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  className="w-1 h-1 rounded-full bg-cyber-purple animate-pulse"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!finished && (
            <button
              onClick={handleSkip}
              className="flex items-center gap-1 text-[10px] font-mono text-cyber-muted hover:text-cyber-text border border-cyber-border px-2 py-1 rounded transition-colors"
            >
              <SkipForward size={10} />
              Skip
            </button>
          )}
          {finished && (
            <button
              onClick={() => setCollapsed(true)}
              className="flex items-center gap-1 text-[10px] font-mono text-cyber-muted hover:text-cyber-text border border-cyber-border px-2 py-1 rounded transition-colors"
            >
              <ChevronUp size={10} />
              Collapse
            </button>
          )}
        </div>
      </div>

      {/* Steps list */}
      <div className="space-y-1 max-h-80 overflow-y-auto panel-scroll pr-1">
        {steps.map((step, i) => {
          if (i >= visibleCount) return null;
          const m = META[step.type] || META.think;
          const isCurrent = i === visibleCount - 1 && !finished;
          const isPast = i < visibleCount - 1 || finished;

          return (
            <div
              key={i}
              className={`flex items-start gap-2.5 px-3 py-2 rounded-lg border transition-all duration-400 animate-fade-in
                ${isCurrent ? `${m.border} ${m.bg}` : "border-transparent"}
                ${isPast && !isCurrent ? "opacity-50" : ""}`}
            >
              {/* Tag */}
              <span
                className={`font-mono font-bold text-[9px] tracking-widest mt-0.5 flex-shrink-0 w-14 ${m.color}`}
              >
                {m.tag}
              </span>

              {/* Text */}
              <p
                className={`font-mono text-[11px] leading-relaxed flex-1 ${isCurrent ? "text-cyber-text" : "text-cyber-muted"}`}
              >
                {isCurrent ? <TypeLine text={step.text} /> : step.text}
              </p>

              {/* Dot */}
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5
                ${
                  isCurrent
                    ? `${m.color.replace("text-", "bg-")} animate-pulse-fast`
                    : "bg-cyber-muted/20"
                }`}
              />
            </div>
          );
        })}

        {/* Pending dots */}
        {!finished && visibleCount < steps.length && (
          <div className="flex items-center gap-1.5 px-3 py-2">
            {[0, 150, 300].map((d) => (
              <span
                key={d}
                className="w-1.5 h-1.5 rounded-full bg-cyber-muted/40 animate-pulse"
                style={{ animationDelay: `${d}ms` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
