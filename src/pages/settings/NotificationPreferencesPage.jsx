import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "../../hooks/useNotifications";

const PREF_LABELS = {
  likes: "Likes on your posts",
  comments: "Comments on your posts",
  replies: "Replies to your comments",
  mentions: "Mentions (@you)",
  reposts: "Reposts of your posts",
  follows: "New followers",
};

export default function NotificationPreferencesPage() {
  const { data, isLoading } = useNotificationPreferences();
  const updateMutation = useUpdateNotificationPreferences();

  const prefs = data?.data || {};

  const handleToggle = (key) => {
    updateMutation.mutate({ [key]: !prefs[key] });
  };

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto py-8 px-2 sm:px-4">
        <p className="text-sm text-gray-400">Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-2 sm:px-4">
      <h1 className="text-lg font-semibold text-gray-900 mb-6">
        Notification Preferences
      </h1>
      <div className="space-y-1">
        {Object.entries(PREF_LABELS).map(([key, label]) => (
          <div
            key={key}
            className="flex items-center justify-between py-3 px-1"
          >
            <span className="text-sm text-gray-700">{label}</span>
            <button
              onClick={() => handleToggle(key)}
              disabled={updateMutation.isPending}
              className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
                prefs[key] ? "bg-indigo-600" : "bg-gray-300"
              }`}
              role="switch"
              aria-checked={prefs[key]}
              aria-label={label}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  prefs[key] ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
