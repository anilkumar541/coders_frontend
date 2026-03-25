import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import PostFeed from "../PostFeed";

vi.mock("../../../store/authStore", () => ({
  useAuthStore: vi.fn((selector) => {
    const state = {
      user: { id: 1, username: "testuser" },
      accessToken: "mock-token",
    };
    return selector(state);
  }),
}));

function renderWithProviders(ui) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </BrowserRouter>
  );
}

const makeQuery = (overrides = {}) => ({
  data: { pages: [{ data: { results: [], has_more: false, next_cursor: null } }] },
  isLoading: false,
  isError: false,
  hasNextPage: false,
  isFetchingNextPage: false,
  fetchNextPage: vi.fn(),
  refetch: vi.fn(),
  ...overrides,
});

describe("PostFeed", () => {
  it("shows skeleton loaders when loading", () => {
    const query = makeQuery({ isLoading: true, data: undefined });
    const { container } = renderWithProviders(<PostFeed query={query} />);
    const pulsingElements = container.querySelectorAll(".animate-pulse");
    expect(pulsingElements.length).toBeGreaterThan(0);
  });

  it("shows error state with retry button", () => {
    const query = makeQuery({ isError: true, data: undefined });
    renderWithProviders(<PostFeed query={query} />);
    expect(screen.getByText("Failed to load posts.")).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("shows empty state when no posts", () => {
    const query = makeQuery();
    renderWithProviders(<PostFeed query={query} />);
    expect(
      screen.getByText("No posts yet. Be the first to share something.")
    ).toBeInTheDocument();
  });

  it("renders posts when data exists", () => {
    const mockPosts = [
      {
        id: 1,
        author: { id: 1, username: "testuser", profile_picture: null },
        content: "First post",
        post_type: "post",
        visibility: "public",
        status: "active",
        is_edited: false,
        like_count: 0,
        comment_count: 0,
        view_count: 0,
        repost_count: 0,
        save_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        edit_count: 0,
      },
      {
        id: 2,
        author: { id: 2, username: "other", profile_picture: null },
        content: "Second post",
        post_type: "post",
        visibility: "public",
        status: "active",
        is_edited: false,
        like_count: 3,
        comment_count: 1,
        view_count: 50,
        repost_count: 0,
        save_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        edit_count: 0,
      },
    ];

    const query = makeQuery({
      data: {
        pages: [{ data: { results: mockPosts, has_more: false, next_cursor: null } }],
      },
    });

    renderWithProviders(<PostFeed query={query} />);
    expect(screen.getByText("First post")).toBeInTheDocument();
    expect(screen.getByText("Second post")).toBeInTheDocument();
  });

  it("shows loading skeletons when fetching next page", () => {
    const mockPosts = [
      {
        id: 1,
        author: { id: 1, username: "testuser", profile_picture: null },
        content: "A post",
        post_type: "post",
        visibility: "public",
        status: "active",
        is_edited: false,
        like_count: 0,
        comment_count: 0,
        view_count: 0,
        repost_count: 0,
        save_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        edit_count: 0,
      },
    ];

    const query = makeQuery({
      data: {
        pages: [{ data: { results: mockPosts, has_more: true, next_cursor: "abc" } }],
      },
      isFetchingNextPage: true,
      hasNextPage: true,
    });

    const { container } = renderWithProviders(<PostFeed query={query} />);
    expect(screen.getByText("A post")).toBeInTheDocument();
    const pulsingElements = container.querySelectorAll(".animate-pulse");
    expect(pulsingElements.length).toBeGreaterThan(0);
  });
});
