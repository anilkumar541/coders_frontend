import { useParams } from "react-router-dom";
import { useHashtagFeed } from "../../hooks/usePosts";
import PostFeed from "../../components/posts/PostFeed";

export default function HashtagPage() {
  const { name } = useParams();
  const query = useHashtagFeed(name);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">#{name}</h1>
      <PostFeed query={query} />
    </div>
  );
}
