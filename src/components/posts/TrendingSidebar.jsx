import { Link } from "react-router-dom";
import { useTrending } from "../../hooks/usePosts";

export default function TrendingSidebar() {
  const { data, isLoading } = useTrending();
  const trending = data?.data || [];

  if (isLoading || trending.length === 0) return null;

  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Trending</h3>
      <div className="space-y-2">
        {trending.map((tag) => (
          <Link
            key={tag.name}
            to={`/hashtag/${tag.name}`}
            className="block text-sm hover:bg-gray-50 rounded-lg px-2 py-1.5 -mx-2"
          >
            <span className="text-indigo-600 font-medium">#{tag.name}</span>
            <span className="text-xs text-gray-400 ml-2">
              {tag.post_count_24h} posts today
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/** Horizontal scrollable pill strip — used on mobile */
export function TrendingPills() {
  const { data, isLoading } = useTrending();
  const trending = data?.data || [];

  if (isLoading || trending.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
      <span className="text-xs text-gray-400 shrink-0">Trending</span>
      {trending.map((tag) => (
        <Link
          key={tag.name}
          to={`/hashtag/${tag.name}`}
          className="shrink-0 flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-gray-200 text-indigo-600 font-medium whitespace-nowrap hover:bg-indigo-50 transition-colors"
        >
          #{tag.name}
          <span className="text-gray-400 font-normal">{tag.post_count_24h}</span>
        </Link>
      ))}
    </div>
  );
}
