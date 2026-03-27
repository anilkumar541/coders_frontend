import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import NotificationPanel from "../NotificationPanel";

// ── Mock hooks ───────────────────────────────────────────────────────────────
const mockFetchNextPage = vi.fn();
const mockMarkRead = { mutate: vi.fn() };
const mockMarkAllRead = { mutate: vi.fn(), isPending: false };

vi.mock("../../../hooks/useNotifications", () => ({
  useNotifications: vi.fn(),
  useMarkRead: vi.fn(() => mockMarkRead),
  useMarkAllRead: vi.fn(() => mockMarkAllRead),
}));

// ── Mock navigate ────────────────────────────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

// ── Helpers ──────────────────────────────────────────────────────────────────
import { useNotifications } from "../../../hooks/useNotifications";

function makeNotification(overrides = {}) {
  return {
    id: "notif-1",
    actor: { id: 10, username: "alice", profile_picture: null },
    notification_type: "like",
    post_id: "post-abc",
    comment_id: null,
    comment_parent_id: null,
    post_excerpt: "Coding is my life and everything.",
    text: "liked your post",
    is_read: false,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

function renderPanel(onClose = vi.fn()) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={qc}>
        <NotificationPanel onClose={onClose} />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

function seedNotifications(notifications = [], unreadCount = 0) {
  useNotifications.mockReturnValue({
    data: {
      pages: [
        {
          data: {
            results: notifications,
            unread_count: unreadCount,
          },
        },
      ],
    },
    fetchNextPage: mockFetchNextPage,
    hasNextPage: false,
    isFetchingNextPage: false,
    isLoading: false,
  });
}

// ── Tests ────────────────────────────────────────────────────────────────────
describe("NotificationPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    seedNotifications();
  });

  it("renders the Notifications heading", () => {
    renderPanel();
    expect(screen.getByText("Notifications")).toBeInTheDocument();
  });

  it("shows 'No notifications yet' when list is empty", () => {
    renderPanel();
    expect(screen.getByText("No notifications yet")).toBeInTheDocument();
  });

  it("renders a notification row with actor username and text", () => {
    seedNotifications([makeNotification()]);
    renderPanel();
    expect(screen.getByText("alice")).toBeInTheDocument();
    expect(screen.getByText("liked your post")).toBeInTheDocument();
  });

  it("renders post excerpt in blockquote style", () => {
    seedNotifications([makeNotification()]);
    renderPanel();
    expect(
      screen.getByText("Coding is my life and everything.")
    ).toBeInTheDocument();
  });

  it("does not render post excerpt when null", () => {
    seedNotifications([makeNotification({ post_excerpt: null })]);
    renderPanel();
    expect(
      screen.queryByText("Coding is my life and everything.")
    ).not.toBeInTheDocument();
  });

  it("shows unread dot for unread notifications", () => {
    seedNotifications([makeNotification({ is_read: false })]);
    renderPanel();
    // Unread dot is a small div — check via bg-indigo-500 class
    const dots = document
      .querySelectorAll(".bg-indigo-500");
    expect(dots.length).toBeGreaterThan(0);
  });

  it("does not show unread dot for read notifications", () => {
    seedNotifications([makeNotification({ is_read: true })]);
    const { container } = renderPanel();
    const dots = container.querySelectorAll(".w-2.h-2.rounded-full.bg-indigo-500");
    expect(dots).toHaveLength(0);
  });

  it("shows 'Mark all read' button when unreadCount > 0", () => {
    seedNotifications([makeNotification()], 1);
    renderPanel();
    expect(screen.getByText("Mark all read")).toBeInTheDocument();
  });

  it("hides 'Mark all read' button when unreadCount is 0", () => {
    seedNotifications([makeNotification({ is_read: true })], 0);
    renderPanel();
    expect(screen.queryByText("Mark all read")).not.toBeInTheDocument();
  });

  it("clicking 'Mark all read' calls markAllRead.mutate", async () => {
    seedNotifications([makeNotification()], 1);
    renderPanel();
    await userEvent.click(screen.getByText("Mark all read"));
    expect(mockMarkAllRead.mutate).toHaveBeenCalledTimes(1);
  });

  it("shows 'Load more' button when hasNextPage is true", () => {
    useNotifications.mockReturnValue({
      data: { pages: [{ data: { results: [], unread_count: 0 } }] },
      fetchNextPage: mockFetchNextPage,
      hasNextPage: true,
      isFetchingNextPage: false,
      isLoading: false,
    });
    renderPanel();
    expect(screen.getByText("Load more")).toBeInTheDocument();
  });

  it("clicking 'Load more' calls fetchNextPage", async () => {
    useNotifications.mockReturnValue({
      data: { pages: [{ data: { results: [], unread_count: 0 } }] },
      fetchNextPage: mockFetchNextPage,
      hasNextPage: true,
      isFetchingNextPage: false,
      isLoading: false,
    });
    renderPanel();
    await userEvent.click(screen.getByText("Load more"));
    expect(mockFetchNextPage).toHaveBeenCalledTimes(1);
  });

  it("shows loading skeletons while isLoading is true", () => {
    useNotifications.mockReturnValue({
      data: undefined,
      fetchNextPage: mockFetchNextPage,
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: true,
    });
    const { container } = renderPanel();
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  // ── Click navigation ─────────────────────────────────────────────────────
  it("clicking a post-like notification navigates to /post/:post_id", async () => {
    const onClose = vi.fn();
    seedNotifications([makeNotification({ is_read: true })]);
    renderPanel(onClose);
    await userEvent.click(screen.getByText("liked your post"));
    expect(mockNavigate).toHaveBeenCalledWith("/post/post-abc");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("clicking navigates to /post/:id?comment=:cid for comment notifications", async () => {
    seedNotifications([
      makeNotification({
        notification_type: "comment",
        comment_id: "cmt-99",
        comment_parent_id: null,
        text: "commented on your post",
        is_read: true,
      }),
    ]);
    renderPanel();
    await userEvent.click(screen.getByText("commented on your post"));
    expect(mockNavigate).toHaveBeenCalledWith(
      "/post/post-abc?comment=cmt-99"
    );
  });

  it("includes &parent= param for reply notifications", async () => {
    seedNotifications([
      makeNotification({
        notification_type: "reply",
        comment_id: "reply-1",
        comment_parent_id: "parent-5",
        text: "replied to your comment",
        is_read: true,
      }),
    ]);
    renderPanel();
    await userEvent.click(screen.getByText("replied to your comment"));
    expect(mockNavigate).toHaveBeenCalledWith(
      "/post/post-abc?comment=reply-1&parent=parent-5"
    );
  });

  it("clicking a follow notification navigates to /user/:actor.id", async () => {
    seedNotifications([
      makeNotification({
        notification_type: "follow",
        post_id: null,
        post_excerpt: null,
        text: "started following you",
        is_read: true,
      }),
    ]);
    renderPanel();
    await userEvent.click(screen.getByText("started following you"));
    expect(mockNavigate).toHaveBeenCalledWith("/user/10");
  });

  it("clicking unread notification marks it as read", async () => {
    seedNotifications([makeNotification({ id: "notif-unread", is_read: false })]);
    renderPanel();
    await userEvent.click(screen.getByText("liked your post"));
    expect(mockMarkRead.mutate).toHaveBeenCalledWith("notif-unread");
  });

  it("does not call markRead for already-read notifications", async () => {
    seedNotifications([makeNotification({ is_read: true })]);
    renderPanel();
    await userEvent.click(screen.getByText("liked your post"));
    expect(mockMarkRead.mutate).not.toHaveBeenCalled();
  });

  it("renders multiple notifications", () => {
    seedNotifications([
      makeNotification({ id: "n1", actor: { id: 1, username: "alice", profile_picture: null }, text: "liked your post" }),
      makeNotification({ id: "n2", actor: { id: 2, username: "bob", profile_picture: null }, text: "commented on your post" }),
    ]);
    renderPanel();
    expect(screen.getByText("alice")).toBeInTheDocument();
    expect(screen.getByText("bob")).toBeInTheDocument();
  });

  it("renders timeAgo timestamp for each notification", () => {
    seedNotifications([makeNotification()]);
    renderPanel();
    expect(screen.getByText("just now")).toBeInTheDocument();
  });
});
