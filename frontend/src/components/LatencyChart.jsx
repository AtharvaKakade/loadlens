import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs font-mono space-y-1 border border-cyber-border">
      <p className="text-cyber-muted mb-1">{`T+${label}s`}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-cyber-muted">{p.name}:</span>
          <span style={{ color: p.color }} className="font-bold">
            {p.value}ms
          </span>
        </div>
      ))}
    </div>
  );
};

export default function LatencyChart({ data }) {
  const hasData = data.length > 1;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] font-mono text-cyber-muted uppercase tracking-widest">
            API Latency
          </p>
          <p className="text-xs font-mono text-cyber-text">
            Response Time Degradation
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-cyber-cyan inline-block" /> Avg
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-cyber-amber inline-block" /> P95
          </span>
          <span className="flex items-center gap-1">
            <span
              className="w-2 h-0.5 bg-cyber-red inline-block"
              style={{ borderTop: "1px dashed" }}
            />{" "}
            P99
          </span>
        </div>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-48 text-cyber-muted font-mono text-xs">
          Waiting for test data...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={data}
            margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1c1c3e"
              vertical={false}
            />
            <XAxis
              dataKey="t"
              tick={{
                fill: "#4a4a72",
                fontSize: 10,
                fontFamily: "JetBrains Mono",
              }}
              tickLine={false}
              axisLine={{ stroke: "#1c1c3e" }}
              tickFormatter={(v) => `${v}s`}
            />
            <YAxis
              tick={{
                fill: "#4a4a72",
                fontSize: 10,
                fontFamily: "JetBrains Mono",
              }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}ms`}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* SLA threshold */}
            <ReferenceLine
              y={1000}
              stroke="#f59e0b"
              strokeDasharray="4 2"
              opacity={0.5}
              label={{
                value: "SLA 1s",
                fill: "#f59e0b",
                fontSize: 9,
                fontFamily: "JetBrains Mono",
                position: "insideTopRight",
              }}
            />
            <Line
              type="monotone"
              dataKey="avgLat"
              name="Avg"
              stroke="#00d4ff"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#00d4ff", strokeWidth: 0 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="p95Lat"
              name="P95"
              stroke="#f59e0b"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 2"
              activeDot={{ r: 4, fill: "#f59e0b", strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
