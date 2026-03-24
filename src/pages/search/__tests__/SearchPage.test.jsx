import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SearchPage from "../SearchPage";

vi.mock("../../../store/authStore", () => ({
  useAuthStore: vi.fn((selector) => {
    const state = {
      user: { id: 1, username: "testuser" },
      accessToken: "mock-token",
    };
    return selector(state);
  }),
}));

const mockSearchPosts = vi.fn();
const mockSearchUsers = vi.fn();
const mockSearchHashtags = vi.fn();

vi.mock("../../../api/posts", () => ({
  postsAPI: {
    searchPosts: (...args) => mockSearchPosts(...args),
    searchUsers: (...args) => mockSearchUsers(...args),
    searchHashtags: (...args) => mockSearchHashtags(...args),
    getComments: vi.fn().mockResolvedValue({ data: { results: [], has_more: false, page: 1 } }),
    createComment: vi.fn(),
    reactToComment: vi.fn(),
    report: vi.fn(),
    blockUser: vi.fn(),
    muteUser: vi.fn(),
  },
}));

vi.mock("../../../api/notifications", () => ({
  notificationsAPI: {
    getUnreadCount: vi.fn().mockResolvedValue({ data: { unread_count: 0 } }),
  },
}));

function renderWithProviders(ui) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe("SearchPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchPosts.mockResolvedValue({
      data: {
        results: [
          {
            id: 1,
            author: { id: 2, username: "alice", profile_picture: null },
            content: "Django tutorial",
            post_type: "post",
            visibility: "public",
            status: "active",
            is_edited: false,
            like_count: 0,
            dislike_count: 0,
            comment_count: 0,
            repost_count: 0,
            save_count: 0,
            view_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            edit_count: 0,
            media: [],
            hashtags: [],
            mentions: [],
            user_reaction: null,
            user_saved: false,
          },
        ],
        has_more: false,
        page: 1,
      },
    });
    mockSearchUsers.mockResolvedValue({
      data: [{ id: 2, username: "alice", email: "a@a.com" }],
    });
    mockSearchHashtags.mockResolvedValue({
      data: [{ id: 1, name: "django", post_count: 42 }],
    });
  });

  it("renders search input", () => {
    renderWithProviders(<SearchPage />);
    expect(screen.getByPlaceholderText(/Search posts/)).toBeInTheDocument();
  });

  it("renders all tabs", () => {
    renderWithProviders(<SearchPage />);
    expect(screen.getByText("Posts")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Hashtags")).toBeInTheDocument();
  });

  it("shows minimum character hint for posts", () => {
    renderWithProviders(<SearchPage />);
    expect(screen.getByText(/Type at least 2 characters/)).toBeInTheDocument();
  });

  it("shows search results for posts", async () => {
    renderWithProviders(<SearchPage />);
    await userEvent.type(screen.getByPlaceholderText(/Search posts/), "Django");
    await waitFor(() => {
      expect(screen.getByText("Django tutorial")).toBeInTheDocument();
    });
  });

  it("switches to Users tab", async () => {
    renderWithProviders(<SearchPage />);
    await userEvent.click(screen.getByText("Users"));
    expect(screen.getByText("Type to search users")).toBeInTheDocument();
  });

  it("shows user results", async () => {
    renderWithProviders(<SearchPage />);
    await userEvent.click(screen.getByText("Users"));
    await userEvent.type(screen.getByPlaceholderText(/Search posts/), "ali");
    await waitFor(() => {
      expect(screen.getByText("alice")).toBeInTheDocument();
    });
  });

  it("switches to Hashtags tab", async () => {
    renderWithProviders(<SearchPage />);
    await userEvent.click(screen.getByText("Hashtags"));
    expect(screen.getByText("Type to search hashtags")).toBeInTheDocument();
  });

  it("shows hashtag results", async () => {
    renderWithProviders(<SearchPage />);
    await userEvent.click(screen.getByText("Hashtags"));
    await userEvent.type(screen.getByPlaceholderText(/Search posts/), "dj");
    await waitFor(() => {
      expect(screen.getByText("#django")).toBeInTheDocument();
      expect(screen.getByText("42 posts")).toBeInTheDocument();
    });
  });
});
