import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Cpu,
  Calendar,
  ArrowUpRight,
  Hash,
  Trophy,
  ChevronRight,
} from "lucide-react";

// ─── Static Data ─────────────────────────────────────────────────────────────

const COMPANY_META = {
  OpenAI:   { dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700", ring: "ring-emerald-200" },
  Anthropic:{ dot: "bg-orange-500",  badge: "bg-orange-100 text-orange-700",   ring: "ring-orange-200" },
  Google:   { dot: "bg-blue-500",    badge: "bg-blue-100 text-blue-700",       ring: "ring-blue-200" },
  Meta:     { dot: "bg-indigo-500",  badge: "bg-indigo-100 text-indigo-700",   ring: "ring-indigo-200" },
  Mistral:  { dot: "bg-violet-500",  badge: "bg-violet-100 text-violet-700",   ring: "ring-violet-200" },
  xAI:      { dot: "bg-gray-600",    badge: "bg-gray-100 text-gray-700",       ring: "ring-gray-200" },
  DeepSeek: { dot: "bg-cyan-500",    badge: "bg-cyan-100 text-cyan-700",       ring: "ring-cyan-200" },
};

const TYPE_BADGE = {
  "Major Release": "bg-purple-100 text-purple-700",
  "Update":        "bg-blue-100 text-blue-700",
  "Open Source":   "bg-emerald-100 text-emerald-700",
  "API Update":    "bg-amber-100 text-amber-700",
};

const MODELS = [
  // ── March 2026 ──────────────────────────────────────────────────────────
  {
    id: 1,
    name: "Claude Opus 4.6",
    company: "Anthropic",
    date: "2026-03-15",
    type: "Major Release",
    headline: "Most capable Claude yet — extended reasoning with native Agent SDK support and blazing fast mode.",
    highlights: ["200K context", "Agent SDK", "Fast mode", "Multimodal"],
    isNew: true,
    hashtag: "claude",
  },
  {
    id: 2,
    name: "Gemini 2.5 Pro",
    company: "Google",
    date: "2026-03-05",
    type: "Major Release",
    headline: "Google's top reasoning model with 1M-token context window and native code execution.",
    highlights: ["1M context", "Code execution", "Thinking mode", "Multimodal"],
    isNew: true,
    hashtag: "gemini",
  },
  // ── February 2026 ────────────────────────────────────────────────────────
  {
    id: 3,
    name: "GPT-4.5",
    company: "OpenAI",
    date: "2026-02-27",
    type: "Major Release",
    headline: "Improved emotional intelligence and world knowledge. Lowest hallucination rate in GPT series.",
    highlights: ["128K context", "Lower hallucinations", "Better reasoning", "API v3"],
    hashtag: "gpt",
  },
  {
    id: 4,
    name: "Llama 3.3 70B",
    company: "Meta",
    date: "2026-02-10",
    type: "Open Source",
    headline: "Smaller footprint, 405B-level performance. Fully open-weights under Apache 2.0.",
    highlights: ["Open weights", "Apache 2.0", "Instruction tuned", "8× faster"],
    hashtag: "llama",
  },
  {
    id: 5,
    name: "Mistral Large 2501",
    company: "Mistral",
    date: "2026-02-01",
    type: "Update",
    headline: "January update brings enhanced multilingual support across 22 languages and upgraded tool use.",
    highlights: ["128K context", "Function calling v2", "22 languages", "Tool use"],
    hashtag: "mistral",
  },
  // ── January 2026 ────────────────────────────────────────────────────────
  {
    id: 6,
    name: "DeepSeek R2",
    company: "DeepSeek",
    date: "2026-01-20",
    type: "Open Source",
    headline: "Chinese lab's powerful reasoning model, open-sourced under MIT. Math and code performance rivals GPT-4.",
    highlights: ["Open weights", "Chain-of-thought", "MIT license", "Math & code"],
    hashtag: "deepseek",
  },
  {
    id: 7,
    name: "Grok 3",
    company: "xAI",
    date: "2026-01-08",
    type: "Major Release",
    headline: "xAI's most capable model with real-time web access, an image generator, and code interpreter.",
    highlights: ["Real-time web", "Code interpreter", "Aurora image gen", "API access"],
    hashtag: "grok",
  },
  // ── December 2025 ────────────────────────────────────────────────────────
  {
    id: 8,
    name: "Claude 3.7 Sonnet",
    company: "Anthropic",
    date: "2025-12-18",
    type: "Major Release",
    headline: "Hybrid reasoning with extended thinking — best-in-class for software engineering and agentic tasks.",
    highlights: ["Extended thinking", "200K context", "Computer use", "Coding"],
    hashtag: "claude",
  },
  {
    id: 9,
    name: "o3 mini",
    company: "OpenAI",
    date: "2025-12-05",
    type: "Major Release",
    headline: "Efficient reasoning model with three configurable thinking levels. Fastest o-series model for STEM.",
    highlights: ["3 thinking levels", "STEM focused", "Faster than o1", "API access"],
    hashtag: "gpt",
  },
  // ── November 2025 ────────────────────────────────────────────────────────
  {
    id: 10,
    name: "Gemini 2.0 Flash",
    company: "Google",
    date: "2025-11-12",
    type: "Major Release",
    headline: "Fastest Gemini model to date — native tool use, agentic mode, audio and video understanding.",
    highlights: ["Agentic mode", "Native tool use", "1M context", "Audio/video"],
    hashtag: "gemini",
  },
  // ── October 2025 ─────────────────────────────────────────────────────────
  {
    id: 11,
    name: "Llama 3.2 Vision",
    company: "Meta",
    date: "2025-10-20",
    type: "Open Source",
    headline: "First multimodal Llama release — vision models from 1B to 90B, optimised for on-device inference.",
    highlights: ["Vision models", "Edge optimised", "1B–90B", "Open weights"],
    hashtag: "llama",
  },
  {
    id: 12,
    name: "Mixtral 8×22B Instruct",
    company: "Mistral",
    date: "2025-10-05",
    type: "Update",
    headline: "Improved instruction following and function calling for the mixture-of-experts architecture.",
    highlights: ["MoE architecture", "64K context", "Function calling", "Apache 2.0"],
    hashtag: "mistral",
  },
];

const COMPANIES = ["All", ...Object.keys(COMPANY_META)];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function groupByMonth(models) {
  const order = [];
  const map = {};
  models.forEach((m) => {
    const key = new Date(m.date).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    if (!map[key]) { map[key] = []; order.push(key); }
    map[key].push(m);
  });
  return order.map((k) => [k, map[k]]);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ModelCard({ model }) {
  const c = COMPANY_META[model.company] ?? COMPANY_META.xAI;
  return (
    <div className="flex gap-4 group">
      {/* Timeline dot */}
      <div className="flex flex-col items-center">
        <div
          className={`w-6 h-6 rounded-full ${c.dot} flex-shrink-0 z-10 ring-2 ring-white shadow-sm mt-3`}
        />
        <div className="w-px flex-1 bg-gray-100 mt-1" />
      </div>

      {/* Card */}
      <div className="flex-1 mb-4 border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all bg-white">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.badge}`}>
              {model.company}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_BADGE[model.type] ?? "bg-gray-100 text-gray-600"}`}>
              {model.type}
            </span>
            {model.isNew && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 animate-pulse">
                NEW
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {new Date(model.date).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric",
            })}
          </span>
        </div>

        {/* Name & headline */}
        <h3 className="text-base font-semibold text-gray-900 mb-1 leading-snug">{model.name}</h3>
        <p className="text-sm text-gray-500 mb-3 leading-relaxed">{model.headline}</p>

        {/* Highlight chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {model.highlights.map((h) => (
            <span
              key={h}
              className="text-xs px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-md text-gray-600"
            >
              {h}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <Link
            to={`/hashtag/${model.hashtag}`}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <Hash size={11} />
            {model.hashtag}
          </Link>
          <Link
            to={`/hashtag/${model.hashtag}`}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 font-medium transition-colors group-hover:text-gray-600"
          >
            Discuss <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatsSidebar({ filtered }) {
  const thisMonth = filtered.filter((m) => m.isNew).length;
  const companies = [...new Set(filtered.map((m) => m.company))].length;
  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">By the Numbers</h3>
      <div className="space-y-2.5">
        {[
          { label: "Models tracked", value: MODELS.length },
          { label: "Companies", value: Object.keys(COMPANY_META).length },
          { label: "New this month", value: MODELS.filter((m) => m.isNew).length },
          { label: "In current view", value: filtered.length },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{label}</span>
            <span className="font-semibold text-gray-900">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompaniesSidebar({ selected, onSelect }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Filter by Company</h3>
      <div className="space-y-1">
        {Object.entries(COMPANY_META).map(([company, c]) => {
          const count = MODELS.filter((m) => m.company === company).length;
          return (
            <button
              key={company}
              onClick={() => onSelect(selected === company ? "All" : company)}
              className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors text-sm cursor-pointer ${
                selected === company ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                <span className="text-gray-700">{company}</span>
              </div>
              <span className="text-xs text-gray-400 font-medium">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AIModelsPage() {
  const [selected, setSelected] = useState("All");

  const filtered =
    selected === "All" ? MODELS : MODELS.filter((m) => m.company === selected);
  const grouped = groupByMonth(filtered);

  return (
    <div className="max-w-5xl mx-auto mt-6 px-2 sm:px-4 pb-16">

      {/* ── Page header ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Cpu size={20} className="text-violet-600" />
          <h1 className="text-2xl font-bold text-gray-900">AI Model Changelog</h1>
        </div>
        <p className="text-sm text-gray-500">
          Every major AI model release, tracked and discussed by the Coduex community.
        </p>
      </div>

      {/* ── Company filter pills ── */}
      <div className="flex flex-wrap gap-2 mb-8">
        {COMPANIES.map((c) => (
          <button
            key={c}
            onClick={() => setSelected(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              selected === c
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* ── Two-column layout ── */}
      <div className="flex gap-6">

        {/* ── Timeline ── */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Cpu size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No models from {selected} yet.</p>
            </div>
          ) : (
            grouped.map(([month, models]) => (
              <div key={month} className="mb-2">
                {/* Month label */}
                <div className="flex items-center gap-3 mb-3 sticky top-0 bg-white/80 backdrop-blur-sm py-2 z-10">
                  <Calendar size={13} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    {month}
                  </span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* Cards */}
                {models.map((m) => <ModelCard key={m.id} model={m} />)}
              </div>
            ))
          )}
        </div>

        {/* ── Sidebar (desktop only) ── */}
        <div className="hidden lg:flex flex-col gap-4 w-60 flex-shrink-0">
          <StatsSidebar filtered={filtered} />
          <CompaniesSidebar selected={selected} onSelect={setSelected} />

          {/* Link to vote page */}
          <Link
            to="/ai/vote"
            className="flex items-center justify-between px-4 py-3 border border-amber-200 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors group"
          >
            <div>
              <p className="text-sm font-semibold text-amber-800 flex items-center gap-1.5">
                <Trophy size={13} className="text-amber-500" />
                AI Tool of the Week
              </p>
              <p className="text-xs text-amber-600 mt-0.5">Vote for the top release</p>
            </div>
            <ChevronRight size={15} className="text-amber-400 group-hover:text-amber-600" />
          </Link>
        </div>

      </div>
    </div>
  );
}
