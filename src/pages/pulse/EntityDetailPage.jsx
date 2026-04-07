import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import PeriodToggle from "../../components/pulse/PeriodToggle";
import PulseStatCard from "../../components/pulse/PulseStatCard";
import SentimentDonut from "../../components/pulse/SentimentDonut";
import SentimentLineChart from "../../components/pulse/SentimentLineChart";
import TrendingDiscussionsList from "../../components/pulse/TrendingDiscussionsList";
import { PulseChartSkeleton, PulseStatsSkeleton } from "../../components/pulse/PulseSkeleton";
import { useEntityDetail, useTrendingDiscussions } from "../../hooks/usePulse";

const LABEL_CONFIG = {
  bullish: { text: "Bullish", color: "text-emerald-700", bg: "bg-emerald-100" },
  bearish: { text: "Bearish", color: "text-red-700", bg: "bg-red-100" },
  mixed: { text: "Mixed", color: "text-amber-700", bg: "bg-amber-100" },
};

function formatNumber(n) {
  if (n == null) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function EntityDetailPage() {
  const { entity: slug } = useParams();
  const [period, setPeriod] = useState("7d");

  const { data, isLoading, isError } = useEntityDetail(slug, period);
  const { data: trendingData, isLoading: trendingLoading } = useTrendingDiscussions({
    entitySlug: slug,
    limit: 10,
    period,
  });

  const discussions = trendingData?.results ?? [];

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-8 space-y-6">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        <PulseStatsSkeleton />
        <PulseChartSkeleton height="h-56" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-8">
        <Link to="/pulse" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft size={14} /> Back to pulse
        </Link>
        <p className="text-gray-500">Entity not found.</p>
      </div>
    );
  }

  const cfg = LABEL_CONFIG[data.pulse_label] ?? LABEL_CONFIG.mixed;

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-8 space-y-6">
      {/* Back link */}
      <Link
        to="/pulse"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft size={14} /> Back to pulse
      </Link>

      {/* Entity header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
            <h1 className="text-2xl font-bold text-gray-900">{data.name}</h1>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
              {cfg.text}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Sentiment across {formatNumber(data.mention_count)} mentions from{" "}
            {data.subreddit_count} subreddit{data.subreddit_count !== 1 ? "s" : ""} this {period === "24h" ? "day" : period === "7d" ? "week" : "month"}
          </p>
        </div>
        <PeriodToggle value={period} onChange={setPeriod} />
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <PulseStatCard
          label="Mentions"
          value={formatNumber(data.mention_count)}
          sub="Posts tracked"
        />
        <PulseStatCard
          label="Avg sentiment"
          value={
            data.avg_compound >= 0
              ? `+${(data.avg_compound * 100).toFixed(0)}%`
              : `${(data.avg_compound * 100).toFixed(0)}%`
          }
          color={
            data.avg_compound >= 0.05
              ? "text-emerald-600"
              : data.avg_compound <= -0.05
              ? "text-red-600"
              : "text-gray-900"
          }
        />
        <PulseStatCard
          label="Top thread"
          value={formatNumber(data.top_thread_score)}
          sub={
            data.top_thread_title ? (
              <a
                href={data.top_thread_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 hover:text-indigo-600 transition-colors line-clamp-1"
              >
                {data.top_thread_title.slice(0, 40)}…
                <ExternalLink size={10} />
              </a>
            ) : "—"
          }
        />
        <PulseStatCard
          label="Comment volume"
          value={formatNumber(data.comment_volume)}
          sub="Total comments"
        />
      </div>

      {/* Sentiment trend chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-base font-semibold text-gray-700 mb-4">
          Sentiment trend — {data.name} ({period})
        </h2>
        <SentimentLineChart data={data.history ?? []} showBreakdown />
      </div>

      {/* Donut + top subreddits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-2">Sentiment breakdown</h2>
          <SentimentDonut
            positivePct={data.positive_pct}
            neutralPct={data.neutral_pct}
            negativePct={data.negative_pct}
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Top subreddits</h2>
          {data.top_subreddits?.length ? (
            <div className="space-y-2">
              {data.top_subreddits.map((sub) => (
                <div key={sub.name} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{sub.name}</span>
                  <span className="text-gray-400">{sub.count} posts</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No subreddit data yet.</p>
          )}
        </div>
      </div>

      {/* Trending keywords */}
      {data.trending_keywords?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-700">Trending keywords</h2>
            <span className="text-xs text-gray-400">Extracted from this period's posts</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.trending_keywords.map((kw) => (
              <span
                key={kw.word}
                className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium"
              >
                {kw.word}
                <span className="ml-1 text-gray-400">×{kw.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Top discussions */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-gray-700">Top discussions</h2>
          <span className="text-xs text-gray-400">Sorted by engagement</span>
        </div>
        {trendingLoading ? (
          <div className="space-y-3 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-5 h-4 bg-gray-200 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <TrendingDiscussionsList discussions={discussions} />
        )}
      </div>
    </div>
  );
}
