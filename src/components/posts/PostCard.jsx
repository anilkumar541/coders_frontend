import { useState, useRef, useEffect } from "react";
import { useViewTracker } from "../../hooks/useViewTracker";
import { formatCount } from "../../utils/formatCount";
import { timeAgo } from "../../utils/timeAgo";
import Avatar from "../common/Avatar";
import { useDeletePost, useUndoDeletePost, useReactToPost, useSavePost, useBlockUser, useMuteUser, useBlockedUsers, useMutedUsers, useFollowUser } from "../../hooks/usePosts";
import { useAuthStore } from "../../store/authStore";
import MediaGallery from "./MediaGallery";
import PostContent from "./PostContent";
import ReportModal from "./ReportModal";
import LinkPreviewCard from "./LinkPreviewCard";
import EditHistoryModal from "./EditHistoryModal";
import EditPostModal from "./EditPostModal";
import CommentModal from "./CommentModal";
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
  UserPlus,
  UserMinus,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";

const CATEGORY_BADGE = {
  ai_update: { label: "AI Update", className: "bg-violet-100 text-violet-700" },
};

export default function PostCard({ post, onDeleted }) {
  const user = useAuthStore((s) => s.user);
  const isOwner = user?.id === post.author.id;

  const [menuOpen, setMenuOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [undoTimer, setUndoTimer] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const menuRef = useRef(null);
  const cardRef = useRef(null);
  useViewTracker(post.id, cardRef);
  const deleteMutation = useDeletePost();
  const undoMutation = useUndoDeletePost();
  const reactMutation = useReactToPost();
  const saveMutation = useSavePost();
  const blockMutation = useBlockUser();
  const muteMutation = useMuteUser();
  const followMutation = useFollowUser();
  const { data: blockedUsersData } = useBlockedUsers();
  const { data: mutedUsersData } = useMutedUsers();
  const [showReport, setShowReport] = useState(false);

  const isBlocked = blockedUsersData?.data?.some((u) => u.id === post.author.id) ?? false;
  const isMuted = mutedUsersData?.data?.some((u) => u.id === post.author.id) ?? false;
  const isFollowing = post.is_following_author ?? false;


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
    setShowEditModal(true);
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

  return (
    <div ref={cardRef} className="border border-gray-200 rounded-xl px-4 pt-2 pb-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar user={post.author} size="md" className="shrink-0" />
          <div>
            <Link
              to={`/user/${post.author.id}`}
              className="text-sm font-medium text-gray-900 hover:underline"
            >
              {post.author.username}
            </Link>
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
                      onClick={() => {
                        setMenuOpen(false);
                        followMutation.mutate(post.author.id);
                      }}
                      disabled={followMutation.isPending}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                    >
                      {isFollowing ? <UserMinus size={14} /> : <UserPlus size={14} />}
                      {followMutation.isPending ? "…" : isFollowing ? "Unfollow" : "Follow"}
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); setShowReport(true); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                    >
                      <Flag size={14} /> Report
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); blockMutation.mutate(post.author.id); }}
                      disabled={blockMutation.isPending}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                    >
                      <Ban size={14} /> {blockMutation.isPending ? "…" : isBlocked ? "Unblock" : "Block"}
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); muteMutation.mutate(post.author.id); }}
                      disabled={muteMutation.isPending}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                    >
                      <VolumeX size={14} /> {muteMutation.isPending ? "…" : isMuted ? "Unmute" : "Mute"}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category badge + Source chip */}
      {(CATEGORY_BADGE[post.category] || post.source_url) && (
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {CATEGORY_BADGE[post.category] && (
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${CATEGORY_BADGE[post.category].className}`}
            >
              {CATEGORY_BADGE[post.category].label}
            </span>
          )}
          {post.source_url && (
            <a
              href={post.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-indigo-600 transition-colors"
            >
              <ExternalLink size={11} />
              <span>Source</span>
            </a>
          )}
        </div>
      )}

      {/* Content */}
      <PostContent content={post.content} mentions={post.mentions} />

      {/* Link preview */}
      {post.link_preview && (
        <LinkPreviewCard preview={post.link_preview} />
      )}

      {/* Media gallery */}
      {post.media && post.media.length > 0 && (
        <MediaGallery media={post.media} />
      )}

      {/* Footer actions */}
      <div className="flex items-center gap-6 mt-4 mb-1">
        {/* Like button */}
        <button
          onClick={() => reactMutation.mutate({ id: post.id, reaction_type: "like" })}
          disabled={reactMutation.isPending}
          className={`flex items-center gap-1.5 text-sm cursor-pointer transition-colors ${
            post.user_reaction === "like"
              ? "text-red-500"
              : "text-gray-400 hover:text-red-500"
          }`}
          aria-label="Like"
        >
          <Heart size={19} fill={post.user_reaction === "like" ? "currentColor" : "none"} strokeWidth={1.75} />
          {post.like_count > 0 && <span className="text-sm text-gray-900">{formatCount(post.like_count)}</span>}
        </button>

        {/* Dislike button */}
        <button
          onClick={() => reactMutation.mutate({ id: post.id, reaction_type: "dislike" })}
          disabled={reactMutation.isPending}
          className={`flex items-center gap-1.5 text-sm cursor-pointer transition-colors ${
            post.user_reaction === "dislike"
              ? "text-blue-500"
              : "text-gray-400 hover:text-blue-500"
          }`}
          aria-label="Dislike"
        >
          <ThumbsDown size={19} fill={post.user_reaction === "dislike" ? "currentColor" : "none"} strokeWidth={1.75} />
          {post.dislike_count > 0 && <span className="text-sm text-gray-900">{formatCount(post.dislike_count)}</span>}
        </button>

        {/* Comment button */}
        <button
          onClick={() => setShowComments(true)}
          className="flex items-center gap-1.5 text-sm cursor-pointer transition-colors text-gray-400 hover:text-indigo-500"
          aria-label="Comments"
        >
          <MessageCircle size={19} />
          {post.comment_count > 0 && <span className="text-sm text-gray-900">{formatCount(post.comment_count)}</span>}
        </button>

        {/* View count */}
        <span className="flex items-center gap-1.5 text-sm text-gray-400">
          <Eye size={19} />
          {post.view_count > 0 && <span className="text-sm text-gray-900">{formatCount(post.view_count)}</span>}
        </span>

        {/* Save/Bookmark button */}
        <button
          onClick={() => saveMutation.mutate(post.id)}
          disabled={saveMutation.isPending}
          className={`flex items-center gap-1.5 text-sm cursor-pointer transition-colors ml-auto ${
            post.user_saved
              ? "text-amber-500"
              : "text-gray-400 hover:text-amber-500"
          }`}
          aria-label="Save"
        >
          <Bookmark size={19} fill={post.user_saved ? "currentColor" : "none"} />
        </button>

        {post.visibility !== "public" && (
          <span className="text-xs text-gray-400">
            {post.visibility === "private" ? "Only me" : "Followers"}
          </span>
        )}
      </div>

      {/* Edit Post Modal */}
      {showEditModal && (
        <EditPostModal post={post} onClose={() => setShowEditModal(false)} />
      )}

      {/* Comment Modal */}
      {showComments && (
        <CommentModal post={post} onClose={() => setShowComments(false)} />
      )}

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
