import { useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Crown, ChevronRight, Zap } from "lucide-react";

const COMPANY_BAR = {
  OpenAI:   "bg-emerald-400",
  Anthropic:"bg-orange-400",
  Google:   "bg-blue-400",
  Meta:     "bg-indigo-400",
  Mistral:  "bg-violet-400",
  xAI:      "bg-gray-400",
  DeepSeek: "bg-cyan-400",
};

const TOOLS = [
  { id: 1, name: "Claude Opus 4.6", company: "Anthropic", votes: 847 },
  { id: 2, name: "Gemini 2.5 Pro",  company: "Google",    votes: 612 },
  { id: 3, name: "GPT-4.5",         company: "OpenAI",    votes: 589 },
  { id: 4, name: "DeepSeek R2",     company: "DeepSeek",  votes: 431 },
  { id: 5, name: "Grok 3",          company: "xAI",       votes: 287 },
  { id: 6, name: "Llama 3.3 70B",   company: "Meta",      votes: 201 },
];

export default function AIToolVoteCard() {
  const [tools, setTools] = useState(TOOLS);
  const [voted, setVoted] = useState(null);

  const totalVotes = tools.reduce((s, t) => s + t.votes, 0);
  const maxVotes   = Math.max(...tools.map((t) => t.votes));

  // Show top 5 in the compact widget, sorted by votes
  const sorted = [...tools].sort((a, b) => b.votes - a.votes);
  const top5   = sorted.slice(0, 5);

  const handleVote = (id) => {
    if (voted) return;
    setVoted(id);
    setTools((prev) => prev.map((t) => (t.id === id ? { ...t, votes: t.votes + 1 } : t)));
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
          <Trophy size={13} className="text-amber-500" />
          AI Tool of the Week
        </h3>
        <Link
          to="/ai/vote"
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-0.5"
        >
          Vote <ChevronRight size={11} />
        </Link>
      </div>

      <p className="text-xs text-gray-400 mb-3">
        Mar 24–28 &middot; {totalVotes.toLocaleString()} votes
      </p>

      {/* Top 3 tools */}
      <div className="space-y-2.5">
        {top5.map((tool) => {
          const pct      = Math.round((tool.votes / totalVotes) * 100);
          const isLeader = tool.votes === maxVotes;
          const isVoted  = voted === tool.id;
          const bar      = COMPANY_BAR[tool.company] ?? "bg-gray-400";

          return (
            <div key={tool.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  {isLeader
                    ? <Crown size={11} className="text-amber-500 flex-shrink-0" />
                    : <div className="w-[11px]" />
                  }
                  <span className="text-xs font-medium text-gray-800 truncate">{tool.name}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  <span className="text-xs text-gray-500">{pct}%</span>
                  {!voted ? (
                    <button
                      onClick={() => handleVote(tool.id)}
                      className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer font-medium"
                    >
                      +1
                    </button>
                  ) : isVoted ? (
                    <Zap size={11} className="text-indigo-500" />
                  ) : null}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-1">
                <div
                  className={`h-1 rounded-full transition-all duration-500 ${
                    isLeader ? "bg-amber-400" : isVoted ? "bg-indigo-400" : bar
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer link */}
      <Link
        to="/ai/vote"
        className="mt-3 pt-3 flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-gray-600 border-t border-gray-100 transition-colors"
      >
        See all {TOOLS.length} tools <ChevronRight size={11} />
      </Link>
    </div>
  );
}
