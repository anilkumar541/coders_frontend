import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CommentSection from "../components/CommentSection";

vi.mock("../store/authStore", () => ({
  useAuthStore: vi.fn((selector) => {
    const state = {
      user: { id: 1, username: "testuser" },
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

vi.mock("../api/posts", () => ({
  postsAPI: {
    getComments: (...args) => mockGetComments(...args),
    createComment: (...args) => mockCreateComment(...args),
    editComment: (...args) => mockEditComment(...args),
    deleteComment: (...args) => mockDeleteComment(...args),
    reactToComment: (...args) => mockReactToComment(...args),
  },
}));

const mockComments = [
  {
    id: 1,
    post: 1,
    author: { id: 2, username: "alice", email: "a@a.com", profile_picture: null },
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
    author: { id: 1, username: "testuser", email: "t@t.com", profile_picture: null },
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
      data: { id: 3, content: "New comment", author: { id: 1, username: "testuser" } },
    });
  });

  it("shows 'View comments' button when there are comments", () => {
    renderWithProviders(<CommentSection postId={1} commentCount={5} />);
    expect(screen.getByText("View 5 comments")).toBeInTheDocument();
  });

  it("shows singular for 1 comment", () => {
    renderWithProviders(<CommentSection postId={1} commentCount={1} />);
    expect(screen.getByText("View 1 comment")).toBeInTheDocument();
  });

  it("shows comment form when no comments exist", () => {
    renderWithProviders(<CommentSection postId={1} commentCount={0} />);
    expect(screen.getByPlaceholderText("Write a comment...")).toBeInTheDocument();
  });

  it("expands comments on click", async () => {
    renderWithProviders(<CommentSection postId={1} commentCount={2} />);
    await userEvent.click(screen.getByText("View 2 comments"));
    await waitFor(() => {
      expect(screen.getByText("Great post!")).toBeInTheDocument();
      expect(screen.getByText("My own comment")).toBeInTheDocument();
    });
  });

  it("shows hide button when expanded", async () => {
    renderWithProviders(<CommentSection postId={1} commentCount={2} />);
    await userEvent.click(screen.getByText("View 2 comments"));
    await waitFor(() => {
      expect(screen.getByText("Hide comments")).toBeInTheDocument();
    });
  });

  it("collapses comments on hide click", async () => {
    renderWithProviders(<CommentSection postId={1} commentCount={2} />);
    await userEvent.click(screen.getByText("View 2 comments"));
    await waitFor(() => screen.getByText("Hide comments"));
    await userEvent.click(screen.getByText("Hide comments"));
    expect(screen.queryByText("Great post!")).not.toBeInTheDocument();
  });

  it("shows comment form when expanded", async () => {
    renderWithProviders(<CommentSection postId={1} commentCount={2} />);
    await userEvent.click(screen.getByText("View 2 comments"));
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Write a comment...")).toBeInTheDocument();
    });
  });

  it("renders author usernames", async () => {
    renderWithProviders(<CommentSection postId={1} commentCount={2} />);
    await userEvent.click(screen.getByText("View 2 comments"));
    await waitFor(() => {
      expect(screen.getByText("alice")).toBeInTheDocument();
    });
  });

  it("shows like count on comments", async () => {
    renderWithProviders(<CommentSection postId={1} commentCount={2} />);
    await userEvent.click(screen.getByText("View 2 comments"));
    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  it("shows Edit and Delete for own comments", async () => {
    renderWithProviders(<CommentSection postId={1} commentCount={2} />);
    await userEvent.click(screen.getByText("View 2 comments"));
    await waitFor(() => {
      // "My own comment" is by testuser (id:1)
      expect(screen.getByText("My own comment")).toBeInTheDocument();
    });
    // Should see Edit/Delete buttons for own comment
    const editButtons = screen.getAllByText("Edit");
    const deleteButtons = screen.getAllByText("Delete");
    expect(editButtons.length).toBeGreaterThanOrEqual(1);
    expect(deleteButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("does not show Edit/Delete for other user's comments", async () => {
    renderWithProviders(<CommentSection postId={1} commentCount={2} />);
    await userEvent.click(screen.getByText("View 2 comments"));
    await waitFor(() => {
      expect(screen.getByText("Great post!")).toBeInTheDocument();
    });
    // Only 1 Edit button (for own comment), not 2
    const editButtons = screen.getAllByText("Edit");
    expect(editButtons.length).toBe(1);
  });

  it("shows View replies button for comments with replies", async () => {
    renderWithProviders(<CommentSection postId={1} commentCount={2} />);
    await userEvent.click(screen.getByText("View 2 comments"));
    await waitFor(() => {
      expect(screen.getByText("View 1 reply")).toBeInTheDocument();
    });
  });

  it("shows Reply button on top-level comments", async () => {
    renderWithProviders(<CommentSection postId={1} commentCount={2} />);
    await userEvent.click(screen.getByText("View 2 comments"));
    await waitFor(() => {
      const replyButtons = screen.getAllByText("Reply");
      expect(replyButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("shows reply form when Reply is clicked", async () => {
    renderWithProviders(<CommentSection postId={1} commentCount={2} />);
    await userEvent.click(screen.getByText("View 2 comments"));
    await waitFor(() => screen.getAllByText("Reply"));
    await userEvent.click(screen.getAllByText("Reply")[0]);
    expect(screen.getByPlaceholderText("Reply to @alice...")).toBeInTheDocument();
  });

  it("shows edited label on edited comments", async () => {
    mockGetComments.mockResolvedValue({
      data: {
        results: [{ ...mockComments[0], is_edited: true }],
        has_more: false,
        page: 1,
      },
    });
    renderWithProviders(<CommentSection postId={1} commentCount={1} />);
    await userEvent.click(screen.getByText("View 1 comment"));
    await waitFor(() => {
      expect(screen.getByText("(edited)")).toBeInTheDocument();
    });
  });

  it("shows [Comment deleted] for deleted comments", async () => {
    mockGetComments.mockResolvedValue({
      data: {
        results: [
          { ...mockComments[0], is_deleted: true, content: "[Comment deleted]" },
        ],
        has_more: false,
        page: 1,
      },
    });
    renderWithProviders(<CommentSection postId={1} commentCount={1} />);
    await userEvent.click(screen.getByText("View 1 comment"));
    await waitFor(() => {
      expect(screen.getByText("[Comment deleted]")).toBeInTheDocument();
    });
  });

  it("renders initials avatar when no profile picture", async () => {
    renderWithProviders(<CommentSection postId={1} commentCount={2} />);
    await userEvent.click(screen.getByText("View 2 comments"));
    await waitFor(() => {
      expect(screen.getByText("AL")).toBeInTheDocument(); // alice
    });
  });
});
