# FinPulse AI — AI-Powered Load Testing & Release Readiness Platform

> **Hackathon MVP** · Real-time fintech load simulation · Local LLM risk analysis · Release readiness scoring

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         FinPulse AI                                  │
├──────────────────┬───────────────────────────────────────────────────┤
│  React Frontend  │   Node.js Backend                                 │
│  (Vite :5173)    │   (Express :3001)                                 │
│                  │                                                    │
│  Dashboard  ─────┼── REST API ──────────── LoadSimulator             │
│  LiveCharts ─────┼── WebSocket ─────────── MetricsEngine             │
│  AgentThinking ──┼── /api/ai-analyze ───── AIEngine (Ollama)         │
│  QuickSuggestions┤                └──────── RiskScoring              │
│  ReadinessScore  ┤                                                   │
└──────────────────┴───────────────────────────────────────────────────┘
                                       │
                              Ollama :11434
                           (llama3.2 local LLM)
```

## Features

| Feature                         | Description                                                                                  |
| ------------------------------- | -------------------------------------------------------------------------------------------- |
| **Load Simulator**              | Quadratic degradation model — login, payment, wallet, refund APIs with per-scenario capacity |
| **Live Dashboard**              | WebSocket-driven real-time metrics: RPS, latency, error rate, CPU, memory (750ms updates)    |
| **API Health Matrix**           | Per-endpoint status with latency bars, error rates, and health badges                        |
| **Agent Thinking**              | ChatGPT-style streaming reasoning steps — 10 data-driven steps before AI results appear      |
| **AI Risk Engine**              | Ollama llama3.2 analysis: bottlenecks, risks, scaling recommendations (mock fallback)        |
| **Release Readiness Score**     | Weighted 0–100 score with SVG arc gauge → GO / CAUTION / NO-GO verdict                       |
| **Operational Recommendations** | Instant rule-based ops suggestions (CPU, memory, latency, payment failures) per team         |
| **Executive Summary**           | Boardroom-ready modal report with typewriter animation, one-click copy                       |

## Quick Start

### Prerequisites

- Node.js 18+ (via [nvm](https://github.com/nvm-sh/nvm) recommended)
- [Ollama](https://ollama.com) running locally with `llama3.2` pulled

```bash
# Install Ollama, then pull the model
ollama pull llama3.2
```

### 1. Clone & Install

```bash
git clone <repo-url> finpulse-ai
cd finpulse-ai

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure

```bash
cd backend
cp .env.example .env
# Default settings work out of the box with Ollama running locally
# Edit OLLAMA_MODEL to switch models (e.g. llama3:latest, qwen2.5:7b)
```

`.env` reference:

```
PORT=3001
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### 3. Start Everything

```bash
cd ..
chmod +x start.sh
./start.sh        # sources nvm, uses Node 18, starts backend then frontend
```

Or manually in two terminals:

```bash
# Terminal 1 — Backend
source ~/.nvm/nvm.sh && nvm use 18
cd backend && node server.js

# Terminal 2 — Frontend
source ~/.nvm/nvm.sh && nvm use 18
cd frontend && npm run dev
```

### 4. Open Browser

```
http://localhost:5173
```

---

## Demo Flow (for judges)

1. **Configure** — Select "Black Friday" preset (5000 users / 120s)
2. **Launch** — Click "LAUNCH TEST"
3. **Watch** — Live metrics update every 750ms; latency climbs, error rate spikes
4. **Observe** — Payment and Refund APIs turn CRITICAL (red) around 60s
5. **Review Score** — Release Readiness Score: ~25–40/100 = **NO-GO**
6. **Ops Suggestions** — Instant actionable cards appear: scale compute, add caching, async payments
7. **Agent Thinking** — 10 streaming reasoning steps before AI results (skip button available)
8. **AI Analysis** — Bottlenecks / Risk Assessment / Remediation tabs powered by llama3.2
9. **Executive Summary** — Click button → typewriter boardroom report

**Contrast demo:** Switch to "Normal Day" (1000 users / 60s) → score ~85–90 = **GO** ✓

---

## Traffic Scenarios & Capacity Model

| Scenario     | Capacity Multiplier | Meaning                                 |
| ------------ | :-----------------: | --------------------------------------- |
| Normal Day   |        2.0×         | Well-provisioned — 2× headroom          |
| Payment Rush |        1.1×         | Payment service at bottleneck           |
| Market Open  |        0.85×        | System slightly undersized              |
| Black Friday |        0.50×        | Massively undersized — cascade failures |

| Traffic Pattern | Login | Payment | Wallet | Refund |
| --------------- | :---: | :-----: | :----: | :----: |
| Normal Day      |  30%  |   30%   |  25%   |  15%   |
| Payment Rush    |  10%  |   60%   |  20%   |  10%   |
| Market Open     |  40%  |   35%   |  15%   |  10%   |
| Black Friday    |  15%  |   50%   |  25%   |  10%   |

## Simulation Model

Load factor: `lf = min(currentUsers / (targetUsers × capacityMultiplier), 2.2)`

API degradation uses a **quadratic overload** curve — zero degradation while healthy, accelerating when overloaded:

```
overload = max(0, lf / optimalPoint − 1.0)
latency  = baseLatency × (1 + overload² × latencyMultiplier)
errorRate = baseErrorRate + overload² × errorSensitivity
```

Per-API tuning:

| API     | Base Latency | Optimal Point | Degrades At    |
| ------- | -----------: | :-----------: | -------------- |
| Login   |         45ms | 90% capacity  | Very resilient |
| Wallet  |         80ms | 75% capacity  | Moderate       |
| Payment |        180ms | 60% capacity  | Aggressive     |
| Refund  |        220ms | 50% capacity  | Fails earliest |

## Release Readiness Score Algorithm

```
Score = 100
− Avg error rate > 0.5%   → up to −20 pts
− Peak error rate > 5%    → up to −18 pts
− P95 latency > 1000ms    → up to −20 pts
− CPU > 85%               → up to −14 pts
− Memory > 85%            →       −10 pts
− Payment API failures    → up to −20 pts
− Critical API count      →  −8 pts each

