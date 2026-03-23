import { useState, useRef, useEffect } from "react";
import { useEditPost, useDeletePost, useUndoDeletePost, useReactToPost, useSavePost, useBlockUser, useMuteUser } from "../hooks/usePosts";
import { useAuthStore } from "../store/authStore";
import CommentSection from "./CommentSection";
import MediaGallery from "./MediaGallery";
import PostContent from "./PostContent";
import ReportModal from "./ReportModal";
import LinkPreviewCard from "./LinkPreviewCard";
import EditHistoryModal from "./EditHistoryModal";
import {
  Heart,
  ThumbsDown,
  MessageCircle,
  Eye,
  Bookmark,
  MoreVertical,
  Pencil,
  Trash2,
  Flag,
  Ban,
  VolumeX,
} from "lucide-react";

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

export default function PostCard({ post, onDeleted }) {
  const user = useAuthStore((s) => s.user);
  const isOwner = user?.id === post.author.id;

  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [deleted, setDeleted] = useState(false);
  const [undoTimer, setUndoTimer] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const menuRef = useRef(null);
  const editMutation = useEditPost();
  const deleteMutation = useDeletePost();
  const undoMutation = useUndoDeletePost();
  const reactMutation = useReactToPost();
  const saveMutation = useSavePost();
  const blockMutation = useBlockUser();
  const muteMutation = useMuteUser();
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup undo timer on unmount
  useEffect(() => {
    return () => {
      if (undoTimer) clearTimeout(undoTimer);
    };
  }, [undoTimer]);

  const handleEdit = () => {
    setMenuOpen(false);
    setEditing(true);
    setEditContent(post.content);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editContent.trim() || editContent.trim() === post.content) {
      setEditing(false);
      return;
    }
    editMutation.mutate(
      { id: post.id, data: { content: editContent.trim() } },
      {
        onSuccess: () => setEditing(false),
      }
    );
  };

  const handleDelete = () => {
    setMenuOpen(false);
    deleteMutation.mutate(post.id, {
      onSuccess: () => {
        setDeleted(true);
        const timer = setTimeout(() => {
          onDeleted?.(post.id);
        }, 5000);
        setUndoTimer(timer);
      },
    });
  };

  const handleUndo = () => {
    if (undoTimer) clearTimeout(undoTimer);
    undoMutation.mutate(post.id, {
      onSuccess: () => setDeleted(false),
    });
  };

  if (deleted) {
    return (
      <div className="border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-gray-500">Post deleted.</span>
        <button
          onClick={handleUndo}
          disabled={undoMutation.isPending}
          className="text-sm text-indigo-600 font-medium cursor-pointer"
        >
          {undoMutation.isPending ? "Restoring..." : "Undo"}
        </button>
      </div>
    );
  }

  const profilePicture = post.author.profile_picture
    ? post.author.profile_picture.startsWith("http")
      ? post.author.profile_picture
      : `${API_URL}${post.author.profile_picture}`
    : null;

  const initials = post.author.username
    ? post.author.username.slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="border border-gray-200 rounded-xl px-4 py-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {profilePicture ? (
            <img
              src={profilePicture}
              alt={post.author.username}
              className="w-11 h-11 rounded-full object-cover"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
              {initials}
            </div>
          )}
          <div>
            <span className="text-sm font-medium text-gray-900">
              {post.author.username}
            </span>
            <span className="text-xs text-gray-400 ml-2">
              {timeAgo(post.created_at)}
            </span>
            {post.is_edited && (
              <button
                onClick={() => setShowHistory(true)}
                className="text-xs text-gray-400 ml-1 hover:text-indigo-500 cursor-pointer"
              >(edited)</button>
            )}
          </div>
        </div>

        {user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              aria-label="Post options"
            >
              <MoreVertical size={18} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-sm z-50">
                {isOwner ? (
                  <>
                    <button
                      onClick={handleEdit}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setMenuOpen(false); setShowReport(true); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                    >
                      <Flag size={14} /> Report
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); blockMutation.mutate(post.author.id); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                    >
                      <Ban size={14} /> Block
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); muteMutation.mutate(post.author.id); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                    >
                      <VolumeX size={14} /> Mute
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {editing ? (
        <form onSubmit={handleEditSubmit} className="mt-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            className="w-full resize-none text-sm text-gray-900 border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
            maxLength={1000}
          />
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              disabled={editMutation.isPending}
              className="px-3 py-1 text-xs font-medium text-white bg-gray-900 rounded-md disabled:opacity-50 cursor-pointer"
            >
              {editMutation.isPending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-3 py-1 text-xs text-gray-600 border border-gray-200 rounded-md cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <PostContent content={post.content} />
      )}

      {/* Link preview */}
      {!editing && post.link_preview && (
        <LinkPreviewCard preview={post.link_preview} />
      )}

      {/* Media gallery */}
      {!editing && post.media && post.media.length > 0 && (
        <MediaGallery media={post.media} />
      )}

      {/* Footer actions */}
      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
        {/* Like button */}
        <button
          onClick={() => reactMutation.mutate({ id: post.id, reaction_type: "like" })}
          disabled={reactMutation.isPending}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs cursor-pointer ${
            post.user_reaction === "like"
              ? "text-red-500 bg-red-50"
              : "text-gray-400 hover:text-red-500 hover:bg-red-50"
          }`}
          aria-label="Like"
        >
          <Heart size={16} fill={post.user_reaction === "like" ? "currentColor" : "none"} />
          {post.like_count > 0 && post.like_count}
        </button>

        {/* Dislike button */}
        <button
          onClick={() => reactMutation.mutate({ id: post.id, reaction_type: "dislike" })}
          disabled={reactMutation.isPending}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs cursor-pointer ${
            post.user_reaction === "dislike"
              ? "text-blue-500 bg-blue-50"
              : "text-gray-400 hover:text-blue-500 hover:bg-blue-50"
          }`}
          aria-label="Dislike"
        >
          <ThumbsDown size={16} />
        </button>

        {/* Comment count */}
        <span className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400">
          <MessageCircle size={16} />
          {post.comment_count > 0 && post.comment_count}
        </span>

        {/* View count */}
        <span className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400">
          <Eye size={16} />
          {post.view_count > 0 && post.view_count}
        </span>

        {/* Save/Bookmark button */}
        <button
          onClick={() => saveMutation.mutate(post.id)}
          disabled={saveMutation.isPending}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs cursor-pointer ml-auto ${
            post.user_saved
              ? "text-amber-500"
              : "text-gray-400 hover:text-amber-500"
          }`}
          aria-label="Save"
        >
          <Bookmark size={16} fill={post.user_saved ? "currentColor" : "none"} />
        </button>

        {post.visibility !== "public" && (
          <span className="text-xs text-gray-400">
            {post.visibility === "private" ? "Only me" : "Followers"}
          </span>
        )}
      </div>

      {/* Comments */}
      <CommentSection postId={post.id} commentCount={post.comment_count} />

      {/* Report Modal */}
      {showReport && (
        <ReportModal postId={post.id} onClose={() => setShowReport(false)} />
      )}

      {/* Edit History Modal */}
      {showHistory && (
        <EditHistoryModal
          postId={post.id}
          currentContent={post.content}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}
