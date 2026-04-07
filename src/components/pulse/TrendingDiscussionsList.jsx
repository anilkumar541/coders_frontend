const SENTIMENT_BADGE = {
  positive: "bg-emerald-100 text-emerald-700",
  negative: "bg-red-100 text-red-700",
  neutral: "bg-gray-100 text-gray-600",
};

function formatScore(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function TrendingDiscussionsList({ discussions = [] }) {
  if (!discussions.length) {
    return (
      <p className="text-sm text-gray-400 py-4">No trending discussions yet.</p>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {discussions.map((item, idx) => {
        const badge = SENTIMENT_BADGE[item.sentiment_label] ?? SENTIMENT_BADGE.neutral;
        const sentimentPct = Math.round(Math.abs(item.sentiment_compound) * 100);
        const sentimentText = `${sentimentPct}% ${item.sentiment_label}`;

        return (
          <div key={item.id} className="flex items-start gap-3 py-3">
            {/* Rank number */}
            <span className="text-gray-300 font-mono text-sm w-5 flex-shrink-0 mt-0.5">
              {String(idx + 1).padStart(2, "0")}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <a
                href={item.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-900 hover:text-indigo-600 line-clamp-2 transition-colors"
              >
                {item.title}
              </a>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                {item.subreddit && (
                  <span className="font-medium text-gray-600">{item.subreddit}</span>
                )}
                {item.source === "hn" && (
                  <span className="font-medium text-orange-600">HackerNews</span>
                )}
                <span>{formatScore(item.score)} upvotes</span>
                <span>{item.comment_count} comments</span>
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${badge}`}>
                  {sentimentText}
                </span>
              </div>
            </div>

            {/* Score */}
            <span className="text-sm font-semibold text-gray-400 flex-shrink-0">
              {formatScore(item.score)} pts
            </span>
          </div>
        );
      })}
    </div>
  );
}
