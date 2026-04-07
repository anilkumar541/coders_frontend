import { useState } from "react";
import PulseCard from "../../components/pulse/PulseCard";
import PeriodToggle from "../../components/pulse/PeriodToggle";
import PulseStatCard from "../../components/pulse/PulseStatCard";
import SentimentLineChart from "../../components/pulse/SentimentLineChart";
import TrendingDiscussionsList from "../../components/pulse/TrendingDiscussionsList";
import {
  PulseCardSkeleton,
  PulseChartSkeleton,
  PulseStatsSkeleton,
} from "../../components/pulse/PulseSkeleton";
import {
  useGlobalStats,
  usePulseCards,
  useSentimentHistory,
  useTrendingDiscussions,
} from "../../hooks/usePulse";

function formatSentiment(val) {
  if (val == null) return "—";
  const pct = (val * 100).toFixed(0);
  return val >= 0 ? `+${pct}%` : `${pct}%`;
}

export default function PulsePage() {
  const [period, setPeriod] = useState("7d");

  const { data: stats, isLoading: statsLoading } = useGlobalStats(period);
  const { data: cardsData, isLoading: cardsLoading } = usePulseCards(period);
  // Use the first entity's history for the overview chart (or aggregate — pick first active)
  const firstSlug = cardsData?.results?.[0]?.slug;
  const { data: historyData } = useSentimentHistory(firstSlug, period);
  const { data: trendingData, isLoading: trendingLoading } = useTrendingDiscussions({ period });

  const cards = cardsData?.results ?? [];
  const history = historyData?.results ?? [];
  const discussions = trendingData?.results ?? [];

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Pulse</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Real-time AI community sentiment from Reddit &amp; HackerNews
          </p>
        </div>
        <PeriodToggle value={period} onChange={setPeriod} />
      </div>

      {/* Global stats row */}
      {statsLoading ? (
        <PulseStatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <PulseStatCard
            label="Posts tracked"
            value={stats?.posts_tracked?.toLocaleString() ?? "—"}
            sub={`Last ${period}`}
          />
          <PulseStatCard
            label="Avg sentiment"
            value={formatSentiment(stats?.avg_sentiment)}
            sub={
              stats?.avg_sentiment >= 0.05
                ? "Leaning positive"
                : stats?.avg_sentiment <= -0.05
                ? "Leaning negative"
                : "Mixed"
            }
            color={
              stats?.avg_sentiment >= 0.05
                ? "text-emerald-600"
                : stats?.avg_sentiment <= -0.05
                ? "text-red-600"
                : "text-gray-900"
            }
          />
          <PulseStatCard
            label="Trending topics"
            value={stats?.trending_topic_count ?? "—"}
            sub="Across tracked entities"
          />
          <PulseStatCard
            label="Top subreddit"
            value={stats?.top_subreddit || "—"}
            sub="Most active community"
          />
        </div>
      )}

      {/* Entity pulse cards grid */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Pulse by Entity</h2>
        {cardsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <PulseCardSkeleton key={i} />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <p className="text-sm text-gray-400">
            No pulse data yet. Run a collection task to start tracking.
          </p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((entity) => (
              <PulseCard key={entity.slug} entity={entity} />
            ))}
          </div>
        )}
      </section>

      {/* Sentiment over time chart */}
      <section className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-700">
            Sentiment over time
            {firstSlug && cards[0] && (
              <span className="ml-1.5 text-gray-400 font-normal text-sm">— {cards[0].name}</span>
            )}
          </h2>
          {firstSlug && (
            <span className="text-xs text-gray-400">Click an entity card for full detail</span>
          )}
        </div>
        {cardsLoading ? (
          <PulseChartSkeleton height="h-44" />
        ) : (
          <SentimentLineChart data={history} />
        )}
      </section>

      {/* Trending discussions */}
      <section className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-base font-semibold text-gray-700 mb-1">Trending discussions</h2>
        <p className="text-xs text-gray-400 mb-4">Sorted by engagement velocity</p>
        {trendingLoading ? (
          <div className="space-y-3">
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
      </section>
    </div>
  );
}
