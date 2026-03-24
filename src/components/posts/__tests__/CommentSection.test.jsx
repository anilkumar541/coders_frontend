import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CommentSection from "../CommentSection";

vi.mock("../../../store/authStore", () => ({
  useAuthStore: vi.fn((selector) => {
    const state = {
      user: { id: 1, username: "testuser", profile_picture: null },
      accessToken: "mock-token",
    };
    return selector(state);
  }),
}));

const mockGetComments = vi.fn();
const mockCreateComment = vi.fn();
const mockEditComment = vi.fn();
const mockDeleteComment = vi.fn();
const mockReactToComment = vi.fn();
const mockReport = vi.fn();

vi.mock("../../../api/posts", () => ({
  postsAPI: {
    getComments: (...args) => mockGetComments(...args),
    createComment: (...args) => mockCreateComment(...args),
    editComment: (...args) => mockEditComment(...args),
    deleteComment: (...args) => mockDeleteComment(...args),
    reactToComment: (...args) => mockReactToComment(...args),
    report: (...args) => mockReport(...args),
  },
}));

const mockComments = [
  {
    id: 1,
    post: 1,
    author: { id: 2, username: "alice", profile_picture: null },
    parent: null,
    content: "Great post!",
    is_edited: false,
    is_deleted: false,
    like_count: 3,
    dislike_count: 0,
    reply_count: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_reaction: null,
  },
  {
    id: 2,
    post: 1,
    author: { id: 1, username: "testuser", profile_picture: null },
    parent: null,
    content: "My own comment",
    is_edited: false,
    is_deleted: false,
    like_count: 0,
    dislike_count: 0,
    reply_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_reaction: null,
  },
];

function renderWithProviders(ui) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe("CommentSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetComments.mockResolvedValue({
      data: { results: mockComments, has_more: false, page: 1 },
    });
    mockCreateComment.mockResolvedValue({
      data: {
        id: 3,
        content: "New comment",
        author: { id: 1, username: "testuser", profile_picture: null },
        like_count: 0,
        dislike_count: 0,
        reply_count: 0,
        is_edited: false,
        is_deleted: false,
        user_reaction: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });
  });

  it("shows comment input for logged-in user", () => {
    renderWithProviders(<CommentSection postId={1} />);
    expect(screen.getByPlaceholderText("Write a comment...")).toBeInTheDocument();
  });

  it("loads and renders comments", async () => {
    renderWithProviders(<CommentSection postId={1} />);
    await waitFor(() => {
      expect(screen.getByText("Great post!")).toBeInTheDocument();
      expect(screen.getByText("My own comment")).toBeInTheDocument();
    });
  });

  it("renders author usernames", async () => {
    renderWithProviders(<CommentSection postId={1} />);
    await waitFor(() => {
      expect(screen.getByText("alice")).toBeInTheDocument();
    });
  });

  it("shows like count on comments with likes", async () => {
    renderWithProviders(<CommentSection postId={1} />);
    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  it("shows three-dot menu for each comment", async () => {
    renderWithProviders(<CommentSection postId={1} />);
    await waitFor(() => {
      expect(screen.getByText("Great post!")).toBeInTheDocument();
    });
    // Both comments should have a more-options button
    const menuButtons = screen.getAllByLabelText("More options");
    expect(menuButtons.length).toBeGreaterThanOrEqual(2);
  });

  it("shows Edit and Delete in menu for own comment", async () => {
    renderWithProviders(<CommentSection postId={1} />);
    await waitFor(() => {
      expect(screen.getByText("My own comment")).toBeInTheDocument();
    });
    // Click the menu for own comment (second one)
    const menuButtons = screen.getAllByLabelText("More options");
    await userEvent.click(menuButtons[1]);
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("shows Report in menu for other's comment", async () => {
    renderWithProviders(<CommentSection postId={1} />);
    await waitFor(() => {
      expect(screen.getByText("Great post!")).toBeInTheDocument();
    });
    const menuButtons = screen.getAllByLabelText("More options");
    await userEvent.click(menuButtons[0]);
    expect(screen.getByText("Report")).toBeInTheDocument();
  });

  it("shows View replies button for comments with replies", async () => {
    renderWithProviders(<CommentSection postId={1} />);
    await waitFor(() => {
      expect(screen.getByText("1 reply")).toBeInTheDocument();
    });
  });

  it("shows Reply button on top-level comments", async () => {
    renderWithProviders(<CommentSection postId={1} />);
    await waitFor(() => {
      const replyButtons = screen.getAllByText("Reply");
      expect(replyButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("shows reply form with @mention placeholder when Reply clicked", async () => {
    renderWithProviders(<CommentSection postId={1} />);
    await waitFor(() => screen.getAllByText("Reply"));
    await userEvent.click(screen.getAllByText("Reply")[0]);
    expect(
      screen.getByPlaceholderText("Reply to @alice…")
    ).toBeInTheDocument();
  });

  it("shows edited indicator on edited comments", async () => {
    mockGetComments.mockResolvedValue({
      data: {
        results: [{ ...mockComments[0], is_edited: true }],
        has_more: false,
        page: 1,
      },
    });
    renderWithProviders(<CommentSection postId={1} />);
    await waitFor(() => {
      expect(screen.getByText("· edited")).toBeInTheDocument();
    });
  });

  it("shows empty state when no comments", async () => {
    mockGetComments.mockResolvedValue({
      data: { results: [], has_more: false, page: 1 },
    });
    renderWithProviders(<CommentSection postId={1} />);
    await waitFor(() => {
      expect(screen.getByText("No comments yet")).toBeInTheDocument();
    });
  });

  it("renders initials avatar when no profile picture", async () => {
    renderWithProviders(<CommentSection postId={1} />);
    await waitFor(() => {
      expect(screen.getByText("AL")).toBeInTheDocument();
    });
  });

  it("hides deleted comments entirely", async () => {
    mockGetComments.mockResolvedValue({
      data: {
        results: [
          { ...mockComments[0], is_deleted: true },
          mockComments[1],
        ],
        has_more: false,
        page: 1,
      },
    });
    renderWithProviders(<CommentSection postId={1} />);
    await waitFor(() => {
      // Deleted comment renders nothing — only the non-deleted one is visible
      expect(screen.queryByText("[Comment deleted]")).not.toBeInTheDocument();
      expect(screen.getByText(mockComments[1].content)).toBeInTheDocument();
    });
  });

  it("highlights @mentions in comment content", async () => {
    mockGetComments.mockResolvedValue({
      data: {
        results: [{ ...mockComments[0], content: "Hello @john nice post!" }],
        has_more: false,
        page: 1,
      },
    });
    renderWithProviders(<CommentSection postId={1} />);
    await waitFor(() => {
      const mention = screen.getByText("@john");
      expect(mention).toBeInTheDocument();
      expect(mention.className).toContain("indigo");
    });
  });
});
