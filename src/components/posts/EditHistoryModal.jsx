import { useEditHistory } from "../../hooks/usePosts";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function EditHistoryModal({ postId, currentContent, onClose }) {
  const { data, isLoading } = useEditHistory(postId, true);
  const edits = data?.data || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[70vh] flex flex-col shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Edit History</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer text-lg leading-none"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {/* Current version */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-900">Current version</span>
              <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Latest</span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
              {currentContent}
            </p>
          </div>

          {/* Previous versions */}
          {isLoading && (
            <p className="text-xs text-gray-400 text-center py-4">Loading history...</p>
          )}

          {!isLoading && edits.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">No previous versions</p>
          )}

          {edits.map((edit, index) => (
            <div key={edit.id}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-500">
                  Version {edits.length - index}
                </span>
                <span className="text-[10px] text-gray-400">
                  {timeAgo(edit.edited_at)}
                </span>
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
                {edit.old_content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
