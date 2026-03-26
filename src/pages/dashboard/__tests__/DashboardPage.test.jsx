import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardPage from "../DashboardPage";
import {
  renderWithProviders,
  resetAuthStore,
  setAuthState,
} from "../../../test/helpers";

vi.mock("../../../api/posts", () => ({
  postsAPI: {
    getFeed: vi.fn().mockResolvedValue({
      data: { results: [], has_more: false, next_cursor: null },
    }),
    getAIFeed: vi.fn().mockResolvedValue({
      data: { results: [], has_more: false, next_cursor: null },
    }),
    getRankedFeed: vi.fn().mockResolvedValue({
      data: { results: [], has_more: false, page: 1 },
    }),
    getMe: vi.fn().mockResolvedValue({
      data: {
        id: 1,
        username: "testuser",
        onboarding_completed: true,
        post_count: 0,
        follower_count: 0,
        following_count: 0,
        has_reacted: false,
        bio: "",
      },
    }),
  },
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    resetAuthStore();
    vi.clearAllMocks();
    setAuthState("test-token", {
      id: 1,
      username: "testuser",
      onboarding_completed: true,
    });
  });

  it("renders feed tabs: Home, AI, For You", () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByRole("button", { name: /Home/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /AI/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /For You/i })).toBeInTheDocument();
  });

  it("shows empty feed message on Home tab by default", async () => {
    renderWithProviders(<DashboardPage />);
    expect(
      await screen.findByText("No posts yet. Be the first to share something.")
    ).toBeInTheDocument();
  });

  it("switches to AI feed tab on click", async () => {
    renderWithProviders(<DashboardPage />);
    await userEvent.click(screen.getByRole("button", { name: /AI/i }));
    expect(
      await screen.findByText(/No AI posts yet/)
    ).toBeInTheDocument();
  });
});
