/**
 * Stacked horizontal bar showing positive / neutral / negative percentages.
 * Widths should sum to ~100.
 */
export default function SentimentBar({ positivePct = 0, neutralPct = 0, negativePct = 0 }) {
  return (
    <div className="flex h-1.5 w-full rounded-full overflow-hidden gap-px">
      <div
        className="bg-emerald-400 rounded-l-full transition-all"
        style={{ width: `${positivePct}%` }}
      />
      <div className="bg-gray-300 transition-all" style={{ width: `${neutralPct}%` }} />
      <div
        className="bg-red-400 rounded-r-full transition-all"
        style={{ width: `${negativePct}%` }}
      />
    </div>
  );
}
