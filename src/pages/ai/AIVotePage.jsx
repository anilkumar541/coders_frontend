import { useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Crown, Zap, ChevronRight, Cpu, Info } from "lucide-react";

// ─── Static Data ─────────────────────────────────────────────────────────────

const COMPANY_BADGE = {
  OpenAI:   "bg-emerald-100 text-emerald-700",
  Anthropic:"bg-orange-100 text-orange-700",
  Google:   "bg-blue-100 text-blue-700",
  Meta:     "bg-indigo-100 text-indigo-700",
  Mistral:  "bg-violet-100 text-violet-700",
  xAI:      "bg-gray-100 text-gray-700",
  DeepSeek: "bg-cyan-100 text-cyan-700",
};

const COMPANY_BAR = {
  OpenAI:   "bg-emerald-400",
  Anthropic:"bg-orange-400",
  Google:   "bg-blue-400",
  Meta:     "bg-indigo-400",
  Mistral:  "bg-violet-400",
  xAI:      "bg-gray-400",
  DeepSeek: "bg-cyan-400",
};

const THIS_WEEK = [
  { id: 1, name: "Claude Opus 4.6",  company: "Anthropic", votes: 847, description: "Agent SDK + extended reasoning" },
  { id: 2, name: "Gemini 2.5 Pro",   company: "Google",    votes: 612, description: "1M context + native thinking" },
  { id: 3, name: "GPT-4.5",          company: "OpenAI",    votes: 589, description: "Better reasoning, lower hallucinations" },
  { id: 4, name: "DeepSeek R2",      company: "DeepSeek",  votes: 431, description: "Open-source chain-of-thought reasoning" },
  { id: 5, name: "Grok 3",           company: "xAI",       votes: 287, description: "Real-time web + code interpreter" },
  { id: 6, name: "Llama 3.3 70B",    company: "Meta",      votes: 201, description: "Open weights, Apache 2.0" },
];

