import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TrendingSidebar from "../TrendingSidebar";

vi.mock("../../../store/authStore", () => ({
  useAuthStore: vi.fn((selector) => {
    const state = {
      user: { id: 1, username: "testuser" },
      accessToken: "mock-token",
    };
    return selector(state);
  }),
}));

const mockGetTrending = vi.fn();

vi.mock("../../../api/posts", () => ({
  postsAPI: {
    getTrending: (...args) => mockGetTrending(...args),
  },
}));

function renderWithProviders(ui) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe("TrendingSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders trending hashtags", async () => {
    mockGetTrending.mockResolvedValue({
      data: [
        { name: "react", post_count_24h: 150, score: 42.5 },
        { name: "django", post_count_24h: 80, score: 30.1 },
      ],
    });
    renderWithProviders(<TrendingSidebar />);
    await waitFor(() => {
      expect(screen.getByText("Trending")).toBeInTheDocument();
      expect(screen.getByText("#react")).toBeInTheDocument();
      expect(screen.getByText("#django")).toBeInTheDocument();
    });
  });

  it("shows post count", async () => {
    mockGetTrending.mockResolvedValue({
      data: [{ name: "python", post_count_24h: 50, score: 20 }],
    });
    renderWithProviders(<TrendingSidebar />);
    await waitFor(() => {
      expect(screen.getByText("50 posts today")).toBeInTheDocument();
    });
  });

  it("renders nothing when no trending", async () => {
    mockGetTrending.mockResolvedValue({ data: [] });
    const { container } = renderWithProviders(<TrendingSidebar />);
    await waitFor(() => {
      expect(container.innerHTML).toBe("");
    });
  });
});
