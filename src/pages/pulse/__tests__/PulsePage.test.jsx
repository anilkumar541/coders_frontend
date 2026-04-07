import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PulsePage from "../PulsePage";

// Mock hooks
const mockUseGlobalStats = vi.fn();
const mockUsePulseCards = vi.fn();
const mockUseSentimentHistory = vi.fn();
const mockUseTrendingDiscussions = vi.fn();

vi.mock("../../../hooks/usePulse", () => ({
  useGlobalStats: (...args) => mockUseGlobalStats(...args),
  usePulseCards: (...args) => mockUsePulseCards(...args),
  useSentimentHistory: (...args) => mockUseSentimentHistory(...args),
  useTrendingDiscussions: (...args) => mockUseTrendingDiscussions(...args),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

function makeCard(slug, name) {
  return {
    slug,
    name,
    color: "#10a37f",
    pulse_label: "bullish",
    avg_compound: 0.3,
    positive_pct: 60,
    neutral_pct: 25,
    negative_pct: 15,
    mention_count: 342,
  };
}

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <PulsePage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();

  mockUseGlobalStats.mockReturnValue({
    data: {
      posts_tracked: 2847,
      avg_sentiment: 0.34,
      trending_topic_count: 14,
      top_subreddit: "r/LocalLLaMA",
    },
    isLoading: false,
  });

  mockUsePulseCards.mockReturnValue({
    data: {
      results: [
        makeCard("openai", "OpenAI"),
        makeCard("anthropic", "Anthropic"),
      ],
    },
    isLoading: false,
  });

  mockUseSentimentHistory.mockReturnValue({
    data: { results: [] },
    isLoading: false,
  });

  mockUseTrendingDiscussions.mockReturnValue({
    data: { results: [] },
    isLoading: false,
  });
});

describe("PulsePage", () => {
  it("renders page heading", () => {
    renderPage();
    expect(screen.getByText("Community Pulse")).toBeInTheDocument();
  });

  it("renders period toggle buttons", () => {
    renderPage();
    expect(screen.getByText("24h")).toBeInTheDocument();
    expect(screen.getByText("7d")).toBeInTheDocument();
    expect(screen.getByText("30d")).toBeInTheDocument();
  });

  it("renders global stat cards", () => {
    renderPage();
    expect(screen.getByText("2,847")).toBeInTheDocument();
    expect(screen.getByText("r/LocalLLaMA")).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
  });

  it("renders entity pulse cards", () => {
    renderPage();
    expect(screen.getByText("OpenAI")).toBeInTheDocument();
    expect(screen.getByText("Anthropic")).toBeInTheDocument();
  });

  it("renders trending discussions section header", () => {
    renderPage();
    expect(screen.getByText("Trending discussions")).toBeInTheDocument();
  });

  it("renders sentiment over time section header", () => {
    renderPage();
    expect(screen.getByText(/sentiment over time/i)).toBeInTheDocument();
  });

  it("shows loading skeletons when stats are loading", () => {
    mockUseGlobalStats.mockReturnValue({ data: null, isLoading: true });
    const { container } = renderPage();
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("shows empty state when no cards", () => {
    mockUsePulseCards.mockReturnValue({
      data: { results: [] },
      isLoading: false,
    });
    renderPage();
    expect(screen.getByText(/no pulse data yet/i)).toBeInTheDocument();
  });

  it("shows positive avg sentiment color", () => {
    renderPage();
    // +34% sentiment value rendered
    expect(screen.getByText("+34%")).toBeInTheDocument();
  });

  it("changes period when toggle is clicked", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByText("30d"));
    // After clicking 30d, the hooks should be called with "30d"
    await waitFor(() => {
      expect(mockUseGlobalStats).toHaveBeenCalledWith("30d");
    });
  });

  it("shows empty trending discussions message when none", () => {
    renderPage();
    expect(screen.getByText(/no trending discussions/i)).toBeInTheDocument();
  });
});
