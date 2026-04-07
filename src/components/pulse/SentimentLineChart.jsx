import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function SentimentLineChart({ data = [], showBreakdown = false }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400">
        No sentiment data yet for this period.
      </div>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    date: formatDate(d.date),
    // compound is -1 to +1; show as percentage-like number
    Compound: parseFloat((d.avg_compound * 100).toFixed(1)),
    Positive: parseFloat(d.positive_pct?.toFixed(1) ?? 0),
    Negative: parseFloat(d.negative_pct?.toFixed(1) ?? 0),
    Neutral: parseFloat(d.neutral_pct?.toFixed(1) ?? 0),
  }));

  if (showBreakdown) {
    return (
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} unit="%" />
          <Tooltip formatter={(val) => `${val}%`} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="Positive" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="Negative" stroke="#f87171" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="Neutral" stroke="#d1d5db" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} unit="%" />
        <Tooltip formatter={(val) => `${val}%`} labelFormatter={(label) => `Date: ${label}`} />
        <Line type="monotone" dataKey="Compound" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
