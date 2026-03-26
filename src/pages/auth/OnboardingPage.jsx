import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCompleteOnboarding } from "../../hooks/useAuth";
import { Loader2, CheckCircle2 } from "lucide-react";

const INTERESTS = [
  { id: "llms", label: "LLMs", emoji: "🤖" },
  { id: "ai-ml", label: "AI / ML", emoji: "🧠" },
  { id: "python", label: "Python", emoji: "🐍" },
  { id: "javascript", label: "JavaScript", emoji: "⚡" },
  { id: "typescript", label: "TypeScript", emoji: "🔷" },
  { id: "rust", label: "Rust", emoji: "🦀" },
  { id: "go", label: "Go", emoji: "🐹" },
  { id: "web-dev", label: "Web Dev", emoji: "🌐" },
  { id: "devops", label: "DevOps", emoji: "⚙️" },
  { id: "open-source", label: "Open Source", emoji: "🔓" },
  { id: "research", label: "Research", emoji: "📄" },
  { id: "system-design", label: "System Design", emoji: "🏗️" },
];

export default function OnboardingPage() {
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const mutation = useCompleteOnboarding();

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    setError("");
    mutation.mutate(
      { interests: selected },
      {
        onSuccess: () => navigate("/dashboard", { replace: true }),
        onError: (err) => {
          setError(
            err?.response?.data?.interests?.[0] ||
            err?.response?.data?.detail ||
            "Something went wrong. Please try again."
          );
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-900 rounded-2xl mb-4 shadow-md">
            <span className="text-white text-2xl">💻</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to Coduex</h1>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            Select your interests so we can personalise your feed.
            <br />
            You can always update these later.
          </p>
        </div>

        {/* Interest grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mb-8">
          {INTERESTS.map(({ id, label, emoji }) => {
            const active = selected.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggle(id)}
                className={`relative flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl border text-sm font-medium transition-all cursor-pointer select-none ${
                  active
                    ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                <span className="text-xl leading-none">{emoji}</span>
                <span className="text-xs leading-tight text-center">{label}</span>
                {active && (
                  <span className="absolute top-1.5 right-1.5">
                    <CheckCircle2 size={12} className="text-white opacity-80" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected count */}
        {selected.length > 0 && (
          <p className="text-center text-xs text-gray-500 mb-4">
            {selected.length} interest{selected.length !== 1 ? "s" : ""} selected
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="text-center text-sm text-red-600 mb-4">{error}</p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {mutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Setting up your feed…
              </>
            ) : (
              "Continue"
            )}
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate({ interests: [] }, { onSuccess: () => navigate("/dashboard", { replace: true }) })}
            disabled={mutation.isPending}
            className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 cursor-pointer transition-colors disabled:opacity-50"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
