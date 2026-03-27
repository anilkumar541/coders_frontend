import { useNavigate } from "react-router-dom";
import {
  useNotifications,
  useMarkRead,
  useMarkAllRead,
} from "../../hooks/useNotifications";
import { NotificationSkeleton } from "../common/Skeletons";
import Avatar from "../common/Avatar";
import { timeAgo } from "../../utils/timeAgo";

// ── Destination resolver ─────────────────────────────────────────────────────
// Returns the URL to navigate to when a notification is clicked.

function getTarget(notification) {
  const { notification_type, post_id, comment_id, comment_parent_id, actor } = notification;
  if (notification_type === "follow") return `/user/${actor.id}`;
  if (!post_id) return null;

  if (comment_id) {
    const params = new URLSearchParams({ comment: comment_id });
    if (comment_parent_id) params.set("parent", comment_parent_id);
    return `/post/${post_id}?${params.toString()}`;
  }
  return `/post/${post_id}`;
}

// ── Single notification row ──────────────────────────────────────────────────

function NotificationItem({ notification, onClose, onMarkRead }) {
  const navigate = useNavigate();
  const target = getTarget(notification);

  function handleClick() {
    if (!notification.is_read) onMarkRead(notification.id);
    if (target) {
      onClose();
      navigate(target);
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
        target ? "cursor-pointer hover:bg-gray-50" : "cursor-default"
      } ${!notification.is_read ? "bg-indigo-50/50" : ""}`}
    >
      {/* Unread dot */}
      <div className="shrink-0 mt-2 w-2">
        {!notification.is_read && (
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
        )}
      </div>

      {/* Actor avatar */}
      <Avatar user={notification.actor} size="sm" className="shrink-0 mt-0.5" />

      {/* Text + excerpt + time */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 leading-snug">
          <span className="font-semibold">{notification.actor.username}</span>{" "}
          <span className="text-gray-600">{notification.text}</span>
        </p>

        {/* Post excerpt — shown for all post-related notifications */}
        {notification.post_excerpt && (
          <p className="mt-1 text-xs text-gray-500 truncate bg-gray-50 border-l-2 border-indigo-400 pl-2 pr-2 rounded-r-md">
            {notification.post_excerpt}
          </p>
        )}

        <span className="mt-1 block text-[11px] text-gray-400">
          {timeAgo(notification.created_at)}
        </span>
      </div>
    </button>
  );
}

// ── Panel ────────────────────────────────────────────────────────────────────

export default function NotificationPanel({ onClose }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const notifications = data?.pages?.flatMap((p) => p.data.results) || [];
  const unreadCount = data?.pages?.[0]?.data?.unread_count || 0;

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-[70vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="text-xs text-indigo-600 font-medium cursor-pointer hover:text-indigo-800 disabled:opacity-50"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <NotificationSkeleton key={i} />
          ))}

        {!isLoading && notifications.length === 0 && (
          <p className="text-sm text-gray-400 px-4 py-10 text-center">
            No notifications yet
          </p>
        )}

        {notifications.map((n) => (
          <NotificationItem
            key={n.id}
            notification={n}
            onClose={onClose}
            onMarkRead={(id) => markRead.mutate(id)}
          />
        ))}

        {hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full py-2.5 text-xs text-indigo-600 font-medium cursor-pointer hover:bg-gray-50"
          >
            {isFetchingNextPage ? "Loading…" : "Load more"}
          </button>
        )}
      </div>
    </div>
  );
}
