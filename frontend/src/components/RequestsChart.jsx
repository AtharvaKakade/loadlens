import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
            {p.dataKey === "errRate" ? `${p.value}%` : p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function RequestsChart({ data }) {
  const hasData = data.length > 1;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] font-mono text-cyber-muted uppercase tracking-widest">
            Throughput
          </p>
          <p className="text-xs font-mono text-cyber-text">
            Requests/sec &amp; Error Rate
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-cyber-accent/50 inline-block" />{" "}
            RPS
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-cyber-red/50 inline-block" />{" "}
            Errors %
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-cyber-purple inline-block" /> Users
          </span>
        </div>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-48 text-cyber-muted font-mono text-xs">
          Waiting for test data...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart
            data={data}
            margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
          >
            <defs>
              <linearGradient id="rpsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f9cf9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4f9cf9" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
              </linearGradient>
            </defs>
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
              yAxisId="left"
              tick={{
                fill: "#4a4a72",
                fontSize: 10,
                fontFamily: "JetBrains Mono",
              }}
              tickLine={false}
              axisLine={false}
              width={42}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{
                fill: "#4a4a72",
                fontSize: 10,
                fontFamily: "JetBrains Mono",
              }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              width={38}
              domain={[0, 50]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="rps"
              name="RPS"
              stroke="#4f9cf9"
              strokeWidth={2}
              fill="url(#rpsGrad)"
              dot={false}
              isAnimationActive={false}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="errRate"
              name="Err%"
              stroke="#ef4444"
              strokeWidth={1.5}
              fill="url(#errGrad)"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="users"
              name="Users"
              stroke="#8b5cf6"
              strokeWidth={1.5}
              strokeDasharray="3 2"
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
