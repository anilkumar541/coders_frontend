import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EntityDetailPage from "../EntityDetailPage";

const mockUseEntityDetail = vi.fn();
const mockUseTrendingDiscussions = vi.fn();

vi.mock("../../../hooks/usePulse", () => ({
  useEntityDetail: (...args) => mockUseEntityDetail(...args),
  useTrendingDiscussions: (...args) => mockUseTrendingDiscussions(...args),
}));

function makeEntityData(overrides = {}) {
  return {
    id: "uuid-openai",
    slug: "openai",
    name: "OpenAI",
    color: "#10a37f",
    pulse_label: "bearish",
    avg_compound: -0.15,
    positive_pct: 25,
    neutral_pct: 30,
    negative_pct: 45,
    mention_count: 342,
    subreddit_count: 6,
    top_thread_score: 1200,
    top_thread_title: "OpenAI removed free tier",
    top_thread_url: "https://reddit.com/r/ChatGPT/abc",
    comment_volume: 2341,
    top_subreddits: [
      { name: "r/ChatGPT", count: 124 },
      { name: "r/OpenAI", count: 89 },
    ],
    trending_keywords: [
      { word: "api pricing", count: 8 },
      { word: "free tier", count: 6 },
    ],
    history: [],
    ...overrides,
  };
}

function renderPage(slug = "openai") {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/pulse/${slug}`]}>
        <Routes>
          <Route path="/pulse/:entity" element={<EntityDetailPage />} />
          <Route path="/pulse" element={<div>Pulse Home</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();

  mockUseEntityDetail.mockReturnValue({
    data: makeEntityData(),
    isLoading: false,
    isError: false,
  });

  mockUseTrendingDiscussions.mockReturnValue({
    data: { results: [] },
    isLoading: false,
  });
});

describe("EntityDetailPage", () => {
  it("renders entity name", () => {
    renderPage();
    expect(screen.getByText("OpenAI")).toBeInTheDocument();
  });

  it("renders bearish label badge", () => {
    renderPage();
    expect(screen.getByText("Bearish")).toBeInTheDocument();
  });

  it("renders bullish label badge for bullish entity", () => {
    mockUseEntityDetail.mockReturnValue({
      data: makeEntityData({ pulse_label: "bullish", avg_compound: 0.15 }),
      isLoading: false,
      isError: false,
    });
    renderPage();
    expect(screen.getByText("Bullish")).toBeInTheDocument();
  });

  it("renders KPI stat cards", () => {
    renderPage();
    expect(screen.getByText("342")).toBeInTheDocument(); // mention count
    expect(screen.getByText("1.2k")).toBeInTheDocument(); // top thread score
    expect(screen.getByText("2.3k")).toBeInTheDocument(); // comment volume
  });

  it("renders avg sentiment value", () => {
    renderPage();
    expect(screen.getByText("-15%")).toBeInTheDocument();
  });

  it("renders top subreddits", () => {
    renderPage();
    expect(screen.getByText("r/ChatGPT")).toBeInTheDocument();
    expect(screen.getByText("r/OpenAI")).toBeInTheDocument();
  });

  it("renders trending keywords", () => {
    renderPage();
    expect(screen.getByText("api pricing")).toBeInTheDocument();
    expect(screen.getByText("free tier")).toBeInTheDocument();
  });

  it("renders back to pulse link", () => {
    renderPage();
    expect(screen.getByText(/back to pulse/i)).toBeInTheDocument();
  });

  it("back link navigates to /pulse", async () => {
    const user = userEvent.setup();
    renderPage();
    const backLink = screen.getByText(/back to pulse/i);
    await user.click(backLink);
    await waitFor(() => {
      expect(screen.getByText("Pulse Home")).toBeInTheDocument();
    });
  });

  it("renders period toggle", () => {
    renderPage();
    expect(screen.getByText("24h")).toBeInTheDocument();
    expect(screen.getByText("7d")).toBeInTheDocument();
    expect(screen.getByText("30d")).toBeInTheDocument();
  });

  it("shows loading skeleton when loading", () => {
    mockUseEntityDetail.mockReturnValue({ data: null, isLoading: true, isError: false });
    const { container } = renderPage();
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("shows error message when entity not found", () => {
    mockUseEntityDetail.mockReturnValue({ data: null, isLoading: false, isError: true });
    renderPage();
    expect(screen.getByText(/entity not found/i)).toBeInTheDocument();
  });

  it("renders sentiment breakdown section", () => {
    renderPage();
    expect(screen.getByText(/sentiment breakdown/i)).toBeInTheDocument();
  });

  it("renders top discussions section", () => {
    renderPage();
    expect(screen.getByText(/top discussions/i)).toBeInTheDocument();
  });

  it("calls useEntityDetail with correct slug and period", () => {
    renderPage("anthropic");
    expect(mockUseEntityDetail).toHaveBeenCalledWith("anthropic", "7d");
  });

  it("changes period on toggle click", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByText("30d"));
    await waitFor(() => {
      expect(mockUseEntityDetail).toHaveBeenCalledWith("openai", "30d");
    });
  });
});
