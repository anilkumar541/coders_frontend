import { useState } from "react";
import { useReport } from "../../hooks/usePosts";

const REASONS = [
  { value: "spam", label: "Spam" },
  { value: "abuse", label: "Abuse / Harassment" },
  { value: "nudity", label: "Nudity / Sexual Content" },
  { value: "misinformation", label: "Misinformation" },
  { value: "violence", label: "Violence" },
  { value: "hate_speech", label: "Hate Speech" },
  { value: "other", label: "Other" },
];

export default function ReportModal({ onClose, postId = null, commentId = null, userId = null }) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const reportMutation = useReport();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason) return;

    const data = { reason, description };
    if (postId) data.reported_post = postId;
    if (commentId) data.reported_comment = commentId;
    if (userId) data.reported_user = userId;

    reportMutation.mutate(data, {
      onSuccess: () => setSubmitted(true),
    });
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
          <p className="text-sm text-gray-700 text-center">
            Thank you for your report. We will review it shortly.
          </p>
          <button
            onClick={onClose}
            className="mt-4 w-full py-2 text-sm font-medium text-white bg-gray-900 rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-semibold text-gray-900 mb-4">Report</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-2 mb-4">
            {REASONS.map((r) => (
              <label
                key={r.value}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm ${
                  reason === r.value ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={() => setReason(r.value)}
                  className="accent-indigo-600"
                />
                {r.label}
              </label>
            ))}
          </div>

          {reason && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Additional details <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Help us understand the issue better..."
                maxLength={500}
                rows={3}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all resize-none placeholder-gray-400"
              />
              <p className="text-right text-[11px] text-gray-300 mt-0.5">{description.length}/500</p>
            </div>
          )}

          {reportMutation.isError && (
            <p className="text-xs text-red-500 mb-2">
              {reportMutation.error?.response?.data?.detail || "Failed to submit report."}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!reason || reportMutation.isPending}
              className="flex-1 py-2 text-sm font-medium text-white bg-red-600 rounded-lg disabled:opacity-50 cursor-pointer"
            >
              {reportMutation.isPending ? "Submitting..." : "Submit Report"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
