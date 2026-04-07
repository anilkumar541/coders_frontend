import { useNavigate } from "react-router-dom";
import SentimentBar from "./SentimentBar";

const LABEL_CONFIG = {
  bullish: { text: "Bullish this week", color: "text-emerald-600" },
  bearish: { text: "Bearish this week", color: "text-red-600" },
  mixed:   { text: "Mixed this week",   color: "text-amber-600" },
};

function MomentumBadge({ changePct }) {
  if (changePct === null || changePct === undefined) return null;
  const up = changePct > 0;
  const flat = changePct === 0;
  if (flat) return null;
  return (
    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${up ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
      {up ? "▲" : "▼"} {Math.abs(changePct)}%
    </span>
  );
}

export default function PulseCard({ entity }) {
  const navigate = useNavigate();
  const {
    slug, name, color, pulse_label, avg_compound,
    positive_pct, neutral_pct, negative_pct,
    mention_count, mention_change_pct, has_enough_data,
  } = entity;

  const cfg = LABEL_CONFIG[pulse_label] ?? LABEL_CONFIG.mixed;

  return (
    <button
      onClick={() => navigate(`/pulse/${slug}`)}
      className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-md hover:border-gray-300 transition-all w-full"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <span className="font-semibold text-gray-900 text-sm">{name}</span>
        </div>
        <MomentumBadge changePct={mention_change_pct} />
      </div>

      {/* Pulse label or not enough data */}
      {has_enough_data ? (
        <p className={`text-xs font-medium mb-3 ${cfg.color}`}>{cfg.text}</p>
      ) : (
        <p className="text-xs font-medium mb-3 text-gray-400 italic">Not enough data yet</p>
      )}

      {/* Sentiment bar */}
      <SentimentBar positivePct={positive_pct} neutralPct={neutral_pct} negativePct={negative_pct} />

      {/* Footer stats */}
      <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
        <span>{mention_count.toLocaleString()} mentions</span>
        {has_enough_data && (
          <span className={avg_compound >= 0.05 ? "text-emerald-600" : avg_compound <= -0.05 ? "text-red-600" : "text-gray-500"}>
            {avg_compound >= 0 ? "+" : ""}{(avg_compound * 100).toFixed(0)}% sentiment
          </span>
        )}
      </div>
    </button>
  );
}
