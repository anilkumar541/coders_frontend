import { useParams } from "react-router-dom";
import { useHashtagFeed } from "../../hooks/usePosts";
import PostFeed from "../../components/posts/PostFeed";
import TrendingSidebar from "../../components/posts/TrendingSidebar";
import AIToolVoteCard from "../../components/dashboard/AIToolVoteCard";

export default function HashtagPage() {
  const { name } = useParams();
  const query = useHashtagFeed(name);

  return (
    <div className="max-w-6xl w-full mx-auto mt-3 px-2 sm:px-4 pb-16 flex gap-6">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">#{name}</h1>
        <PostFeed query={query} />
      </div>
      <div className="hidden lg:block w-80 shrink-0 space-y-4">
        <AIToolVoteCard />
        <TrendingSidebar />
      </div>
    </div>
  );
}
