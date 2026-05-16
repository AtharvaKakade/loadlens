/**
 * Risk Scoring Engine
 * Produces a 0-100 release readiness score from load test summary data.
 */
function calculateReadinessScore(summary) {
  let score = 100;
  const factors = [];
  const risks = [];

  // ── Error Rate ──────────────────────────────────────────────────────────
  const { avgErrorRate, peakErrorRate } = summary;

  if (avgErrorRate > 0.5) {
    const d = Math.min(20, (avgErrorRate - 0.5) * 4.5);
    score -= d;
    factors.push({
      name: "Avg Error Rate",
      value: `${avgErrorRate}%`,
      status: avgErrorRate > 3 ? "critical" : "warning",
      deduction: Math.round(d),
    });
    risks.push(
      `Average error rate ${avgErrorRate}% violates the production SLA ceiling of 0.1%.`,
    );
  } else {
    factors.push({
      name: "Avg Error Rate",
      value: `${avgErrorRate}%`,
      status: "healthy",
      deduction: 0,
    });
  }

  if (peakErrorRate > 5) {
    const d = Math.min(18, (peakErrorRate - 5) * 1.8);
    score -= d;
    factors.push({
      name: "Peak Error Rate",
      value: `${peakErrorRate}%`,
      status: peakErrorRate > 15 ? "critical" : "warning",
      deduction: Math.round(d),
    });
    risks.push(
      `Peak error spike of ${peakErrorRate}% will manifest as user-visible failures during traffic bursts.`,
    );
  } else {
    factors.push({
      name: "Peak Error Rate",
      value: `${peakErrorRate}%`,
      status: "healthy",
      deduction: 0,
    });
  }

  // ── Latency ─────────────────────────────────────────────────────────────
  if (summary.peakP95 > 2000) {
    const d = Math.min(18, (summary.peakP95 - 2000) / 180);
    score -= d;
    factors.push({
      name: "P95 Latency",
      value: `${summary.peakP95}ms`,
      status: "critical",
      deduction: Math.round(d),
    });
    risks.push(
      `P95 latency ${summary.peakP95}ms will cause payment gateway timeouts and mobile app session drops.`,
    );
  } else if (summary.peakP95 > 1000) {
    const d = (summary.peakP95 - 1000) / 100;
    score -= d;
    factors.push({
      name: "P95 Latency",
      value: `${summary.peakP95}ms`,
      status: "warning",
      deduction: Math.round(d),
    });
  } else {
    factors.push({
      name: "P95 Latency",
      value: `${summary.peakP95}ms`,
      status: "healthy",
      deduction: 0,
    });
  }

  // ── CPU ──────────────────────────────────────────────────────────────────
  if (summary.peakCpu > 85) {
    const d = Math.min(14, (summary.peakCpu - 85) * 1.4);
    score -= d;
    factors.push({
      name: "Peak CPU Usage",
      value: `${summary.peakCpu}%`,
      status: "critical",
      deduction: Math.round(d),
    });
    risks.push(
      `CPU saturation at ${summary.peakCpu}% will trigger OS-level process throttling and cascading failures.`,
    );
  } else if (summary.peakCpu > 70) {
    score -= 5;
    factors.push({
      name: "Peak CPU Usage",
      value: `${summary.peakCpu}%`,
      status: "warning",
      deduction: 5,
    });
  } else {
    factors.push({
      name: "Peak CPU Usage",
      value: `${summary.peakCpu}%`,
      status: "healthy",
      deduction: 0,
    });
  }

  // ── Memory ───────────────────────────────────────────────────────────────
  if (summary.peakMemory > 85) {
    score -= 10;
    factors.push({
      name: "Peak Memory",
      value: `${summary.peakMemory}%`,
      status: "critical",
      deduction: 10,
    });
    risks.push(
      `Memory at ${summary.peakMemory}% risks OOM kills on payment worker pods.`,
    );
  } else if (summary.peakMemory > 75) {
    score -= 5;
    factors.push({
      name: "Peak Memory",
      value: `${summary.peakMemory}%`,
      status: "warning",
      deduction: 5,
    });
  } else {
    factors.push({
      name: "Peak Memory",
      value: `${summary.peakMemory}%`,
      status: "healthy",
      deduction: 0,
    });
  }

  // ── Payment API (highest business risk) ─────────────────────────────────
  const payment = summary.byApi && summary.byApi.payment;
  if (payment) {
    if (payment.peakErrorRate > 5) {
      const d = Math.min(20, payment.peakErrorRate * 1.8);
      score -= d;
      const estLoss = Math.round(
        (payment.peakErrorRate * 1400 * summary.targetUsers) / 10000,
      );
      factors.push({
        name: "Payment API Stability",
        value: `${payment.peakErrorRate}% peak errors`,
        status: "critical",
        deduction: Math.round(d),
      });
      risks.push(
        `Payment API failure rate ${payment.peakErrorRate}% → est. $${estLoss.toLocaleString()}/hr in failed transactions.`,
      );
    } else {
      factors.push({
        name: "Payment API Stability",
        value: `${payment.peakErrorRate}% peak errors`,
        status: payment.peakErrorRate > 1 ? "warning" : "healthy",
        deduction: 0,
      });
    }
  }

  // ── Critical API count ───────────────────────────────────────────────────
  const criticalApis = Object.entries(summary.byApi || {}).filter(
    ([, v]) => v.finalStatus === "critical" || v.finalStatus === "down",
  );
  if (criticalApis.length > 0) {
    const d = criticalApis.length * 8;
    score -= d;
    factors.push({
      name: "Critical API Count",
      value: `${criticalApis.length} API(s)`,
      status: "critical",
      deduction: d,
    });
    risks.push(
      `${criticalApis.map(([k]) => k.toUpperCase()).join(", ")} reached critical failure state — incident escalation required.`,
    );
  }

  score = Math.max(0, Math.round(score));

  let recommendation, confidence, color, verdict;
  if (score >= 75) {
    recommendation = "GO";
    confidence = "HIGH";
    color = "green";
    verdict = "READY FOR PRODUCTION";
  } else if (score >= 50) {
    recommendation = "CAUTION";
    confidence = "MEDIUM";
    color = "amber";
    verdict = "CONDITIONAL — FIX BLOCKERS";
  } else {
    recommendation = "NO-GO";
    confidence = "HIGH";
    color = "red";
    verdict = "NOT PRODUCTION READY";
  }

  const successRate =
    summary.totalRequests > 0
      ? parseFloat(
          ((1 - summary.failedRequests / summary.totalRequests) * 100).toFixed(
            2,
          ),
        )
      : 100;

  return {
    score,
    recommendation,
    confidence,
    color,
    verdict,
    factors,
    risks,
    successRate,
  };
}

module.exports = { calculateReadinessScore };
