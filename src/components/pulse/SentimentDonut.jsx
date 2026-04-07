import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = {
  Positive: "#34d399",
  Neutral: "#d1d5db",
  Negative: "#f87171",
};

export default function SentimentDonut({ positivePct = 0, neutralPct = 0, negativePct = 0 }) {
  const data = [
    { name: "Positive", value: positivePct },
    { name: "Neutral", value: neutralPct },
    { name: "Negative", value: negativePct },
  ].filter((d) => d.value > 0);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400">
        No data available.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name]} />
          ))}
        </Pie>
        <Tooltip formatter={(val) => `${val.toFixed(1)}%`} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value, entry) => (
            <span className="text-xs text-gray-600">
              {value} — {entry.payload.value.toFixed(1)}%
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
