import { useEffect, useRef } from "react";
import { postsAPI } from "../api/posts";

// Module-level singletons — persist for the lifetime of the browser tab
const viewed = new Set();   // session dedup: never re-track a post we already counted
const pending = new Set();  // collected post IDs waiting to be flushed
let flushTimeout = null;

function flush() {
  if (pending.size === 0) return;
  const ids = [...pending];
  pending.clear();
  postsAPI.trackViews(ids).catch(() => {});
}

function schedule() {
  // Flush immediately if batch is large enough, otherwise debounce
  if (pending.size >= 20) {
    clearTimeout(flushTimeout);
    flush();
  } else {
    clearTimeout(flushTimeout);
    flushTimeout = setTimeout(flush, 3000);
  }
}

/**
 * Tracks a post view when:
 *  - At least 50% of the post is visible in the viewport
 *  - The post remains visible for at least 2 seconds
 *  - The post hasn't already been tracked in this browser session
 *
 * @param {number|string} postId
 * @param {React.RefObject} ref - ref attached to the PostCard root element
 */
export function useViewTracker(postId, ref) {
  const dwellTimer = useRef(null);

  useEffect(() => {
    const el = ref?.current;
    if (!el || viewed.has(postId)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Start dwell timer — only count if user stays on post for 2s
          dwellTimer.current = setTimeout(() => {
            if (!viewed.has(postId)) {
              viewed.add(postId);
              pending.add(postId);
              schedule();
            }
          }, 2000);
        } else {
          // User scrolled away before 2s — cancel
          clearTimeout(dwellTimer.current);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      clearTimeout(dwellTimer.current);
    };
  }, [postId, ref]);
}
