import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import {
  useComments,
  useCreateComment,
  useEditComment,
  useDeleteComment,
  useReactToComment,
} from "../hooks/usePosts";
import { CommentSkeleton } from "./Skeletons";
import { Heart, ThumbsDown } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function CommentForm({ postId, parentId = null, onSubmitted, placeholder = "Write a comment...", autoFocus = false }) {
  const [content, setContent] = useState("");
  const createMutation = useCreateComment(postId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    createMutation.mutate(
      { content: content.trim(), parent_id: parentId },
      {
        onSuccess: () => {
          setContent("");
          onSubmitted?.();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        maxLength={500}
        autoFocus={autoFocus}
        className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
      />
      <button
        type="submit"
        disabled={!content.trim() || createMutation.isPending}
        className="px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg disabled:opacity-50 cursor-pointer"
      >
        {createMutation.isPending ? "..." : "Post"}
      </button>
    </form>
  );
}

function CommentItem({ comment, postId, depth = 0 }) {
  const user = useAuthStore((s) => s.user);
  const isOwner = user?.id === comment.author.id;

  const [showReplies, setShowReplies] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const editMutation = useEditComment(postId);
  const deleteMutation = useDeleteComment(postId);
  const reactMutation = useReactToComment(postId);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    editMutation.mutate(
      { commentId: comment.id, data: { content: editContent.trim() } },
      { onSuccess: () => setEditing(false) }
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(comment.id);
  };

  const profilePicture = comment.author.profile_picture
    ? comment.author.profile_picture.startsWith("http")
      ? comment.author.profile_picture
      : `${API_URL}${comment.author.profile_picture}`
    : null;

  const initials = comment.author.username
    ? comment.author.username.slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className={depth > 0 ? "ml-8 mt-3" : "mt-3"}>
      <div className="flex gap-2">
        {/* Avatar */}
        {profilePicture ? (
          <img
            src={profilePicture}
            alt={comment.author.username}
            className="w-7 h-7 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-medium flex-shrink-0">
            {initials}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-900">
              {comment.author.username}
            </span>
            <span className="text-[11px] text-gray-400">
              {timeAgo(comment.created_at)}
            </span>
            {comment.is_edited && (
              <span className="text-[11px] text-gray-400">(edited)</span>
            )}
          </div>

          {/* Content */}
          {editing ? (
            <form onSubmit={handleEditSubmit} className="mt-1">
              <input
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                maxLength={500}
                autoFocus
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
              <div className="flex gap-2 mt-1">
                <button
                  type="submit"
                  disabled={editMutation.isPending}
                  className="text-xs text-indigo-600 font-medium cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="text-xs text-gray-500 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
          )}

          {/* Actions */}
          {!editing && (
            <div className="flex items-center gap-3 mt-1">
              {/* Like */}
              <button
                onClick={() =>
                  reactMutation.mutate({
                    commentId: comment.id,
                    reaction_type: "like",
                  })
                }
                className={`flex items-center gap-0.5 text-[11px] cursor-pointer ${
                  comment.user_reaction === "like"
                    ? "text-red-500"
                    : "text-gray-400 hover:text-red-500"
                }`}
                aria-label="Like comment"
              >
                <Heart size={14} fill={comment.user_reaction === "like" ? "currentColor" : "none"} />
                {comment.like_count > 0 && comment.like_count}
              </button>

              {/* Dislike */}
              <button
                onClick={() =>
                  reactMutation.mutate({
                    commentId: comment.id,
                    reaction_type: "dislike",
                  })
                }
                className={`flex items-center gap-0.5 text-[11px] cursor-pointer ${
                  comment.user_reaction === "dislike"
                    ? "text-blue-500"
                    : "text-gray-400 hover:text-blue-500"
                }`}
                aria-label="Dislike comment"
              >
                <ThumbsDown size={14} />
              </button>

              {/* Reply button (only for top-level comments) */}
              {depth === 0 && user && (
                <button
                  onClick={() => setReplyOpen(!replyOpen)}
                  className="text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label="Reply"
                >
                  Reply
                </button>
              )}

              {/* Owner actions */}
              {isOwner && !comment.is_deleted && (
                <>
                  <button
                    onClick={() => {
                      setEditing(true);
                      setEditContent(comment.content);
                    }}
                    className="text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="text-[11px] text-gray-400 hover:text-red-500 cursor-pointer"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          )}

          {/* Reply form */}
          {replyOpen && (
            <div className="mt-2">
              <CommentForm
                postId={postId}
                parentId={comment.id}
                onSubmitted={() => {
                  setReplyOpen(false);
                  setShowReplies(true);
                }}
                placeholder={`Reply to @${comment.author.username}...`}
                autoFocus
              />
            </div>
          )}

          {/* Show replies toggle */}
          {depth === 0 && comment.reply_count > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-xs text-indigo-600 mt-1 cursor-pointer"
            >
              {showReplies
                ? "Hide replies"
                : `View ${comment.reply_count} ${comment.reply_count === 1 ? "reply" : "replies"}`}
            </button>
          )}

          {/* Replies */}
          {showReplies && depth === 0 && (
            <ReplyList postId={postId} parentId={comment.id} />
          )}
        </div>
      </div>
    </div>
  );
}

function ReplyList({ postId, parentId }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useComments(postId, parentId);

  if (isLoading) {
    return (
      <div className="ml-8 mt-2 space-y-1">
        <CommentSkeleton />
        <CommentSkeleton />
      </div>
    );
  }

  const replies = data?.pages?.flatMap((p) => p.data.results) || [];

  return (
    <div>
      {replies.map((reply) => (
        <CommentItem key={reply.id} comment={reply} postId={postId} depth={1} />
      ))}
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="text-xs text-indigo-600 ml-8 mt-1 cursor-pointer"
        >
          {isFetchingNextPage ? "Loading..." : "Load more replies"}
        </button>
      )}
    </div>
  );
}

export default function CommentSection({ postId, commentCount }) {
  const [expanded, setExpanded] = useState(false);
  const user = useAuthStore((s) => s.user);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useComments(postId, expanded ? undefined : null);

  const comments = data?.pages?.flatMap((p) => p.data.results) || [];

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      {/* Toggle button */}
      {!expanded && commentCount > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="text-xs text-indigo-600 cursor-pointer mb-2"
          aria-label="Show comments"
        >
          View {commentCount} {commentCount === 1 ? "comment" : "comments"}
        </button>
      )}

      {expanded && commentCount > 0 && (
        <button
          onClick={() => setExpanded(false)}
          className="text-xs text-gray-500 cursor-pointer mb-2"
        >
          Hide comments
        </button>
      )}

      {/* Comment form */}
      {user && expanded && (
        <CommentForm postId={postId} />
      )}

      {/* Comment list */}
      {expanded && isLoading && (
        <div className="mt-2 space-y-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <CommentSkeleton key={i} />
          ))}
        </div>
      )}

      {expanded && comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} postId={postId} />
      ))}

      {expanded && hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="text-xs text-indigo-600 mt-2 cursor-pointer"
        >
          {isFetchingNextPage ? "Loading..." : "Load more comments"}
        </button>
      )}

      {/* Inline comment form when no comments yet */}
      {user && !expanded && commentCount === 0 && (
        <CommentForm postId={postId} />
      )}
    </div>
  );
}
