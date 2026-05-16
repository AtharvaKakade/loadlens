const EventEmitter = require("events");

// ── API configs ───────────────────────────────────────────────────────────────
// optimalPoint: fraction of system capacity where API starts degrading
// latencyMult:  how aggressively latency grows when overloaded
// errSens:      error rate sensitivity above optimal point
const API_CONFIGS = {
  login: {
    baseLatency: 45,
    optimalPoint: 0.9,
    latencyMult: 1.5,
    errSens: 0.08,
    baseErrorRate: 0.001,
  },
  payment: {
    baseLatency: 180,
    optimalPoint: 0.6,
    latencyMult: 4.5,
    errSens: 0.45,
    baseErrorRate: 0.004,
  },
  wallet: {
    baseLatency: 80,
    optimalPoint: 0.75,
    latencyMult: 2.0,
    errSens: 0.15,
    baseErrorRate: 0.002,
  },
  refund: {
    baseLatency: 220,
    optimalPoint: 0.5,
    latencyMult: 5.5,
    errSens: 0.55,
    baseErrorRate: 0.007,
  },
};

// ── Scenario capacity multipliers ─────────────────────────────────────────────
// Higher = more headroom above target → system handles target users comfortably.
// Lower  = system is undersized for target → degrades and fails.
const SCENARIO_CAPACITY = {
  normal: 2.0, // Well-provisioned — 2× headroom, healthy at target
  payment_rush: 1.1, // Payment service is the bottleneck — borderline
  market_open: 0.85, // System slightly undersized — moderate failures
  black_friday: 0.5, // Massively undersized — cascade failures
};

// ── Traffic pattern weights ───────────────────────────────────────────────────
const TRAFFIC_PATTERNS = {
  normal: { login: 0.3, payment: 0.3, wallet: 0.25, refund: 0.15 },
  payment_rush: { login: 0.1, payment: 0.6, wallet: 0.2, refund: 0.1 },
  market_open: { login: 0.4, payment: 0.35, wallet: 0.15, refund: 0.1 },
  black_friday: { login: 0.15, payment: 0.5, wallet: 0.25, refund: 0.1 },
};

class LoadSimulator extends EventEmitter {
  constructor({ users, duration, trafficType }) {
    super();
    this.targetUsers = users;
    this.duration = duration;
    this.trafficType = trafficType || "normal";
    this.interval = null;
    this.startTime = null;
    this.totalReqs = 0;
    this.failedReqs = 0;
    this.history = [];
  }

