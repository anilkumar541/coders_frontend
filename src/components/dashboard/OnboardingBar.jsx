import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Circle, X, ChevronDown, ChevronUp } from "lucide-react";

const DISMISS_KEY = "onboarding_bar_dismissed";

function isDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === "true";
  } catch {
    return false;
  }
}

function dismiss() {
  try {
    localStorage.setItem(DISMISS_KEY, "true");
  } catch {
    // ignore
  }
}

function Step({ done, label, description, cta, to }) {
  return (
    <div className={`flex items-start gap-3 py-3 px-4 rounded-xl transition-colors ${done ? "opacity-60" : "bg-white"}`}>
      <div className="mt-0.5 flex-shrink-0">
        {done ? (
          <CheckCircle2 size={18} className="text-emerald-500" />
        ) : (
          <Circle size={18} className="text-gray-300" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${done ? "line-through text-gray-400" : "text-gray-900"}`}>
          {label}
        </p>
        {!done && description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      {!done && cta && to && (
        <Link
          to={to}
          className="flex-shrink-0 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          {cta}
        </Link>
      )}
    </div>
  );
}

export default function OnboardingBar({ user }) {
  const [hidden, setHidden] = useState(isDismissed);
  const [collapsed, setCollapsed] = useState(false);

  if (hidden) return null;

  const steps = [
    {
      id: "bio",
      label: "Add a bio",
      description: "Tell the community who you are.",
      cta: "Go to profile",
      to: "/profile",
      done: !!(user?.bio?.trim()),
    },
    {
      id: "post",
      label: "Create your first post",
      description: "Share something with the community.",
      cta: "Create post",
      to: "/dashboard",
      done: (user?.post_count ?? 0) > 0,
    },
    {
      id: "follow",
      label: "Follow 5 people",
      description: "Discover creators and fill your feed.",
      cta: "Explore",
      to: "/search",
      done: (user?.following_count ?? 0) >= 5,
    },
    {
      id: "react",
      label: "React to a post",
      description: "Like or dislike something you enjoyed.",
      cta: null,
      to: null,
      done: !!(user?.has_reacted),
    },
  ];

  const completed = steps.filter((s) => s.done).length;
  const total = steps.length;
  const allDone = completed === total;
  const pct = Math.round((completed / total) * 100);

  const handleDismiss = () => {
    dismiss();
    setHidden(true);
  };

  return (
    <div className="mb-5 border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              {allDone ? "You're all set! Welcome to Coduex" : "Getting started"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden max-w-[120px]">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{completed}/{total}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1.5 text-gray-400 hover:text-gray-600 cursor-pointer rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-gray-400 hover:text-gray-600 cursor-pointer rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Steps */}
      {!collapsed && (
        <div className="divide-y divide-gray-100 border-t border-gray-100">
          {steps.map((step) => (
            <Step key={step.id} {...step} />
          ))}
        </div>
      )}
    </div>
  );
}
