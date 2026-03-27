import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { getAvatarStyle } from "../../utils/avatarColor";
import {
  useComments,
  useCreateComment,
  useEditComment,
  useDeleteComment,
  useReactToComment,
} from "../../hooks/usePosts";
import { CommentSkeleton } from "../common/Skeletons";
import ReportModal from "./ReportModal";
import {
  Heart,
  ThumbsDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  Flag,
  CornerDownRight,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatCount } from "../../utils/formatCount";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getProfilePic(author) {
  if (!author?.profile_picture) return null;
  return author.profile_picture.startsWith("http")
    ? author.profile_picture
    : `${API_URL}${author.profile_picture}`;
}

function Avatar({ author, size = "md" }) {
  const pic = getProfilePic(author);
  const initials = author?.username?.slice(0, 2).toUpperCase() || "?";
  const cls =
    size === "sm"
      ? "w-7 h-7 text-[10px]"
      : "w-8 h-8 text-[11px]";

  if (pic) {
    return (
      <img
        src={pic}
        alt={author.username}
        className={`${cls} rounded-full object-cover shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${cls} rounded-full text-white flex items-center justify-center font-semibold shrink-0`}
      style={getAvatarStyle(author?.username)}
    >
      {initials}
    </div>
  );
}

const COMMENT_LIMIT = 160;

/** Highlights @mentions in blue, with See more/See less for long content */
function CommentContent({ content }) {
  const [expanded, setExpanded] = useState(false);

  const isLong = content.length > COMMENT_LIMIT;
  const displayText =
    isLong && !expanded ? content.slice(0, COMMENT_LIMIT).trimEnd() : content;

  const parts = displayText.split(/(@\w+)/g);

  return (
    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap wrap-break-word mt-0.5">
      {parts.map((part, i) =>
        /^@\w+$/.test(part) ? (
          <span key={i} className="text-indigo-600 font-medium">
            {part}
          </span>
        ) : (
          part
        )
      )}
      {isLong && !expanded && "… "}
      {isLong && (
        <button
          onClick={() => setExpanded((p) => !p)}
          className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer text-xs"
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </p>
  );
}

/** Three-dot context menu: Edit/Delete for owner, Report for others */
function CommentMenu({ isOwner, commentId, onEdit, onDelete, isDeleting }) {
  const [open, setOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          onClick={(e) => { e.stopPropagation(); setOpen((p) => !p); }}
          className="p-1 rounded-full hover:bg-gray-100 text-gray-300 hover:text-gray-500 cursor-pointer transition-colors"
          aria-label="More options"
        >
          <MoreHorizontal size={15} />
        </button>

        {open && (
          <div className="absolute right-0 top-7 w-36 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden py-1">
            {isOwner ? (
              <>
                <button
                  onClick={() => { setOpen(false); onEdit(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <Pencil size={13} className="text-gray-500" />
                  Edit
                </button>
                <button
                  onClick={() => { setOpen(false); onDelete(); }}
                  disabled={isDeleting}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-500 hover:bg-red-50 cursor-pointer transition-colors disabled:opacity-40"
                >
                  <Trash2 size={13} />
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </>
            ) : (
              <button
                onClick={() => { setOpen(false); setShowReport(true); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <Flag size={13} className="text-gray-500" />
                Report
              </button>
            )}
          </div>
        )}
      </div>

      {showReport && (
        <ReportModal commentId={commentId} onClose={() => setShowReport(false)} />
      )}
    </>
  );
}

/** Comment / reply input form */
function CommentForm({
  postId,
  parentId = null,
  placeholder = "Write a comment...",
  initialContent = "",
  autoFocus = false,
  onSubmitted,
  onCancel,
  showAvatar = true,
}) {
  const [content, setContent] = useState(initialContent);
  const createMutation = useCreateComment(postId);
  const inputRef = useRef(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (inputRef.current) {
      // Size to initial content
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
      if (autoFocus) {
        inputRef.current.focus();
        const len = inputRef.current.value.length;
        inputRef.current.setSelectionRange(len, len);
      }
    }
  }, [autoFocus]);

  if (!user) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!content.trim() || createMutation.isPending) return;
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

  const isMultiLine = content.includes("\n") || content.length > 60;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape" && onCancel) onCancel();
  };

  const handleChange = (e) => {
    setContent(e.target.value);
    // Auto-resize
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2.5 items-start">
      {showAvatar && <Avatar author={user} size="sm" className="mt-1.5" />}
      <div className="flex-1">
        {/* Textarea + inline send button wrapper */}
        <div className="relative">
        <textarea
          ref={inputRef}
          rows={1}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={500}
          className={`w-full text-sm bg-gray-50 border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all placeholder-gray-400 resize-none leading-relaxed ${
            isMultiLine ? "rounded-2xl pb-3 overflow-y-auto" : "rounded-full pr-10 overflow-hidden"
          }`}
        />

        {/* Single-line: icon button inside */}
        {!isMultiLine && (
          <button
            type="submit"
            disabled={!content.trim() || createMutation.isPending}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 disabled:text-gray-300 hover:text-indigo-700 transition-colors cursor-pointer disabled:cursor-not-allowed"
            aria-label="Post comment"
          >
            <Send size={15} />
          </button>
        )}

        {/* Multi-line: action bar below */}
        {isMultiLine && (
          <div className="flex items-center justify-between mt-2">
            <p className="text-[11px] text-gray-300">
              Shift+Enter for new line
            </p>
            <div className="flex items-center gap-2">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={!content.trim() || createMutation.isPending}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Send size={12} />
                {createMutation.isPending ? "Posting…" : "Post"}
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </form>
  );
}

/** Lazy-loaded replies list */
function ReplyList({ postId, parentId, targetCommentId }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useComments(postId, parentId);

  const replies = data?.pages?.flatMap((p) => p.data.results) || [];

  // After replies load, scroll to target reply if present
  useEffect(() => {
    if (!targetCommentId || !replies.length) return;
    const el = document.querySelector(`[data-comment-id="${targetCommentId}"]`);
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-indigo-400", "rounded-xl", "transition-all");
        setTimeout(() => el.classList.remove("ring-2", "ring-indigo-400", "rounded-xl"), 2500);
      }, 100);
    }
  }, [replies, targetCommentId]);

  if (isLoading) {
    return (
      <div className="space-y-4 mt-3">
        <CommentSkeleton />
        <CommentSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-3">
      {replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          postId={postId}
          depth={1}
          rootId={parentId}
          targetCommentId={targetCommentId}
        />
      ))}
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
        >
          {isFetchingNextPage ? "Loading..." : "Load more replies"}
        </button>
      )}
    </div>
  );
}

/** A single comment or reply */
function CommentItem({ comment, postId, depth = 0, rootId = null, targetCommentId, targetParentId }) {
  const user = useAuthStore((s) => s.user);
  const isOwner = user?.id === comment.author.id;

  const isTarget = comment.id === targetCommentId;
  // Auto-expand this comment's replies if it is the parent of the target reply
  const isTargetParent = depth === 0 && comment.id === targetParentId;

  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyOpen, setReplyOpen] = useState(false);
  const [showReplies, setShowReplies] = useState(isTargetParent);

  // Scroll to and highlight this comment if it is the direct target
  const commentRef = useRef(null);
  useEffect(() => {
    if (!isTarget || !commentRef.current) return;
    setTimeout(() => {
      commentRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      commentRef.current.classList.add("ring-2", "ring-indigo-400", "rounded-xl", "transition-all");
      setTimeout(() => {
        commentRef.current?.classList.remove("ring-2", "ring-indigo-400", "rounded-xl");
      }, 2500);
    }, 150);
  }, [isTarget]);

  const editMutation = useEditComment(postId);
  const deleteMutation = useDeleteComment(postId);
  const reactMutation = useReactToComment(postId);

  const handleEditSubmit = (e) => {
    e?.preventDefault();
    if (!editContent.trim() || editMutation.isPending) return;
    editMutation.mutate(
      { commentId: comment.id, data: { content: editContent.trim() } },
      { onSuccess: () => setEditing(false) }
    );
  };

  const handleDelete = () => deleteMutation.mutate(comment.id);

  const react = (type) =>
    reactMutation.mutate({ commentId: comment.id, reaction_type: type });

  /* ── Deleted comment: render nothing ── */
  if (comment.is_deleted) {
    return null;
  }

  const hasRepliesSection = depth === 0 && (replyOpen || showReplies);

  return (
    <div
      ref={commentRef}
      data-comment-id={comment.id}
      className={`flex gap-2.5 ${depth > 0 ? "" : ""}`}
    >
      {/* Avatar column */}
      <div className="flex flex-col items-center shrink-0">
        <Avatar author={comment.author} size={depth === 0 ? "md" : "sm"} />
        {/* Thread line when replies/reply-form is open */}
        {hasRepliesSection && (
          <div className="w-px flex-1 bg-gray-200 mt-1.5 rounded-full min-h-4" />
        )}
      </div>

      {/* Content column */}
      <div className="flex-1 min-w-0 pb-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-baseline gap-1.5 flex-wrap leading-none">
            <span className="text-sm font-semibold text-gray-900">
              {comment.author.username}
            </span>
            <span className="text-[11px] text-gray-400">
              {timeAgo(comment.created_at)}
            </span>
            {comment.is_edited && (
              <span className="text-[11px] text-gray-400">· edited</span>
            )}
          </div>

          {user && (
            <CommentMenu
              isOwner={isOwner}
              commentId={comment.id}
              onEdit={() => {
                setEditing(true);
                setEditContent(comment.content);
              }}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending}
            />
          )}
        </div>

        {/* Body: edit form or content */}
        {editing ? (
          <div className="mt-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              maxLength={500}
              autoFocus
              rows={4}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setEditing(false);
                  setEditContent(comment.content);
                }
              }}
              className="w-full text-sm text-gray-800 bg-white border border-indigo-300 rounded-xl px-3 py-2 resize-none overflow-y-auto focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 transition-all leading-relaxed"
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleEditSubmit}
                disabled={editMutation.isPending || !editContent.trim() || editContent.trim() === comment.content}
                className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                {editMutation.isPending ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setEditContent(comment.content);
                }}
                className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <span className="ml-auto text-[11px] text-gray-300">
                {editContent.length}/500
              </span>
            </div>
          </div>
        ) : (
          <CommentContent content={comment.content} />
        )}

        {/* Action row */}
        {!editing && (
          <div className="flex items-center gap-4 mt-2">
            {/* Like */}
            <button
              onClick={() => react("like")}
              disabled={reactMutation.isPending}
              className={`flex items-center gap-1 cursor-pointer transition-colors ${
                comment.user_reaction === "like"
                  ? "text-red-500"
                  : "text-gray-400 hover:text-red-500"
              }`}
              aria-label="Like comment"
            >
              <Heart
                size={14}
                fill={comment.user_reaction === "like" ? "currentColor" : "none"}
                strokeWidth={1.75}
              />
              {comment.like_count > 0 && (
                <span className="text-xs text-gray-700">{formatCount(comment.like_count)}</span>
              )}
            </button>

            {/* Dislike */}
            <button
              onClick={() => react("dislike")}
              disabled={reactMutation.isPending}
              className={`flex items-center gap-1 cursor-pointer transition-colors ${
                comment.user_reaction === "dislike"
                  ? "text-blue-500"
                  : "text-gray-400 hover:text-blue-500"
              }`}
              aria-label="Dislike comment"
            >
              <ThumbsDown
                size={14}
                fill={comment.user_reaction === "dislike" ? "currentColor" : "none"}
                strokeWidth={1.75}
              />
              {comment.dislike_count > 0 && (
                <span className="text-xs text-gray-700">{formatCount(comment.dislike_count)}</span>
              )}
            </button>

            {/* Reply button — available on all comments and replies */}
            {user && (
              <button
                onClick={() => setReplyOpen((p) => !p)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-500 cursor-pointer transition-colors font-medium"
                aria-label="Reply"
              >
                <CornerDownRight size={13} />
                Reply
              </button>
            )}

            {/* Toggle replies (top-level with replies) */}
            {depth === 0 && comment.reply_count > 0 && (
              <button
                onClick={() => setShowReplies((p) => !p)}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer transition-colors"
              >
                {showReplies ? (
                  <>
                    <ChevronUp size={13} />
                    Hide replies
                  </>
                ) : (
                  <>
                    <ChevronDown size={13} />
                    {formatCount(comment.reply_count)}{" "}
                    {comment.reply_count === 1 ? "reply" : "replies"}
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Inline reply form
            - top-level: parentId = comment.id, expands reply list on success
            - reply: parentId = rootId (top-level thread), keeps within same thread
            - always pre-fills @mention of the person being replied to */}
        {replyOpen && (
          <div className="mt-3">
            <CommentForm
              postId={postId}
              parentId={depth === 0 ? comment.id : rootId}
              placeholder={`Reply to @${comment.author.username}…`}
              initialContent={`@${comment.author.username} `}
              autoFocus
              showAvatar={false}
              onSubmitted={() => {
                setReplyOpen(false);
                if (depth === 0) setShowReplies(true);
              }}
              onCancel={() => setReplyOpen(false)}
            />
          </div>
        )}

        {/* Replies list */}
        {showReplies && depth === 0 && (
          <ReplyList
            postId={postId}
            parentId={comment.id}
            targetCommentId={isTargetParent ? targetCommentId : undefined}
          />
        )}
      </div>
    </div>
  );
}

export default function CommentSection({ postId, targetCommentId, targetParentId }) {
  const user = useAuthStore((s) => s.user);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useComments(postId, undefined);

  const comments = data?.pages?.flatMap((p) => p.data.results) || [];

  return (
    <div>
      {/* Comment input */}
      {user && (
        <div className="mb-5">
          <CommentForm postId={postId} />
        </div>
      )}

      {/* Skeleton loaders */}
      {isLoading && (
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <CommentSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Comment list */}
      {!isLoading && comments.length > 0 && (
        <div className="space-y-5">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              targetCommentId={targetCommentId}
              targetParentId={targetParentId}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="mt-5 text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
        >
          {isFetchingNextPage ? "Loading..." : "Load more comments"}
        </button>
      )}

      {/* Empty state */}
      {!isLoading && comments.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-sm font-medium text-gray-500">No comments yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Be the first to share your thoughts!
          </p>
        </div>
      )}
    </div>
  );
}
