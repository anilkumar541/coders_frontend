import { useState, useEffect, useRef, useCallback } from "react";
import PostCard from "./PostCard";
import { PostSkeleton } from "../common/Skeletons";

function PullToRefresh({ onRefresh, isRefreshing }) {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef(null);
  const startY = useRef(0);
  const threshold = 80;

  const handleTouchStart = useCallback((e) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e) => {
      if (!pulling || isRefreshing) return;
      const currentY = e.touches[0].clientY;
      const dist = Math.max(0, currentY - startY.current);
      setPullDistance(Math.min(dist * 0.5, 120));
    },
    [pulling, isRefreshing]
  );

  const handleTouchEnd = useCallback(() => {
    if (pullDistance >= threshold && !isRefreshing) {
      onRefresh();
    }
    setPulling(false);
    setPullDistance(0);
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });
    el.addEventListener("touchend", handleTouchEnd);
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div ref={containerRef}>
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="flex justify-center items-center overflow-hidden transition-all duration-200"
          style={{ height: isRefreshing ? 40 : pullDistance }}
        >
          {isRefreshing ? (
            <svg className="w-5 h-5 text-gray-400 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
            </svg>
          ) : (
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${pullDistance >= threshold ? "rotate-180" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          )}
        </div>
      )}
    </div>
  );
}

export default function PostFeed({ query }) {
  const sentinelRef = useRef(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const posts =
    query.data?.pages.flatMap((page) => page.data.results) ?? [];

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await query.refetch();
    setIsRefreshing(false);
  }, [query]);

  const handleObserver = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && query.hasNextPage && !query.isFetchingNextPage) {
        query.fetchNextPage();
      }
    },
    [query]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.8,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-red-600 mb-2">Failed to load posts.</p>
        <button
          onClick={() => query.refetch()}
          className="text-sm text-indigo-600 font-medium cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500">No posts yet. Be the first to share something.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PullToRefresh onRefresh={handleRefresh} isRefreshing={isRefreshing} />

      {posts.map((post) => (
        <PostCard key={post.id} post={post} onDeleted={() => query.refetch()} />
      ))}

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-4" />

      {query.isFetchingNextPage && (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
    </div>
  );
}
