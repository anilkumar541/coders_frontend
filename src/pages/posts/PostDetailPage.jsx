import { useParams, useSearchParams, Link } from "react-router-dom";
import { usePost } from "../../hooks/usePosts";
import PostCard from "../../components/posts/PostCard";
import TrendingSidebar from "../../components/posts/TrendingSidebar";
import AIToolVoteCard from "../../components/dashboard/AIToolVoteCard";

function PostSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-200" />
        <div className="space-y-1.5">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-2.5 w-16 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-200 rounded w-4/6" />
      </div>
    </div>
  );
}

export default function PostDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const targetCommentId = searchParams.get("comment") || undefined;
  const targetParentId  = searchParams.get("parent")  || undefined;

  const { data, isLoading, isError } = usePost(id);
  const post = data?.data;

  return (
    <div className="max-w-6xl w-full mx-auto mt-3 px-2 sm:px-4 pb-16 flex gap-6">
      <div className="flex-1 min-w-0">
        {isLoading && <PostSkeleton />}

        {isError && (
          <div className="text-center py-16">
            <p className="text-sm text-gray-500">Post not found or has been deleted.</p>
            <Link to="/dashboard" className="text-sm text-indigo-600 font-medium mt-2 inline-block">
              Go to home
            </Link>
          </div>
        )}

        {post && (
          <PostCard
            post={post}
            targetCommentId={targetCommentId}
            targetParentId={targetParentId}
          />
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-80 shrink-0 space-y-4">
        <AIToolVoteCard />
        <TrendingSidebar />
      </div>
    </div>
  );
}
