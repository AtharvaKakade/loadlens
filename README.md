# FinPulse AI — AI-Powered Load Testing & Release Readiness Platform

> **Hackathon MVP** · Real-time fintech load simulation · AI risk analysis · Release readiness scoring

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FinPulse AI                                  │
├─────────────────┬───────────────────────────────────────────────────┤
│  React Frontend │   Node.js Backend                                 │
│  (Vite :5173)   │   (Express :3001)                                 │
│                 │                                                    │
│  Dashboard ─────┼── REST API ─────────── LoadSimulator              │
│  LiveCharts ────┼── WebSocket ────────── MetricsEngine              │
│  AIInsights ────┼── /api/ai-analyze ──── AIEngine (GPT-4o-mini)     │
│  ReadinessScore ┤                └────── RiskScoring                │
└─────────────────┴───────────────────────────────────────────────────┘
```

## Features

| Feature                     | Description                                                                               |
| --------------------------- | ----------------------------------------------------------------------------------------- |
| **Load Simulator**          | Mathematically realistic concurrent user simulation — login, payment, wallet, refund APIs |
| **Live Dashboard**          | WebSocket-driven real-time metrics: RPS, latency, error rate, CPU, memory                 |
| **API Health Matrix**       | Per-endpoint status with latency bars and error rate tracking                             |
| **AI Risk Engine**          | GPT-4o-mini analysis: bottlenecks, risks, scaling recommendations                         |
| **Release Readiness Score** | Weighted 0–100 score → GO / CAUTION / NO-GO verdict                                       |
| **Executive Summary**       | Boardroom-ready report with typewriter animation, copyable                                |

## Quick Start

### Prerequisites

- Node.js 18+
- npm 8+

### 1. Clone & Install

```bash
git clone <repo-url> finpulse-ai
cd finpulse-ai

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Configure (Optional — AI works without a key using mock responses)

```bash
cd backend
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY for real AI analysis
```

### 3. Start Everything

```bash
cd ..
chmod +x start.sh
./start.sh
```

Or manually in two terminals:

```bash
# Terminal 1 - Backend
cd backend && node server.js

# Terminal 2 - Frontend
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
3. **Watch** — Live metrics update every 750ms. Latency climbs, error rate spikes
4. **Observe** — Payment and Refund APIs turn CRITICAL (red) at ~70s
5. **Review Score** — Release Readiness Score appears: typically 35–55/100 = NO-GO
6. **AI Analysis** — Bottlenecks, risks, and scaling recommendations auto-generated
7. **Executive Summary** — Click button → boardroom-ready report with typewriter effect

---

## Traffic Patterns

| Pattern      | Login | Payment | Wallet | Refund | Scenario                |
| ------------ | ----- | ------- | ------ | ------ | ----------------------- |
| Normal Day   | 30%   | 30%     | 25%    | 15%    | Standard business hours |
| Payment Rush | 10%   | 60%     | 20%    | 10%    | End-of-day settlements  |
| Market Open  | 40%   | 35%     | 15%    | 10%    | Exchange opening spike  |
| Black Friday | 15%   | 50%     | 25%    | 10%    | Peak load event         |

## Simulation Model

The load simulator models three phases:

1. **Ramp-up** (0–20% of duration): Users increase linearly from 0 → target
2. **Sustained Load** (20–80%): All users active, APIs begin degrading non-linearly
3. **Breaking Point** (80–100%): System exceeds capacity, cascade failures begin

API degradation follows **Little's Law** with sigmoid error curves:

- Login API: most resilient (capacity factor 0.85)
- Wallet API: moderate (capacity factor 0.70)
- Payment API: degrades early (capacity factor 0.50)
- Refund API: fails first (capacity factor 0.40)

## Release Readiness Score Algorithm

```
Score = 100
- Avg error rate > 0.5%   → up to -20pts
- Peak error rate > 5%    → up to -18pts
- P95 latency > 1000ms    → up to -20pts
- CPU > 85%               → up to -14pts
- Memory > 85%            → -10pts
- Payment API failures    → up to -20pts
- Critical API count      → -8pts each

GO:       score ≥ 75
CAUTION:  score 50–74
NO-GO:    score < 50
```

## Project Structure

```
finpulse-ai/
├── backend/
│   ├── server.js          Express + WebSocket server
│   ├── loadSimulator.js   Concurrent user simulation engine
│   ├── riskScoring.js     Readiness score algorithm
│   ├── aiEngine.js        OpenAI integration + mock fallback
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx                Main state + WebSocket management
│   │   └── components/
│   │       ├── Header.jsx         Top bar with live stats
│   │       ├── TestConfig.jsx     Left sidebar configuration
│   │       ├── MetricsGrid.jsx    6 live metric cards
│   │       ├── LatencyChart.jsx   Latency over time (Recharts)
│   │       ├── RequestsChart.jsx  RPS + error rate chart
│   │       ├── APIHealthTable.jsx Per-API health matrix
│   │       ├── ReadinessScore.jsx SVG gauge + factor breakdown
│   │       ├── AIAnalysis.jsx     Tabbed AI insights panel
│   │       └── ExecutiveSummary.jsx Modal report with typewriter
│   ├── tailwind.config.js  Cyberpunk dark theme
│   └── package.json
├── start.sh               One-command startup
└── README.md
```

## Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Frontend   | React 18 + Vite 5                   |
| Styling    | Tailwind CSS 3 (custom cyber theme) |
| Charts     | Recharts 2                          |
| Icons      | Lucide React                        |
| Backend    | Node.js + Express 4                 |
| Real-time  | WebSocket (ws)                      |
| AI         | OpenAI GPT-4o-mini (mock fallback)  |
| Simulation | Custom EventEmitter-based engine    |

## API Endpoints

| Method | Endpoint              | Description                                        |
| ------ | --------------------- | -------------------------------------------------- |
| `POST` | `/api/start-test`     | Start load test `{ users, duration, trafficType }` |
| `POST` | `/api/stop-test`      | Abort running test                                 |
| `POST` | `/api/ai-analyze`     | Trigger AI analysis `{ metrics, readinessScore }`  |
| `GET`  | `/health`             | Server health check                                |
| `WS`   | `ws://localhost:3001` | Live metrics stream                                |

## Sample AI Output (NO-GO Scenario)

```json
{
  "riskLevel": "CRITICAL",
  "bottlenecks": [
    {
      "severity": "critical",
      "component": "Payment Processing API / DB Pool",
      "description": "Payment API latency degrades to 2100ms at 3,500 concurrent users...",
      "impact": "18% payment failure rate → $50,400/hr in failed transactions"
    }
  ],
  "predictedOutage": {
    "timeToOutage": "~18 min at sustained 5,000 users",
    "triggerComponent": "Payment API → DB Pool Exhaustion → Cascade"
  }
}
```

---

Built for hackathon demo purposes. All infrastructure metrics are simulated; no real HTTP load is generated.
