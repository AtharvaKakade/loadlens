import { useState, useEffect, useRef, useCallback } from "react";
import Header from "./components/Header.jsx";
import TestConfig from "./components/TestConfig.jsx";
import MetricsGrid from "./components/MetricsGrid.jsx";
import LatencyChart from "./components/LatencyChart.jsx";
import RequestsChart from "./components/RequestsChart.jsx";
import APIHealthTable from "./components/APIHealthTable.jsx";
import ReadinessScore from "./components/ReadinessScore.jsx";
import AIAnalysis from "./components/AIAnalysis.jsx";
import ExecutiveSummary from "./components/ExecutiveSummary.jsx";
import QuickSuggestions from "./components/QuickSuggestions.jsx";

const WS_URL = "ws://localhost:3001";
const API_URL = "http://localhost:3001";
const MAX_PTS = 80;

export default function App() {
  const [testStatus, setTestStatus] = useState("idle"); // idle | running | complete
  const [config, setConfig] = useState({
    users: 2000,
    duration: 60,
    trafficType: "normal",
  });
  const [currentMetrics, setCurrentMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [testResult, setTestResult] = useState(null); // { summary, readinessScore }
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [error, setError] = useState(null);

  const wsRef = useRef(null);
  const retryRef = useRef(null);

  // ── WebSocket ──────────────────────────────────────────────────────────
  const connectWS = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
      setError(null);
    };
    ws.onclose = () => {
      setWsConnected(false);
      retryRef.current = setTimeout(connectWS, 3000);
    };
    ws.onerror = () => ws.close();

    ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);

      if (msg.type === "METRICS_UPDATE") {
        const m = msg.data;
        setCurrentMetrics(m);
        setHistory((prev) =>
          [
            ...prev,
            {
              t: m.elapsed,
              rps: m.rps,
              avgLat: m.avgLatency,
              p95Lat: m.p95Latency,
              errRate: m.errorRate,
              cpu: m.cpuUsage,
              mem: m.memoryUsage,
              users: m.currentUsers,
            },
          ].slice(-MAX_PTS),
        );
      }

      if (msg.type === "TEST_COMPLETE") {
        setTestStatus("complete");
        setTestResult(msg.data);
        triggerAI(msg.data.summary, msg.data.readinessScore);
      }

      if (msg.type === "TEST_STOPPED") {
        setTestStatus("idle");
      }
    };
  }, []);

  useEffect(() => {
    connectWS();
    return () => {
      clearTimeout(retryRef.current);
      wsRef.current?.close();
    };
  }, [connectWS]);

  // ── AI analysis ────────────────────────────────────────────────────────
  const triggerAI = async (summary, readinessScore) => {
    setAiLoading(true);
    setAiAnalysis(null);
    try {
      const res = await fetch(`${API_URL}/api/ai-analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metrics: summary, readinessScore }),
      });
      if (!res.ok) throw new Error("AI request failed");
      setAiAnalysis(await res.json());
    } catch (err) {
      console.error("AI error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  // ── Test controls ──────────────────────────────────────────────────────
  const startTest = async () => {
    setTestStatus("running");
    setHistory([]);
    setCurrentMetrics(null);
    setTestResult(null);
    setAiAnalysis(null);
    setShowSummary(false);

    try {
      const res = await fetch(`${API_URL}/api/start-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("Failed to start test");
    } catch (err) {
      setError(err.message);
      setTestStatus("idle");
    }
  };

  const stopTest = async () => {
    await fetch(`${API_URL}/api/stop-test`, { method: "POST" }).catch(() => {});
    setTestStatus("idle");
  };

  // Show AI panel as soon as the test finishes (so AgentThinking starts immediately)
  const showAIAnalysis = !!testResult;

  return (
    <div className="min-h-screen bg-cyber-bg bg-grid text-cyber-text font-sans select-none">
      <Header
        testStatus={testStatus}
        wsConnected={wsConnected}
        currentMetrics={currentMetrics}
        config={config}
      />

      <div className="flex" style={{ height: "calc(100vh - 56px)" }}>
        {/* ── Sidebar ── */}
        <aside className="w-72 flex-shrink-0 border-r border-cyber-border bg-cyber-card overflow-y-auto">
          <TestConfig
            config={config}
            setConfig={setConfig}
            testStatus={testStatus}
            onStart={startTest}
            onStop={stopTest}
            wsConnected={wsConnected}
          />
        </aside>

        {/* ── Dashboard ── */}
        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="glass-card p-3 border border-cyber-red/40 text-cyber-red text-sm">
              ⚠ {error} — is the backend running? Run{" "}
              <code className="font-mono">npm start</code> in{" "}
              <code className="font-mono">backend/</code>
            </div>
          )}

          <MetricsGrid metrics={currentMetrics} testStatus={testStatus} />

          <div className="grid grid-cols-2 gap-4">
            <LatencyChart data={history} />
            <RequestsChart data={history} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <APIHealthTable
                byApi={currentMetrics?.byApi}
                testStatus={testStatus}
              />
            </div>
            <ReadinessScore
              result={testResult?.readinessScore}
              testStatus={testStatus}
            />
          </div>

          {testResult && (
            <QuickSuggestions summary={testResult.summary} />
          )}

          {showAIAnalysis && (
            <AIAnalysis
              analysis={aiAnalysis}
              loading={aiLoading}
              summary={testResult?.summary}
              score={testResult?.readinessScore?.score}
              onViewSummary={() => setShowSummary(true)}
            />
          )}
        </main>
      </div>

      {showSummary && aiAnalysis && (
        <ExecutiveSummary
          analysis={aiAnalysis}
          result={testResult}
          config={config}
          onClose={() => setShowSummary(false)}
        />
      )}
    </div>
  );
}
