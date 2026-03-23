import PostFeed from "../components/PostFeed";
import TrendingSidebar from "../components/TrendingSidebar";
import { useFeed } from "../hooks/usePosts";

export default function DashboardPage() {
  const feedQuery = useFeed();

  return (
    <div className="max-w-5xl mx-auto mt-8 px-4 pb-16 flex gap-6">
      <div className="flex-1 max-w-3xl">
        <PostFeed query={feedQuery} />
      </div>

      {/* Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <TrendingSidebar />
      </div>
    </div>
  );
}
