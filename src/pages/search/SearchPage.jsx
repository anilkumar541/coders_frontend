import { useState } from "react";
import { Link } from "react-router-dom";
import { useSearchPosts } from "../../hooks/usePosts";
import { postsAPI } from "../../api/posts";
import { useQuery } from "@tanstack/react-query";
import PostCard from "../../components/posts/PostCard";

const TABS = ["Posts", "Users", "Hashtags"];

function useSearchUsers(q) {
  return useQuery({
    queryKey: ["searchUsers", q],
    queryFn: () => postsAPI.searchUsers(q),
    enabled: !!q && q.length >= 1,
  });
}

function useSearchHashtags(q) {
  return useQuery({
    queryKey: ["searchHashtags", q],
    queryFn: () => postsAPI.searchHashtags(q),
    enabled: !!q && q.length >= 1,
  });
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Posts");

  const postsResult = useSearchPosts(activeTab === "Posts" ? query : "");
  const usersResult = useSearchUsers(activeTab === "Users" ? query : "");
  const hashtagsResult = useSearchHashtags(activeTab === "Hashtags" ? query : "");

  const posts = postsResult.data?.pages?.flatMap((p) => p.data.results) || [];
  const users = usersResult.data?.data || [];
  const hashtags = hashtagsResult.data?.data || [];

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts, users, or hashtags..."
          className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm cursor-pointer border-b-2 -mb-px ${
              activeTab === tab
                ? "border-gray-900 text-gray-900 font-medium"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Results */}
      {activeTab === "Posts" && (
        <div className="space-y-4">
          {query.length < 2 && (
            <p className="text-sm text-gray-400 text-center py-8">
              Type at least 2 characters to search posts
            </p>
          )}
          {query.length >= 2 && postsResult.isLoading && (
            <p className="text-sm text-gray-400 text-center py-8">Searching...</p>
          )}
          {query.length >= 2 && !postsResult.isLoading && posts.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No posts found</p>
          )}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {postsResult.hasNextPage && (
            <button
              onClick={() => postsResult.fetchNextPage()}
              disabled={postsResult.isFetchingNextPage}
              className="w-full py-2 text-sm text-indigo-600 font-medium cursor-pointer"
            >
              {postsResult.isFetchingNextPage ? "Loading..." : "Load more"}
            </button>
          )}
        </div>
      )}

      {activeTab === "Users" && (
        <div className="space-y-2">
          {query.length < 1 && (
            <p className="text-sm text-gray-400 text-center py-8">
              Type to search users
            </p>
          )}
          {query.length >= 1 && usersResult.isLoading && (
            <p className="text-sm text-gray-400 text-center py-8">Searching...</p>
          )}
          {query.length >= 1 && !usersResult.isLoading && users.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No users found</p>
          )}
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-medium">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user.username}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Hashtags" && (
        <div className="space-y-2">
          {query.length < 1 && (
            <p className="text-sm text-gray-400 text-center py-8">
              Type to search hashtags
            </p>
          )}
          {query.length >= 1 && hashtagsResult.isLoading && (
            <p className="text-sm text-gray-400 text-center py-8">Searching...</p>
          )}
          {query.length >= 1 && !hashtagsResult.isLoading && hashtags.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">
              No hashtags found
            </p>
          )}
          {hashtags.map((tag) => (
            <Link
              key={tag.id}
              to={`/hashtag/${tag.name}`}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              <span className="text-sm text-indigo-600 font-medium">
                #{tag.name}
              </span>
              <span className="text-xs text-gray-400">
                {tag.post_count} posts
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
