require("dotenv").config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const { LoadSimulator } = require("./loadSimulator");
const { analyzeWithAI } = require("./aiEngine");
const { calculateReadinessScore } = require("./riskScoring");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors({ origin: "*" }));
app.use(express.json());

let activeSimulator = null;
const clients = new Set();

// ── WebSocket ────────────────────────────────────────────────────────────────
wss.on("connection", (ws) => {
  clients.add(ws);
  console.log(`[WS] Client connected  (total: ${clients.size})`);

  ws.on("close", () => {
    clients.delete(ws);
    console.log(`[WS] Client disconnected (total: ${clients.size})`);
  });

  ws.on("error", () => clients.delete(ws));
});

function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  }
}

// ── REST API ─────────────────────────────────────────────────────────────────
app.post("/api/start-test", (req, res) => {
  const { users = 1000, duration = 60, trafficType = "normal" } = req.body;

  if (activeSimulator) {
    activeSimulator.stop();
    activeSimulator = null;
  }

  activeSimulator = new LoadSimulator({
    users: parseInt(users),
    duration: parseInt(duration),
    trafficType,
  });

  activeSimulator.on("metrics", (metrics) => {
    broadcast({ type: "METRICS_UPDATE", data: metrics });
  });

  activeSimulator.on("complete", (summary) => {
    const readinessScore = calculateReadinessScore(summary);
    broadcast({ type: "TEST_COMPLETE", data: { summary, readinessScore } });
    activeSimulator = null;
  });

  activeSimulator.start();
  console.log(
    `[TEST] Started — ${users} users / ${duration}s / ${trafficType}`,
  );
  res.json({ status: "started", config: { users, duration, trafficType } });
});

app.post("/api/stop-test", (req, res) => {
  if (activeSimulator) {
    activeSimulator.stop();
    activeSimulator = null;
    broadcast({ type: "TEST_STOPPED" });
  }
  res.json({ status: "stopped" });
});

app.post("/api/ai-analyze", async (req, res) => {
  const { metrics, readinessScore } = req.body;
  if (!metrics) return res.status(400).json({ error: "No metrics provided" });

  try {
    const analysis = await analyzeWithAI(metrics, readinessScore);
    res.json(analysis);
  } catch (err) {
    console.error("[AI] Analysis error:", err.message);
    res.status(500).json({ error: "AI analysis failed" });
  }
});

app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    activeTest: !!activeSimulator,
    connectedClients: clients.size,
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n  FinPulse AI Backend  ─────────────────────`);
  console.log(`  HTTP : http://localhost:${PORT}`);
  console.log(`  WS   : ws://localhost:${PORT}`);
  console.log(`  ─────────────────────────────────────────\n`);
});
