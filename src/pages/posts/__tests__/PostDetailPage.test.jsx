import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PostDetailPage from "../PostDetailPage";

// ── Mock dependencies ────────────────────────────────────────────────────────
vi.mock("../../../hooks/usePosts", () => ({
  usePost: vi.fn(),
}));

vi.mock("../../../components/posts/PostCard", () => ({
  default: ({ post, targetCommentId, targetParentId }) => (
    <div
      data-testid="post-card"
      data-post-id={post?.id}
      data-target-comment={targetCommentId}
      data-target-parent={targetParentId}
    />
  ),
}));

vi.mock("../../../components/posts/TrendingSidebar", () => ({
  default: () => <div data-testid="trending-sidebar" />,
}));

vi.mock("../../../components/dashboard/AIToolVoteCard", () => ({
  default: () => <div data-testid="ai-vote-card" />,
}));

import { usePost } from "../../../hooks/usePosts";

// ── Helpers ──────────────────────────────────────────────────────────────────
function renderPage(path = "/post/post-123", search = "") {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <MemoryRouter initialEntries={[`${path}${search}`]}>
      <QueryClientProvider client={qc}>
        <Routes>
          <Route path="/post/:id" element={<PostDetailPage />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

const mockPost = {
  id: "post-123",
  content: "Hello world",
  author: { id: 1, username: "testuser", profile_picture: null },
  like_count: 0,
  dislike_count: 0,
  comment_count: 0,
  view_count: 0,
  media: [],
  user_reaction: null,
  user_saved: false,
  visibility: "public",
  is_edited: false,
  created_at: new Date().toISOString(),
};

// ── Tests ────────────────────────────────────────────────────────────────────
describe("PostDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading skeleton while fetching", () => {
    usePost.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    const { container } = renderPage();
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows error message when post not found", () => {
    usePost.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderPage();
    expect(screen.getByText("Post not found or has been deleted.")).toBeInTheDocument();
  });

  it("shows 'Go to home' link on error", () => {
    usePost.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderPage();
    const link = screen.getByText("Go to home");
    expect(link.closest("a")).toHaveAttribute("href", "/dashboard");
  });

  it("renders PostCard when post is loaded", () => {
    usePost.mockReturnValue({
      data: { data: mockPost },
      isLoading: false,
      isError: false,
    });
    renderPage();
    expect(screen.getByTestId("post-card")).toBeInTheDocument();
  });

  it("passes post to PostCard", () => {
    usePost.mockReturnValue({
      data: { data: mockPost },
      isLoading: false,
      isError: false,
    });
    renderPage();
    expect(screen.getByTestId("post-card")).toHaveAttribute("data-post-id", "post-123");
  });

  it("does NOT render a Back button", () => {
    usePost.mockReturnValue({
      data: { data: mockPost },
      isLoading: false,
      isError: false,
    });
    renderPage();
    expect(screen.queryByText("Back")).not.toBeInTheDocument();
  });

  it("passes targetCommentId from ?comment= search param to PostCard", () => {
    usePost.mockReturnValue({
      data: { data: mockPost },
      isLoading: false,
      isError: false,
    });
    renderPage("/post/post-123", "?comment=cmt-99");
    expect(screen.getByTestId("post-card")).toHaveAttribute(
      "data-target-comment",
      "cmt-99"
    );
  });

  it("passes targetParentId from ?parent= search param to PostCard", () => {
    usePost.mockReturnValue({
      data: { data: mockPost },
      isLoading: false,
      isError: false,
    });
    renderPage("/post/post-123", "?comment=reply-1&parent=parent-5");
    const card = screen.getByTestId("post-card");
    expect(card).toHaveAttribute("data-target-comment", "reply-1");
    expect(card).toHaveAttribute("data-target-parent", "parent-5");
  });

  it("does not pass targetCommentId when no search params", () => {
    usePost.mockReturnValue({
      data: { data: mockPost },
      isLoading: false,
      isError: false,
    });
    renderPage();
    const card = screen.getByTestId("post-card");
    expect(card).not.toHaveAttribute("data-target-comment");
    expect(card).not.toHaveAttribute("data-target-parent");
  });

  it("renders TrendingSidebar", () => {
    usePost.mockReturnValue({
      data: { data: mockPost },
      isLoading: false,
      isError: false,
    });
    renderPage();
    expect(screen.getByTestId("trending-sidebar")).toBeInTheDocument();
  });

  it("renders AIToolVoteCard", () => {
    usePost.mockReturnValue({
      data: { data: mockPost },
      isLoading: false,
      isError: false,
    });
    renderPage();
    expect(screen.getByTestId("ai-vote-card")).toBeInTheDocument();
  });

  it("calls usePost with the id from URL params", () => {
    usePost.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    renderPage("/post/my-special-id");
    expect(usePost).toHaveBeenCalledWith("my-special-id");
  });

  it("does not show PostCard while loading", () => {
    usePost.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    renderPage();
    expect(screen.queryByTestId("post-card")).not.toBeInTheDocument();
  });

  it("does not show PostCard on error", () => {
    usePost.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderPage();
    expect(screen.queryByTestId("post-card")).not.toBeInTheDocument();
  });
});
