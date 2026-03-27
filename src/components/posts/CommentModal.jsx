import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import CommentSection from "./CommentSection";

export default function CommentModal({ post, onClose, targetCommentId, targetParentId }) {
  const overlayRef = useRef(null);

  // Lock scroll + keyboard close
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      onWheel={(e) => e.stopPropagation()}
    >
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Comments</h2>
            {post.comment_count > 0 && (
              <p className="text-xs text-gray-400">{post.comment_count} {post.comment_count === 1 ? "comment" : "comments"}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer transition-colors"
            aria-label="Close comments"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable comments */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-2">
          <CommentSection
            postId={post.id}
            targetCommentId={targetCommentId}
            targetParentId={targetParentId}
          />
        </div>
      </div>
    </div>
  );
}
