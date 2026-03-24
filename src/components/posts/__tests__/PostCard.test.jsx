import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PostCard from "../PostCard";

vi.mock("../../../store/authStore", () => ({
  useAuthStore: vi.fn((selector) => {
    const state = {
      user: { id: 1, username: "testuser" },
      accessToken: "mock-token",
    };
    return selector(state);
  }),
}));

vi.mock("../../../api/posts", () => ({
  postsAPI: {
    editPost: vi.fn(),
    deletePost: vi.fn(),
    undoDelete: vi.fn(),
    getComments: vi.fn().mockResolvedValue({
      data: { results: [], has_more: false, page: 1 },
    }),
    createComment: vi.fn(),
    reactToComment: vi.fn(),
    report: vi.fn().mockResolvedValue({ data: {} }),
    blockUser: vi.fn().mockResolvedValue({ data: { blocked: true } }),
    muteUser: vi.fn().mockResolvedValue({ data: { muted: true } }),
    getBlockedUsers: vi.fn().mockResolvedValue({ data: [] }),
    getMutedUsers: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

const mockPost = {
  id: 1,
  author: {
    id: 1,
    username: "testuser",
    email: "test@example.com",
    profile_picture: null,
  },
  content: "Test post content here",
  post_type: "post",
  visibility: "public",
  status: "active",
  is_edited: false,
  like_count: 5,
  comment_count: 2,
  view_count: 100,
  repost_count: 0,
  save_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  edit_count: 0,
  media: [],
  hashtags: [],
  mentions: [],
  user_reaction: null,
  user_saved: false,
};

const otherUserPost = {
  ...mockPost,
  id: 2,
  author: { id: 2, username: "otheruser", email: "other@example.com", profile_picture: null },
};

function renderWithProviders(ui) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe("PostCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders post content", () => {
    renderWithProviders(<PostCard post={mockPost} />);
    expect(screen.getByText("Test post content here")).toBeInTheDocument();
  });

  it("renders author username", () => {
    renderWithProviders(<PostCard post={mockPost} />);
    expect(screen.getByText("testuser")).toBeInTheDocument();
  });

  it("renders engagement action buttons", () => {
    renderWithProviders(<PostCard post={mockPost} />);
    expect(screen.getByLabelText("Like")).toBeInTheDocument();
    expect(screen.getByLabelText("Dislike")).toBeInTheDocument();
    expect(screen.getByLabelText("Save")).toBeInTheDocument();
  });

  it("shows like and view counts", () => {
    renderWithProviders(<PostCard post={mockPost} />);
    // Counts appear next to icons
    expect(screen.getByText("5")).toBeInTheDocument(); // like_count
    expect(screen.getByText("100")).toBeInTheDocument(); // view_count
    expect(screen.getByText("2")).toBeInTheDocument(); // comment_count
  });

  it("shows edited label when post is edited", () => {
    const post = { ...mockPost, is_edited: true };
    renderWithProviders(<PostCard post={post} />);
    expect(screen.getByText("(edited)")).toBeInTheDocument();
  });

  it("does not show edited label when not edited", () => {
    renderWithProviders(<PostCard post={mockPost} />);
    expect(screen.queryByText("(edited)")).not.toBeInTheDocument();
  });

  it("shows three-dot menu for post owner", () => {
    renderWithProviders(<PostCard post={mockPost} />);
    expect(screen.getByLabelText("Post options")).toBeInTheDocument();
  });

  it("shows menu for non-owner with report/block/mute options", async () => {
    // getBlockedUsers returns empty list → button reads "Block"
    const { postsAPI } = await import("../../../api/posts");
    postsAPI.getBlockedUsers.mockResolvedValue({ data: [] });
    postsAPI.getMutedUsers.mockResolvedValue({ data: [] });
    renderWithProviders(<PostCard post={otherUserPost} />);
    expect(screen.getByLabelText("Post options")).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Post options"));
    expect(screen.getByText("Report")).toBeInTheDocument();
    expect(screen.getByText("Block")).toBeInTheDocument();
    expect(screen.getByText("Mute")).toBeInTheDocument();
  });

  it("shows Unblock when post author is already blocked", async () => {
    const { postsAPI } = await import("../../../api/posts");
    postsAPI.getBlockedUsers.mockResolvedValue({
      data: [{ id: 2, username: "otheruser" }],
    });
    postsAPI.getMutedUsers.mockResolvedValue({ data: [] });
    renderWithProviders(<PostCard post={otherUserPost} />);
    await userEvent.click(screen.getByLabelText("Post options"));
    expect(await screen.findByText("Unblock")).toBeInTheDocument();
    expect(screen.getByText("Mute")).toBeInTheDocument();
  });

  it("shows Unmute when post author is already muted", async () => {
    const { postsAPI } = await import("../../../api/posts");
    postsAPI.getBlockedUsers.mockResolvedValue({ data: [] });
    postsAPI.getMutedUsers.mockResolvedValue({
      data: [{ id: 2, username: "otheruser" }],
    });
    renderWithProviders(<PostCard post={otherUserPost} />);
    await userEvent.click(screen.getByLabelText("Post options"));
    expect(await screen.findByText("Unmute")).toBeInTheDocument();
    expect(screen.getByText("Block")).toBeInTheDocument();
  });

  it("opens dropdown with Edit and Delete on menu click", async () => {
    renderWithProviders(<PostCard post={mockPost} />);
    await userEvent.click(screen.getByLabelText("Post options"));
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("shows edit modal on Edit click", async () => {
    renderWithProviders(<PostCard post={mockPost} />);
    await userEvent.click(screen.getByLabelText("Post options"));
    await userEvent.click(screen.getByText("Edit"));
    // EditPostModal renders a textarea with the existing content
    expect(screen.getByDisplayValue("Test post content here")).toBeInTheDocument();
    expect(screen.getByText("Save changes")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("cancels edit modal and returns to content", async () => {
    renderWithProviders(<PostCard post={mockPost} />);
    await userEvent.click(screen.getByLabelText("Post options"));
    await userEvent.click(screen.getByText("Edit"));
    await userEvent.click(screen.getByText("Cancel"));
    expect(screen.getByText("Test post content here")).toBeInTheDocument();
    expect(screen.queryByText("Save changes")).not.toBeInTheDocument();
  });

  it("shows visibility label for private posts", () => {
    const post = { ...mockPost, visibility: "private" };
    renderWithProviders(<PostCard post={post} />);
    expect(screen.getByText("Only me")).toBeInTheDocument();
  });

  it("shows visibility label for followers posts", () => {
    const post = { ...mockPost, visibility: "followers" };
    renderWithProviders(<PostCard post={post} />);
    expect(screen.getByText("Followers")).toBeInTheDocument();
  });

  it("does not show visibility label for public posts", () => {
    renderWithProviders(<PostCard post={mockPost} />);
    expect(screen.queryByText("Only me")).not.toBeInTheDocument();
    expect(screen.queryByText("Followers")).not.toBeInTheDocument();
  });

  it("renders initials avatar when no profile picture", () => {
    renderWithProviders(<PostCard post={mockPost} />);
    expect(screen.getByText("TE")).toBeInTheDocument();
  });

  it("renders time ago", () => {
    renderWithProviders(<PostCard post={mockPost} />);
    expect(screen.getByText("just now")).toBeInTheDocument();
  });

  it("shows comment count and opens modal on click", () => {
    renderWithProviders(<PostCard post={mockPost} />);
    // comment_count is 2, should display "2"
    expect(screen.getByLabelText("Comments")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("clicking comment button opens comment modal", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PostCard post={mockPost} />);
    const commentBtn = screen.getByLabelText("Comments");
    await user.click(commentBtn);
    // CommentModal renders with a close button
    expect(await screen.findByLabelText("Close comments")).toBeInTheDocument();
  });
});