GO:       score ≥ 75
CAUTION:  score 50–74
NO-GO:    score < 50
```

## Project Structure

```
finpulse-ai/
├── backend/
│   ├── server.js            Express + WebSocket server
│   ├── loadSimulator.js     Quadratic overload simulation engine
│   ├── riskScoring.js       Weighted readiness score algorithm
│   ├── aiEngine.js          Ollama integration + mock fallback
│   ├── .env.example         Environment config template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  Main state + WebSocket management
│   │   └── components/
│   │       ├── Header.jsx           Top bar with live stats + progress
│   │       ├── TestConfig.jsx       Left sidebar — scenario presets
│   │       ├── MetricsGrid.jsx      6 live metric cards
│   │       ├── LatencyChart.jsx     Latency over time (Recharts)
│   │       ├── RequestsChart.jsx    RPS + error rate area chart
│   │       ├── APIHealthTable.jsx   Per-API health matrix
│   │       ├── ReadinessScore.jsx   SVG arc gauge + factor breakdown
│   │       ├── AgentThinking.jsx    Streaming reasoning steps UI
│   │       ├── AIAnalysis.jsx       Tabbed AI insights panel
│   │       ├── QuickSuggestions.jsx Rule-based ops recommendations
│   │       └── ExecutiveSummary.jsx Modal report with typewriter
│   ├── tailwind.config.js   Cyberpunk dark theme + custom animations
│   └── package.json
├── start.sh                 One-command startup (nvm + Node 18)
├── .nvmrc                   Node version pin (18)
└── README.md
```

## Tech Stack

| Layer      | Technology                              |
| ---------- | --------------------------------------- |
| Frontend   | React 18 + Vite 5                       |
| Styling    | Tailwind CSS 3 (custom cyberpunk theme) |
| Charts     | Recharts 2                              |
| Icons      | Lucide React                            |
| Backend    | Node.js 18 + Express 4                  |
| Real-time  | WebSocket (ws 8)                        |
| AI         | Ollama llama3.2 via OpenAI-compat API   |
| Simulation | Custom EventEmitter-based engine        |

## API Endpoints

| Method | Endpoint              | Description                                             |
| ------ | --------------------- | ------------------------------------------------------- |
| `POST` | `/api/start-test`     | Start load test `{ users, duration, trafficType }`      |
| `POST` | `/api/stop-test`      | Abort running test                                      |
| `POST` | `/api/ai-analyze`     | Trigger AI analysis `{ metrics, readinessScore }`       |
| `GET`  | `/health`             | Server health check                                     |
| `WS`   | `ws://localhost:3001` | Live metrics stream (`METRICS_UPDATE`, `TEST_COMPLETE`) |

## Sample AI Output (NO-GO Scenario)

```json
{
  "riskLevel": "CRITICAL",
  "bottlenecks": [
    {
      "severity": "critical",
      "component": "Payment Processing API / DB Pool",
      "description": "Payment API latency degrades to 4590ms at 5000 concurrent users under Black Friday load.",
      "impact": "55% payment failure rate → estimated $180,000/hr in failed transactions"
    }
  ],
  "predictedOutage": {
    "timeToOutage": "~12 min at sustained 5,000 users",
    "triggerComponent": "Payment API → DB Pool Exhaustion → Cascade Failure"
  },
  "_meta": {
    "provider": "ollama",
    "model": "llama3.2"
  }
}
```

---

> Built for hackathon demo purposes. All infrastructure metrics are mathematically simulated; no real HTTP load is generated against any external system.
