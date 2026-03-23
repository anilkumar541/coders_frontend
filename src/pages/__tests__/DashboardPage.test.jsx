import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import DashboardPage from "../DashboardPage";
import {
  renderWithProviders,
  resetAuthStore,
  setAuthState,
} from "../../test/helpers";

vi.mock("../../api/posts", () => ({
  postsAPI: {
    getFeed: vi.fn().mockResolvedValue({
      data: { results: [], has_more: false, next_cursor: null },
    }),
  },
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    resetAuthStore();
    vi.clearAllMocks();
    setAuthState("test-token", { id: 1, username: "testuser" });
  });

  it("shows empty feed message", async () => {
    renderWithProviders(<DashboardPage />);
    expect(
      await screen.findByText("No posts yet. Be the first to share something.")
    ).toBeInTheDocument();
  });

  it("does not render feed tabs", () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.queryByText("Latest")).not.toBeInTheDocument();
    expect(screen.queryByText("For You")).not.toBeInTheDocument();
  });
});
