import {
  useNotifications,
  useMarkRead,
  useMarkAllRead,
} from "../../hooks/useNotifications";
import { NotificationSkeleton } from "../common/Skeletons";

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

function NotificationItem({ notification, onMarkRead }) {
  const profilePicture = notification.actor.profile_picture
    ? notification.actor.profile_picture.startsWith("http")
      ? notification.actor.profile_picture
      : `${API_URL}${notification.actor.profile_picture}`
    : null;

  const initials = notification.actor.username
    ? notification.actor.username.slice(0, 2).toUpperCase()
    : "?";

  return (
    <button
      onClick={() => !notification.is_read && onMarkRead(notification.id)}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 cursor-pointer ${
        !notification.is_read ? "bg-indigo-50/50" : ""
      }`}
    >
      {/* Unread dot */}
      <div className="flex-shrink-0 mt-2 w-2">
        {!notification.is_read && (
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
        )}
      </div>

      {/* Avatar */}
      {profilePicture ? (
        <img
          src={profilePicture}
          alt={notification.actor.username}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-medium flex-shrink-0">
          {initials}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">
          <span className="font-medium">{notification.actor.username}</span>{" "}
          <span className="text-gray-600">{notification.text}</span>
        </p>
        <span className="text-[11px] text-gray-400">
          {timeAgo(notification.created_at)}
        </span>
      </div>
    </button>
  );
}

export default function NotificationPanel({ onClose }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const notifications =
    data?.pages?.flatMap((p) => p.data.results) || [];
  const unreadCount = data?.pages?.[0]?.data?.unread_count || 0;

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-[70vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="text-xs text-indigo-600 font-medium cursor-pointer"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1">
        {isLoading && (
          <div>
            {Array.from({ length: 4 }).map((_, i) => (
              <NotificationSkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <p className="text-sm text-gray-400 px-4 py-8 text-center">
            No notifications yet
          </p>
        )}

        {notifications.map((n) => (
          <NotificationItem
            key={n.id}
            notification={n}
            onMarkRead={(id) => markRead.mutate(id)}
          />
        ))}

        {hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full py-2 text-xs text-indigo-600 font-medium cursor-pointer hover:bg-gray-50"
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </button>
        )}
      </div>
    </div>
  );
}
