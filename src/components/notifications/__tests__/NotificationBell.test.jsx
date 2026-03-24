import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import NotificationBell from "../NotificationBell";

vi.mock("../../../store/authStore", () => ({
  useAuthStore: vi.fn((selector) => {
    const state = {
      user: { id: 1, username: "testuser" },
      accessToken: "mock-token",
    };
    return selector(state);
  }),
}));

const mockGetUnreadCount = vi.fn();
const mockGetNotifications = vi.fn();
const mockMarkRead = vi.fn();
const mockMarkAllRead = vi.fn();

vi.mock("../../../api/notifications", () => ({
  notificationsAPI: {
    getUnreadCount: (...args) => mockGetUnreadCount(...args),
    getNotifications: (...args) => mockGetNotifications(...args),
    markRead: (...args) => mockMarkRead(...args),
    markAllRead: (...args) => mockMarkAllRead(...args),
  },
}));

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

describe("NotificationBell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUnreadCount.mockResolvedValue({ data: { unread_count: 3 } });
    mockGetNotifications.mockResolvedValue({
      data: {
        results: [
          {
            id: 1,
            actor: { id: 2, username: "alice", profile_picture: null },
            notification_type: "like",
            post_id: 1,
            comment_id: null,
            text: "liked your post",
            is_read: false,
            created_at: new Date().toISOString(),
          },
          {
            id: 2,
            actor: { id: 3, username: "bob", profile_picture: null },
            notification_type: "comment",
            post_id: 1,
            comment_id: 5,
            text: "commented on your post",
            is_read: true,
            created_at: new Date().toISOString(),
          },
        ],
        has_more: false,
        page: 1,
        unread_count: 1,
      },
    });
    mockMarkRead.mockResolvedValue({ data: {} });
    mockMarkAllRead.mockResolvedValue({ data: { marked_read: 1 } });
  });

  it("renders bell icon", () => {
    renderWithProviders(<NotificationBell />);
    expect(screen.getByLabelText("Notifications")).toBeInTheDocument();
  });

  it("shows unread badge count", async () => {
    renderWithProviders(<NotificationBell />);
    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  it("does not show badge when count is 0", async () => {
    mockGetUnreadCount.mockResolvedValue({ data: { unread_count: 0 } });
    renderWithProviders(<NotificationBell />);
    await waitFor(() => {
      expect(screen.queryByLabelText(/unread notifications/)).not.toBeInTheDocument();
    });
  });

  it("opens notification panel on click", async () => {
    renderWithProviders(<NotificationBell />);
    await userEvent.click(screen.getByLabelText("Notifications"));
    await waitFor(() => {
      expect(screen.getByText("Notifications")).toBeInTheDocument();
      expect(screen.getByText("liked your post")).toBeInTheDocument();
    });
  });

  it("shows actor names in panel", async () => {
    renderWithProviders(<NotificationBell />);
    await userEvent.click(screen.getByLabelText("Notifications"));
    await waitFor(() => {
      expect(screen.getByText("alice")).toBeInTheDocument();
      expect(screen.getByText("bob")).toBeInTheDocument();
    });
  });

  it("shows mark all read button", async () => {
    renderWithProviders(<NotificationBell />);
    await userEvent.click(screen.getByLabelText("Notifications"));
    await waitFor(() => {
      expect(screen.getByText("Mark all read")).toBeInTheDocument();
    });
  });

  it("shows empty state when no notifications", async () => {
    mockGetNotifications.mockResolvedValue({
      data: { results: [], has_more: false, page: 1, unread_count: 0 },
    });
    mockGetUnreadCount.mockResolvedValue({ data: { unread_count: 0 } });
    renderWithProviders(<NotificationBell />);
    await userEvent.click(screen.getByLabelText("Notifications"));
    await waitFor(() => {
      expect(screen.getByText("No notifications yet")).toBeInTheDocument();
    });
  });

  it("shows initials avatar for actors", async () => {
    renderWithProviders(<NotificationBell />);
    await userEvent.click(screen.getByLabelText("Notifications"));
    await waitFor(() => {
      expect(screen.getByText("AL")).toBeInTheDocument();
      expect(screen.getByText("BO")).toBeInTheDocument();
    });
  });

  it("shows 99+ for large unread counts", async () => {
    mockGetUnreadCount.mockResolvedValue({ data: { unread_count: 150 } });
    renderWithProviders(<NotificationBell />);
    await waitFor(() => {
      expect(screen.getByText("99+")).toBeInTheDocument();
    });
  });
});
