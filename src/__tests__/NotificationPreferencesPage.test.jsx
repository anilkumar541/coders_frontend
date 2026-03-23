import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import NotificationPreferencesPage from "../pages/NotificationPreferencesPage";

vi.mock("../store/authStore", () => ({
  useAuthStore: vi.fn((selector) => {
    const state = {
      user: { id: 1, username: "testuser" },
      accessToken: "mock-token",
    };
    return selector(state);
  }),
}));

const mockGetPreferences = vi.fn();
const mockUpdatePreferences = vi.fn();

vi.mock("../api/notifications", () => ({
  notificationsAPI: {
    getPreferences: (...args) => mockGetPreferences(...args),
    updatePreferences: (...args) => mockUpdatePreferences(...args),
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

describe("NotificationPreferencesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPreferences.mockResolvedValue({
      data: {
        likes: true,
        comments: true,
        replies: true,
        mentions: true,
        reposts: true,
        follows: true,
      },
    });
    mockUpdatePreferences.mockResolvedValue({
      data: {
        likes: false,
        comments: true,
        replies: true,
        mentions: true,
        reposts: true,
        follows: true,
      },
    });
  });

  it("renders page title", async () => {
    renderWithProviders(<NotificationPreferencesPage />);
    await waitFor(() => {
      expect(screen.getByText("Notification Preferences")).toBeInTheDocument();
    });
  });

  it("shows all preference toggles", async () => {
    renderWithProviders(<NotificationPreferencesPage />);
    await waitFor(() => {
      expect(screen.getByText("Likes on your posts")).toBeInTheDocument();
      expect(screen.getByText("Comments on your posts")).toBeInTheDocument();
      expect(screen.getByText("Replies to your comments")).toBeInTheDocument();
      expect(screen.getByText("Mentions (@you)")).toBeInTheDocument();
      expect(screen.getByText("Reposts of your posts")).toBeInTheDocument();
      expect(screen.getByText("New followers")).toBeInTheDocument();
    });
  });

  it("renders toggle switches", async () => {
    renderWithProviders(<NotificationPreferencesPage />);
    await waitFor(() => {
      const switches = screen.getAllByRole("switch");
      expect(switches.length).toBe(6);
    });
  });

  it("shows loading state", () => {
    mockGetPreferences.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<NotificationPreferencesPage />);
    expect(screen.getByText("Loading preferences...")).toBeInTheDocument();
  });

  it("calls update on toggle click", async () => {
    renderWithProviders(<NotificationPreferencesPage />);
    await waitFor(() => screen.getByText("Likes on your posts"));
    const likesToggle = screen.getByLabelText("Likes on your posts");
    await userEvent.click(likesToggle);
    expect(mockUpdatePreferences).toHaveBeenCalledWith({ likes: false });
  });
});
