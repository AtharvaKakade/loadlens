import { useEffect, useRef, useState } from "react";
import { X, Copy, Check, Download, Printer } from "lucide-react";

function Markdown({ text }) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="text-white font-bold">
            {p.slice(2, -2)}
          </strong>
        ) : (
          p.split("\n").map((line, j) => (
            <span key={`${i}-${j}`}>
              {line}
              {j < p.split("\n").length - 1 ? <br /> : null}
            </span>
          ))
        ),
      )}
    </span>
  );
}

function TypewriterText({ text, speed = 12 }) {
  const [displayed, setDisplayed] = useState("");
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0;
    setDisplayed("");
    const timer = setInterval(() => {
      if (idx.current >= text.length) {
        clearInterval(timer);
        return;
      }
      setDisplayed(text.slice(0, ++idx.current));
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  const done = displayed.length >= text.length;

  return (
    <span className={!done ? "typewriter" : ""}>
      <Markdown text={displayed} />
    </span>
  );
}

export default function ExecutiveSummary({
  analysis,
  result,
  config,
  onClose,
}) {
  const [copied, setCopied] = useState(false);
  const now = new Date().toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });
  const score = result?.readinessScore;

  const handleCopy = () => {
    const text = analysis.executiveSummary;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const recColor =
    score?.color === "green"
      ? "text-cyber-green border-cyber-green/40 bg-cyber-green/10"
      : score?.color === "amber"
        ? "text-cyber-amber border-cyber-amber/40 bg-cyber-amber/10"
        : "text-cyber-red border-cyber-red/40 bg-cyber-red/10";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(7,7,15,0.92)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-card w-full max-w-3xl max-h-[90vh] flex flex-col animate-slide-up">
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-cyber-border">
          <div className="flex items-center gap-3">
            <div className="w-px h-8 bg-cyber-red" />
            <div>
              <p className="font-mono font-bold text-xs text-cyber-muted uppercase tracking-widest">
                CONFIDENTIAL — EXECUTIVE BRIEFING
              </p>
              <p className="font-mono font-bold text-sm text-white">
                FinPulse AI — Release Readiness Assessment
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-cyber-border text-cyber-muted hover:text-cyber-text hover:border-cyber-muted font-mono text-xs transition-all"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-cyber-green" /> Copied
                </>
              ) : (
                <>
                  <Copy size={12} /> Copy
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded border border-cyber-border text-cyber-muted hover:text-cyber-red hover:border-cyber-red/40 transition-all"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* Meta */}
          <div className="grid grid-cols-3 gap-3 font-mono text-xs">
            {[
              { label: "Generated", value: now },
              {
                label: "Test Config",
                value: `${config.users.toLocaleString()} users / ${config.duration}s`,
              },
              {
                label: "Traffic Pattern",
                value: config.trafficType.replace("_", " ").toUpperCase(),
              },
            ].map((m) => (
              <div
                key={m.label}
                className="bg-cyber-card2 border border-cyber-border rounded p-2.5"
              >
                <p className="text-cyber-muted text-[10px] uppercase tracking-wide mb-0.5">
                  {m.label}
                </p>
                <p className="text-cyber-text font-semibold">{m.value}</p>
              </div>
            ))}
          </div>

          {/* Score panel */}
          {score && (
            <div className={`border rounded-lg p-4 font-mono ${recColor}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest mb-1 opacity-70">
                    Release Readiness Score
                  </p>
                  <p className="text-3xl font-black">
                    {score.score}
                    <span className="text-base font-normal opacity-60">
                      {" "}
                      / 100
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black">{score.recommendation}</p>
                  <p className="text-[10px] opacity-70">{score.verdict}</p>
                </div>
              </div>
            </div>
          )}

          {/* Critical findings */}
          {analysis.risks?.filter((r) => r.severity === "critical").length >
            0 && (
            <div>
              <p className="font-mono font-bold text-xs text-cyber-red uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-red animate-pulse-fast" />
                Critical Findings
              </p>
              <div className="space-y-2">
                {analysis.risks
                  .filter((r) => r.severity === "critical")
                  .map((r, i) => (
                    <div
                      key={i}
                      className="flex gap-3 text-xs font-mono bg-cyber-red/5 border border-cyber-red/20 rounded p-3"
                    >
                      <span className="text-cyber-red mt-0.5 flex-shrink-0">
                        ▶
                      </span>
                      <div>
                        <p className="text-white font-semibold">{r.title}</p>
                        <p className="text-cyber-text mt-0.5 leading-relaxed">
                          {r.description}
                        </p>
                      </div>
                      <span className="flex-shrink-0 text-cyber-red font-bold">
                        {r.probability}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Executive summary */}
          <div>
            <p className="font-mono font-bold text-xs text-cyber-accent uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-accent" />
              Executive Summary
            </p>
            <div className="bg-cyber-card2/60 border border-cyber-border rounded-lg p-4 font-mono text-xs leading-relaxed text-cyber-text space-y-3">
              <TypewriterText
                text={analysis.executiveSummary || ""}
                speed={8}
              />
            </div>
          </div>

          {/* Immediate actions */}
          {analysis.recommendations?.filter((r) => r.priority === "immediate")
            .length > 0 && (
            <div>
              <p className="font-mono font-bold text-xs text-cyber-amber uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-amber" />
                Immediate Actions Required
              </p>
              <ol className="space-y-2">
                {analysis.recommendations
                  .filter((r) => r.priority === "immediate")
                  .map((r, i) => (
                    <li key={i} className="flex gap-3 text-xs font-mono">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyber-amber/20 border border-cyber-amber/40 flex items-center justify-center text-cyber-amber font-bold text-[10px]">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-white font-semibold">{r.title}</p>
                        <p className="text-cyber-muted mt-0.5">
                          Effort: {r.effort} · Impact: {r.impact}
                        </p>
                      </div>
                    </li>
                  ))}
              </ol>
            </div>
          )}

          {/* Predicted outage */}
          {analysis.predictedOutage && (
            <div className="bg-cyber-red/5 border border-cyber-red/20 rounded-lg p-4 font-mono text-xs space-y-1">
              <p className="text-cyber-red font-bold uppercase tracking-wide text-[10px]">
                ⚠ Predicted Failure Sequence
              </p>
              <p className="text-cyber-text">
                Time to outage:{" "}
                <strong className="text-white">
                  {analysis.predictedOutage.timeToOutage}
                </strong>
              </p>
              <p className="text-cyber-text">
                Trigger:{" "}
                <strong className="text-white">
                  {analysis.predictedOutage.triggerComponent}
                </strong>
              </p>
              <p className="text-cyber-text">
                Est. downtime:{" "}
                <strong className="text-white">
                  {analysis.predictedOutage.estimatedDowntime}
                </strong>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-cyber-border flex items-center justify-between font-mono text-[10px] text-cyber-muted">
          <span>FinPulse AI v1.0 — CONFIDENTIAL</span>
          <span>Generated by AI Risk Engine · {now}</span>
        </div>
      </div>
    </div>
  );
}