  // ── Math helpers ─────────────────────────────────────────────────────────
  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }
  noise(amp = 1) {
    return (Math.random() - 0.5) * 2 * amp;
  }

  // Ramp-up: first 20% of duration linearly increases users
  currentUsers(elapsed) {
    const ramp = this.duration * 0.2;
    return elapsed < ramp
      ? Math.floor(this.targetUsers * (elapsed / ramp))
      : this.targetUsers;
  }

  // Load factor: fraction of SYSTEM CAPACITY currently in use.
  // 0.0 = idle, 1.0 = at full capacity, >1.0 = overloaded.
  // System capacity = targetUsers × scenario multiplier.
  loadFactor(users) {
    const cap = SCENARIO_CAPACITY[this.trafficType] || 1.0;
    return Math.min(users / (this.targetUsers * cap), 2.2);
  }

  // ── Per-API metric generation ─────────────────────────────────────────────
  apiMetrics(name, lf, weight) {
    const cfg = API_CONFIGS[name];

    // How much this API is overloaded beyond its optimal point (0 = healthy)
    const overload = Math.max(0, lf / cfg.optimalPoint - 1.0);

    // Latency: base rate while healthy, quadratic growth when overloaded
    const latMult = 1 + overload * overload * cfg.latencyMult;
    const avgLat = Math.max(
      cfg.baseLatency,
      Math.round(cfg.baseLatency * latMult + this.noise(12)),
    );
    const p95Lat = Math.round(avgLat * (1.6 + overload * 0.5));
    const p99Lat = Math.round(avgLat * (2.2 + overload * 0.8));

    // Error rate: near-zero while healthy, climbs quadratically when overloaded
    const errRate = Math.max(
      cfg.baseErrorRate,
      Math.min(
        0.55,
        cfg.baseErrorRate +
          overload * overload * cfg.errSens +
          this.noise(0.008),
      ),
    );

    const rps = Math.max(
      0,
      Math.round(
        (this.targetUsers / 10) * weight * (1 - errRate * 0.5) + this.noise(3),
      ),
    );

    let status = "healthy";
    if (errRate > 0.08) status = "degraded";
    if (errRate > 0.18) status = "critical";
    if (errRate > 0.35) status = "down";

    return {
      rps,
      avgLatency: avgLat,
      p95Latency: p95Lat,
      p99Latency: p99Lat,
      errorRate: parseFloat((errRate * 100).toFixed(2)),
      status,
    };
  }

  // ── Snapshot generation ───────────────────────────────────────────────────
  snapshot() {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const users = this.currentUsers(elapsed);
    const lf = this.loadFactor(users);
    const pattern =
      TRAFFIC_PATTERNS[this.trafficType] || TRAFFIC_PATTERNS.normal;

    let totalRps = 0,
      wLat = 0,
      wErr = 0,
      stepReqs = 0,
      stepFails = 0;
    const byApi = {};

    for (const [name, weight] of Object.entries(pattern)) {
      const m = this.apiMetrics(name, lf, weight);
      byApi[name] = m;
      totalRps += m.rps;
      wLat += m.avgLatency * weight;
      wErr += m.errorRate * weight;
      stepReqs += m.rps;
      stepFails += m.rps * (m.errorRate / 100);
    }

    this.totalReqs += stepReqs;
    this.failedReqs += stepFails;

    // Infrastructure metrics — scale with load factor
    // At lf=0.5 (normal day, 200 users): CPU ~47%, Memory ~56%
    // At lf=1.0 (at capacity):           CPU ~72%, Memory ~80%
    // At lf=2.0 (2x over capacity):      CPU ~95%, Memory ~98%
    const cpuUsage    = Math.min(99, Math.round(20 + lf * 37 + lf * lf * 20 + this.noise(5)));
    const memoryUsage = Math.min(99, Math.round(35 + lf * 25 + lf * lf * 18 + this.noise(4)));

    const avgLat = Math.round(wLat);
    const snap = {
      timestamp: Date.now(),
      elapsed: parseFloat(elapsed.toFixed(1)),
      progress: parseFloat(
        Math.min((elapsed / this.duration) * 100, 100).toFixed(1),
      ),
      currentUsers: users,
      rps: totalRps,
      avgLatency: avgLat,
      p95Latency: Math.round(avgLat * (1.9 + lf * 0.5)),
      p99Latency: Math.round(avgLat * (2.7 + lf * 1.0)),
      errorRate: parseFloat(wErr.toFixed(2)),
      cpuUsage,
      memoryUsage,
      totalRequests: Math.round(this.totalReqs),
      failedRequests: Math.round(this.failedReqs),
      loadFactor: parseFloat(lf.toFixed(2)),
      byApi,
    };

    this.history.push(snap);
    return snap;
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  start() {
    this.startTime = Date.now();
    this.totalReqs = 0;
    this.failedReqs = 0;
    this.history = [];

    this.interval = setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000;
      const snap = this.snapshot();
      this.emit("metrics", snap);

      if (elapsed >= this.duration) {
        clearInterval(this.interval);
        this.emit("complete", this.buildSummary());
      }
    }, 750);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  buildSummary() {
    const h = this.history;
    if (!h.length) return {};

    const max = (fn) => Math.max(...h.map(fn));
    const avg = (fn) => Math.round(h.reduce((s, m) => s + fn(m), 0) / h.length);

    const byApiSummary = {};
    for (const api of ["login", "payment", "wallet", "refund"]) {
      const ah = h.map((m) => m.byApi[api]).filter(Boolean);
      if (!ah.length) continue;
      byApiSummary[api] = {
        avgLatency: Math.round(
          ah.reduce((s, m) => s + m.avgLatency, 0) / ah.length,
        ),
        peakLatency: Math.max(...ah.map((m) => m.avgLatency)),
        avgErrorRate: parseFloat(
          (ah.reduce((s, m) => s + m.errorRate, 0) / ah.length).toFixed(2),
        ),
        peakErrorRate: Math.max(...ah.map((m) => m.errorRate)),
        finalStatus:
          (ah[ah.length - 1] && ah[ah.length - 1].status) || "unknown",
      };
    }

    return {
      targetUsers: this.targetUsers,
      duration: this.duration,
      trafficType: this.trafficType,
      peakRps: max((m) => m.rps),
      avgRps: avg((m) => m.rps),
      peakLatency: max((m) => m.avgLatency),
      avgLatency: avg((m) => m.avgLatency),
      peakP95: max((m) => m.p95Latency),
      peakErrorRate: parseFloat(
        Math.max(...h.map((m) => m.errorRate)).toFixed(2),
      ),
      avgErrorRate: parseFloat(
        (h.reduce((s, m) => s + m.errorRate, 0) / h.length).toFixed(2),
      ),
      peakCpu: max((m) => m.cpuUsage),
      peakMemory: max((m) => m.memoryUsage),
      totalRequests: Math.round(this.totalReqs),
      failedRequests: Math.round(this.failedReqs),
      byApi: byApiSummary,
      // Slim history for front-end charts
      history: h.map((m) => ({
        t: m.elapsed,
        rps: m.rps,
        avgLat: m.avgLatency,
        p95Lat: m.p95Latency,
        errRate: m.errorRate,
        cpu: m.cpuUsage,
        mem: m.memoryUsage,
        users: m.currentUsers,
      })),
    };
  }
}

module.exports = { LoadSimulator };
