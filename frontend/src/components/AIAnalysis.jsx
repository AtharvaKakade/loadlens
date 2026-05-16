import { useState } from "react";
import {
  Brain,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import AgentThinking from "./AgentThinking.jsx";

const SEV_STYLE = {
  critical: { pill: "sev-critical", dot: "bg-cyber-red", label: "CRITICAL" },
  warning: { pill: "sev-warning", dot: "bg-cyber-amber", label: "WARNING" },
  info: { pill: "sev-info", dot: "bg-cyber-accent", label: "INFO" },
};

const PRI_STYLE = {
  immediate: {
    color: "text-cyber-red",
    bg: "bg-cyber-red/10 border-cyber-red/30",
    label: "IMMEDIATE",
  },
  "short-term": {
    color: "text-cyber-amber",
    bg: "bg-cyber-amber/10 border-cyber-amber/30",
    label: "SHORT-TERM",
  },
  strategic: {
    color: "text-cyber-accent",
    bg: "bg-cyber-accent/10 border-cyber-accent/30",
    label: "STRATEGIC",
  },
};

// LoadingSkeleton replaced by AgentThinking

function BottleneckCard({ item }) {
  const s = SEV_STYLE[item.severity] ?? SEV_STYLE.info;
  return (
    <div
      className={`border border-cyber-border rounded-lg p-4 space-y-2 ${item.severity === "critical" ? "bg-cyber-red/5" : "bg-cyber-card2/40"} hover:border-cyber-muted transition-colors`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5 ${s.dot}`}
          />
          <span className="font-mono font-semibold text-xs text-cyber-text">
            {item.component}
          </span>
        </div>
        <span
          className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider flex-shrink-0 ${s.pill}`}
        >
          {s.label}
        </span>
      </div>
      <p className="text-cyber-text text-xs leading-relaxed pl-3.5">
        {item.description}
      </p>
      {item.impact && (
        <div className="pl-3.5">
          <p className="text-cyber-amber text-[10px] font-mono font-semibold">
            IMPACT: {item.impact}
          </p>
        </div>
      )}
    </div>
  );
}

function RiskCard({ item }) {
  const s = SEV_STYLE[item.severity] ?? SEV_STYLE.info;
  return (
    <div
      className={`border border-cyber-border rounded-lg p-4 space-y-2 ${item.severity === "critical" ? "bg-cyber-red/5" : "bg-cyber-card2/40"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
          <span className="font-mono font-semibold text-xs text-cyber-text">
            {item.title}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-cyber-muted font-mono text-[10px]">Prob.</span>
          <span
            className={`font-mono font-bold text-xs ${item.severity === "critical" ? "text-cyber-red" : "text-cyber-amber"}`}
          >
            {item.probability}
          </span>
        </div>
      </div>
      <p className="text-cyber-text text-xs leading-relaxed pl-3.5">
        {item.description}
      </p>
    </div>
  );
}

function RecommendationCard({ item }) {
  const p = PRI_STYLE[item.priority] ?? PRI_STYLE["short-term"];
  return (
    <div className={`border rounded-lg p-4 space-y-2 ${p.bg}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono font-bold text-xs text-cyber-text">
          {item.title}
        </span>
        <span
          className={`font-mono font-bold text-[10px] flex-shrink-0 ${p.color}`}
        >
          {p.label}
        </span>
      </div>
      <p className="text-cyber-text text-xs leading-relaxed">
        {item.description}
      </p>
      <div className="flex items-center gap-4 text-[10px] font-mono">
        <span className="text-cyber-muted">
          Effort: <span className="text-white">{item.effort}</span>
        </span>
        <span className="text-cyber-muted">
          Impact: <span className="text-cyber-green">{item.impact}</span>
        </span>
      </div>
    </div>
  );
}

const TABS = [
  { id: "bottlenecks", label: "Bottlenecks", icon: AlertTriangle },
  { id: "risks", label: "Risk Assessment", icon: TrendingUp },
  { id: "recommendations", label: "Remediation", icon: CheckCircle2 },
];

export default function AIAnalysis({
  analysis,
  loading,
  onViewSummary,
  summary,
  score,
}) {
  const [activeTab, setActiveTab] = useState("bottlenecks");
  const [expanded, setExpanded] = useState(true);
  const [thinkingDone, setThinkingDone] = useState(false);

  // Show agent thinking while loading OR while thinking animation is still running
  const showThinking = loading || (summary && !thinkingDone);
  // Show results only when both thinking is done AND analysis has arrived
  const showResults = thinkingDone && !!analysis;

  if (!summary && !analysis) return null;

  const riskLevelColor =
    analysis && analysis.riskLevel === "CRITICAL"
      ? "text-cyber-red"
      : analysis && analysis.riskLevel === "HIGH"
        ? "text-cyber-amber"
        : "text-cyber-accent";

  return (
    <div className="glass-card animate-slide-up">
      {/* Agent Thinking panel */}
      {showThinking && (
        <div className="p-4 border-b border-cyber-border">
          <AgentThinking
            summary={summary}
            score={score || 0}
            onComplete={() => setThinkingDone(true)}
          />
        </div>
      )}

      {/* Results panel — only shown after thinking is done */}
      {showResults && (
        <>
          {/* Header */}
          <div
            className="flex items-center gap-3 p-4 cursor-pointer hover:bg-cyber-card2/30 transition-colors rounded-t-xl"
            onClick={() => setExpanded((e) => !e)}
          >
            <div className="relative">
              <Brain size={18} className="text-cyber-purple" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-cyber-purple rounded-full animate-pulse-slow" />
            </div>
            <div>
              <p className="font-mono font-bold text-sm text-cyber-text">
                AI Risk Engine Analysis
              </p>
              <p className="font-mono text-[10px] text-cyber-muted">
                {analysis._meta
                  ? `${analysis._meta.provider} · ${analysis._meta.model}`
                  : "Powered by Ollama llama3.2"}
              </p>
            </div>
            <span
              className={`ml-2 font-mono font-bold text-xs px-2 py-0.5 rounded border ${riskLevelColor} border-current bg-current/10`}
            >
              {analysis.riskLevel} RISK
            </span>
            {analysis.predictedOutage && (
              <div className="hidden lg:flex items-center gap-1.5 ml-2 text-xs font-mono text-cyber-amber">
                <Clock size={12} />
                <span>
                  Outage in:{" "}
                  <strong>{analysis.predictedOutage.timeToOutage}</strong>
                </span>
              </div>
            )}
            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewSummary();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-cyber-purple/40 bg-cyber-purple/10 text-cyber-purple font-mono text-xs font-semibold hover:bg-cyber-purple/20 transition-all"
              >
                <FileText size={12} />
                Executive Summary
              </button>
              {expanded ? (
                <ChevronUp size={16} className="text-cyber-muted" />
              ) : (
                <ChevronDown size={16} className="text-cyber-muted" />
              )}
            </div>
          </div>

          {expanded && (
            <div className="px-4 pb-4">
              {/* Tabs */}
              <div className="flex border-b border-cyber-border mb-4">
                {TABS.map(({ id, label, icon: Icon }) => {
                  const count = analysis[id]?.length ?? 0;
                  const hasCritical = analysis[id]?.some(
                    (i) =>
                      i.severity === "critical" || i.priority === "immediate",
                  );
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 font-mono text-xs font-semibold border-b-2 transition-colors
                    ${
                      activeTab === id
                        ? "border-cyber-cyan text-cyber-cyan"
                        : "border-transparent text-cyber-muted hover:text-cyber-text"
                    }`}
                    >
                      <Icon size={12} />
                      {label}
                      {count > 0 && (
                        <span
                          className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold
                      ${hasCritical ? "bg-cyber-red/20 text-cyber-red" : "bg-cyber-muted/20 text-cyber-muted"}`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab content */}
              <div className="space-y-3">
                {activeTab === "bottlenecks" &&
                  analysis.bottlenecks?.map((b, i) => (
                    <BottleneckCard key={i} item={b} />
                  ))}
                {activeTab === "risks" &&
                  analysis.risks?.map((r, i) => <RiskCard key={i} item={r} />)}
                {activeTab === "recommendations" &&
                  analysis.recommendations?.map((r, i) => (
                    <RecommendationCard key={i} item={r} />
                  ))}
              </div>
            </div>
          )}
        </> // end showResults
      )}
    </div>
  );
}
