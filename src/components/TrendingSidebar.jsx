import { Link } from "react-router-dom";
import { useTrending } from "../hooks/usePosts";

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