const PAST_WINNERS = [
  { week: "Mar 17 – 21", name: "Claude 3.7 Sonnet", company: "Anthropic", votes: 1203 },
  { week: "Mar 10 – 14", name: "GPT-4o",            company: "OpenAI",    votes: 987  },
  { week: "Mar 3 – 7",   name: "Gemini 2.0 Flash",  company: "Google",    votes: 876  },
  { week: "Feb 24 – 28", name: "o3 mini",            company: "OpenAI",    votes: 1102 },
  { week: "Feb 17 – 21", name: "DeepSeek R1",        company: "DeepSeek",  votes: 934  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function ToolRow({ tool, rank, totalVotes, maxVotes, voted, onVote }) {
  const pct       = Math.round((tool.votes / totalVotes) * 100);
  const isLeader  = tool.votes === maxVotes;
  const isVoted   = voted === tool.id;
  const bar       = COMPANY_BAR[tool.company] ?? "bg-gray-400";

  return (
    <div
      className={`rounded-xl border transition-all ${
        isVoted
          ? "border-indigo-300 bg-indigo-50"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      <div className="px-4 py-3.5">
        {/* Row 1: rank + name + company badge + vote btn */}
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            {isLeader ? (
              <Crown size={15} className="text-amber-500 flex-shrink-0" />
            ) : (
              <span className="text-xs font-bold text-gray-300 w-4 text-center flex-shrink-0">
                {rank}
              </span>
            )}
            <span className="text-sm font-semibold text-gray-900 truncate">{tool.name}</span>
            <span className={`hidden sm:inline text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${COMPANY_BADGE[tool.company] ?? "bg-gray-100 text-gray-700"}`}>
              {tool.company}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-semibold text-gray-600 w-8 text-right">{pct}%</span>
            {!voted ? (
              <button
                onClick={() => onVote(tool.id)}
                className="text-xs px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors cursor-pointer font-medium"
              >
                Vote
              </button>
            ) : isVoted ? (
              <span className="flex items-center gap-1 text-xs text-indigo-600 font-medium">
                <Zap size={11} /> Voted
              </span>
            ) : null}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 mb-2 ml-5 sm:ml-6">{tool.description}</p>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-1.5 ml-5 sm:ml-6">
          <div
            className={`h-1.5 rounded-full transition-all duration-700 ease-out ${
              isLeader ? "bg-amber-400" : isVoted ? "bg-indigo-400" : bar
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Vote count */}
        <p className="text-xs text-gray-400 mt-1 ml-5 sm:ml-6">
          {tool.votes.toLocaleString()} votes
        </p>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AIVotePage() {
  const [tools, setTools] = useState(THIS_WEEK);
  const [voted, setVoted] = useState(null);

  const totalVotes = tools.reduce((s, t) => s + t.votes, 0);
  const maxVotes   = Math.max(...tools.map((t) => t.votes));
  const sorted     = [...tools].sort((a, b) => b.votes - a.votes);

  const handleVote = (id) => {
    if (voted) return;
    setVoted(id);
    setTools((prev) => prev.map((t) => (t.id === id ? { ...t, votes: t.votes + 1 } : t)));
  };

  return (
    <div className="max-w-5xl mx-auto mt-6 px-2 sm:px-4 pb-16">

      {/* ── Page header ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Trophy size={20} className="text-amber-500" />
          <h1 className="text-2xl font-bold text-gray-900">AI Tool of the Week</h1>
        </div>
        <p className="text-sm text-gray-500">
          Vote for the most impactful AI release this week. Winner announced every Friday.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Week of Mar 24 – 28, 2026 &middot;{" "}
          <span className="font-medium text-gray-500">{totalVotes.toLocaleString()} votes cast</span>
        </p>
      </div>

      {/* ── Two-column layout ── */}
      <div className="flex gap-6">

        {/* ── Main poll ── */}
        <div className="flex-1 min-w-0">

          {/* Poll card */}
          <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">This Week's Poll</h2>
              {voted && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">
                  <Zap size={11} /> Your vote is in!
                </span>
              )}
            </div>
            <div className="p-4 space-y-3">
              {sorted.map((tool, idx) => (
                <ToolRow
                  key={tool.id}
                  tool={tool}
                  rank={idx + 1}
                  totalVotes={totalVotes}
                  maxVotes={maxVotes}
                  voted={voted}
                  onVote={handleVote}
                />
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="flex items-start gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 mb-4">
            <Info size={13} className="flex-shrink-0 mt-0.5 text-gray-400" />
            <span>
              Votes reflect community interest, not an endorsement. One vote per session. Results
              update in real time.
            </span>
          </div>

          {/* Link to changelog */}
          <Link
            to="/ai/models"
            className="flex items-center justify-between px-5 py-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all group bg-white"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                <Cpu size={14} className="text-violet-600" />
                AI Model Changelog
              </p>
              <p className="text-xs text-gray-500 mt-0.5">See every major release this year</p>
            </div>
            <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-700 transition-colors" />
          </Link>
        </div>

        {/* ── Sidebar (desktop) ── */}
        <div className="hidden lg:flex flex-col gap-4 w-60 flex-shrink-0">

          {/* Past winners */}
          <div className="border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
              <Trophy size={14} className="text-amber-500" />
              Past Winners
            </h3>
            <div className="space-y-3">
              {PAST_WINNERS.map((w, i) => (
                <div key={i}>
                  <p className="text-xs text-gray-400 mb-0.5">{w.week}</p>
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{w.name}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${COMPANY_BADGE[w.company] ?? "bg-gray-100 text-gray-700"}`}>
                      {w.company}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{w.votes.toLocaleString()} votes</p>
                  {i < PAST_WINNERS.length - 1 && (
                    <div className="mt-3 border-t border-gray-100" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">How It Works</h3>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-start gap-2">
                <span>🗳️</span>
                <span>Polls open every <strong className="text-gray-700">Monday</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <span>📊</span>
                <span>Results update in real time</span>
              </div>
              <div className="flex items-start gap-2">
                <span>🏆</span>
                <span>Winner announced every <strong className="text-gray-700">Friday</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <span>📌</span>
                <span>Winner pinned to AI feed all weekend</span>
              </div>
            </div>
          </div>

          {/* Leaderboard note */}
          <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
            <p className="text-xs text-amber-700 font-semibold mb-1">🥇 Current Leader</p>
            <p className="text-sm font-bold text-amber-900">
              {sorted[0]?.name}
            </p>
            <p className={`text-xs mt-0.5 font-medium ${COMPANY_BADGE[sorted[0]?.company] ?? ""} inline-block px-1.5 py-0.5 rounded-full`}>
              {sorted[0]?.company}
            </p>
            <p className="text-xs text-amber-600 mt-2">
              {Math.round((sorted[0]?.votes / totalVotes) * 100)}% of votes
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
