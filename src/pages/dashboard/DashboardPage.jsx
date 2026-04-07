import { useState } from "react";
import { Link } from "react-router-dom";
import PostFeed from "../../components/posts/PostFeed";
import TrendingSidebar from "../../components/posts/TrendingSidebar";
import { useTrending, useFeed, useAIFeed, useRankedFeed } from "../../hooks/usePosts";
import AIToolVoteCard from "../../components/dashboard/AIToolVoteCard";
import { Bot, Home, Sparkles, Trophy, Hash, X, ChevronRight } from "lucide-react";

// ─── Feed tabs ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "home",   label: "Home",    icon: Home },
  { id: "ai",     label: "AI",      icon: Bot },
  { id: "foryou", label: "For You", icon: Sparkles },
];

// ─── Bottom sheet ─────────────────────────────────────────────────────────────

function BottomSheet({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col animate-slide-up">
        {/* Handle + header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100 shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
          <h2 className="text-sm font-semibold text-gray-900 mt-1">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-4 py-3 no-scrollbar">
          {children}
        </div>
      </div>
    </>
  );
}

// ─── Trending sheet content ───────────────────────────────────────────────────

function TrendingSheetContent() {
  const { data, isLoading } = useTrending();
  const trending = data?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-9 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (trending.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Hash size={28} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm">No trending hashtags yet.</p>
        <p className="text-xs mt-1">Start posting with hashtags to see them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {trending.map((tag, idx) => (
        <Link
          key={tag.name}
          to={`/hashtag/${tag.name}`}
          className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-4 text-right">{idx + 1}</span>
            <span className="text-sm font-semibold text-indigo-600">#{tag.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{tag.post_count_24h} posts today</span>
            <ChevronRight size={13} className="text-gray-300 group-hover:text-gray-500" />
          </div>
        </Link>
      ))}
    </div>
  );
}

// ─── Feed tabs row with mobile icon buttons ───────────────────────────────────

function FeedTabs({ active, onChange, onOpenVote, onOpenTrending }) {
  return (
    <div className="flex items-center border-b border-gray-100 mb-4">
      {/* Tab buttons */}
      <div className="flex flex-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-px ${
              active === id
                ? "text-gray-900 border-gray-900"
                : "text-gray-400 border-transparent hover:text-gray-600"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Mobile-only icon buttons */}
      <div className="flex items-center gap-1 lg:hidden pr-1">
        <button
          onClick={onOpenVote}
          className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors cursor-pointer"
          aria-label="AI Tool of the Week"
          title="AI Tool of the Week"
        >
          <Trophy size={17} />
        </button>
        <button
          onClick={onOpenTrending}
          className="p-2 rounded-lg text-indigo-500 hover:bg-indigo-50 transition-colors cursor-pointer"
          aria-label="Trending hashtags"
          title="Trending"
        >
          <Hash size={17} />
        </button>
      </div>
    </div>
  );
}

function ActiveFeed({ tab }) {
  const homeQuery   = useFeed();
  const aiQuery     = useAIFeed();
  const rankedQuery = useRankedFeed();

  if (tab === "home") return <PostFeed query={homeQuery} />;
  if (tab === "ai")   return <PostFeed query={aiQuery} emptyMessage="No AI posts yet. Posts tagged with #ai, #llm, or categorised as AI Update will appear here." />;
  return <PostFeed query={rankedQuery} />;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeTab,     setActiveTab]     = useState("home");
  const [voteOpen,      setVoteOpen]      = useState(false);
  const [trendingOpen,  setTrendingOpen]  = useState(false);

  return (
    <>
      <div className="max-w-6xl w-full mx-auto mt-3 px-2 sm:px-4 pb-16 flex gap-6">
        <div className="flex-1 min-w-0">
          <FeedTabs
            active={activeTab}
            onChange={setActiveTab}
            onOpenVote={() => setVoteOpen(true)}
            onOpenTrending={() => setTrendingOpen(true)}
          />
          <ActiveFeed tab={activeTab} />
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:block w-80 shrink-0 space-y-4">
          <AIToolVoteCard />
          <TrendingSidebar />
        </div>
      </div>

      {/* Mobile bottom sheets */}
      <BottomSheet
        open={voteOpen}
        onClose={() => setVoteOpen(false)}
        title="AI Tool of the Week"
      >
        <AIToolVoteCard />
      </BottomSheet>

      <BottomSheet
        open={trendingOpen}
        onClose={() => setTrendingOpen(false)}
        title="Trending Hashtags"
      >
        <TrendingSheetContent />
      </BottomSheet>
    </>
  );
}
