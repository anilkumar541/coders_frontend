import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProfilePage from "../ProfilePage";

const mockUser = vi.hoisted(() => ({
  id: 1,
  username: "testuser",
  email: "test@example.com",
  first_name: "John",
  last_name: "Doe",
  bio: "Hello world",
  website: "https://example.com",
  location: "New York",
  is_email_verified: true,
  profile_picture: null,
  date_joined: "2026-01-01T00:00:00Z",
}));

vi.mock("../../../store/authStore", () => ({
  useAuthStore: vi.fn((selector) => {
    const state = {
      user: mockUser,
      accessToken: "mock-token",
      setUser: vi.fn(),
      loginSuccess: vi.fn(),
      logout: vi.fn(),
    };
    return selector ? selector(state) : state;
  }),
}));

vi.mock("../../../api/auth", () => ({
  authAPI: {
    getMe: vi.fn().mockResolvedValue({ data: mockUser }),
    updateProfile: vi.fn().mockResolvedValue({ data: mockUser }),
    uploadProfilePicture: vi.fn().mockResolvedValue({ data: mockUser }),
    deleteProfilePicture: vi.fn().mockResolvedValue({ data: mockUser }),
  },
}));

vi.mock("../../../api/posts", () => ({
  postsAPI: {
    getMyPosts: vi.fn().mockResolvedValue({
      data: { results: [], has_more: false, next_cursor: null },
    }),
    getBlockedUsers: vi.fn().mockResolvedValue({
      data: [{ id: 2, username: "blockeduser", profile_picture: null }],
    }),
    getMutedUsers: vi.fn().mockResolvedValue({
      data: [{ id: 3, username: "muteduser", profile_picture: null }],
    }),
    blockUser: vi.fn().mockResolvedValue({ data: { blocked: false } }),
    muteUser: vi.fn().mockResolvedValue({ data: { muted: false } }),
  },
}));

function renderWithProviders(ui) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all three tabs", async () => {
    renderWithProviders(<ProfilePage />);
    await waitFor(() => {
      expect(screen.getByText("Profile")).toBeInTheDocument();
      expect(screen.getByText("My Posts")).toBeInTheDocument();
      expect(screen.getByText("Privacy")).toBeInTheDocument();
    });
  });

  it("shows user info in Profile tab by default", async () => {
    renderWithProviders(<ProfilePage />);
    await waitFor(() => {
      expect(screen.getAllByText("John Doe").length).toBeGreaterThan(0);
      expect(screen.getByText("@testuser")).toBeInTheDocument();
      expect(screen.getAllByText("Hello world").length).toBeGreaterThan(0);
      expect(screen.getByText("New York")).toBeInTheDocument();
    });
  });

  it("shows verified badge for verified users", async () => {
    renderWithProviders(<ProfilePage />);
    await waitFor(() => {
      expect(screen.getByText("Verified")).toBeInTheDocument();
    });
  });

  it("shows email in profile details", async () => {
    renderWithProviders(<ProfilePage />);
    await waitFor(() => {
      expect(screen.getAllByText("test@example.com").length).toBeGreaterThan(0);
    });
  });

  it("shows website link in profile details", async () => {
    renderWithProviders(<ProfilePage />);
    await waitFor(() => {
      const link = screen.getByRole("link", { name: /example\.com/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "https://example.com");
    });
  });

  it("clicking Edit Profile shows the edit form", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />);
    await waitFor(() => screen.getByText("Edit Profile"));
    await user.click(screen.getByText("Edit Profile"));
    expect(screen.getByPlaceholderText("First name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Last name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tell people about yourself/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("https://yoursite.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("City, Country")).toBeInTheDocument();
  });

  it("Cancel in edit form restores view mode", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />);
    await waitFor(() => screen.getByText("Edit Profile"));
    await user.click(screen.getByText("Edit Profile"));
    await user.click(screen.getByText("Cancel"));
    expect(screen.queryByPlaceholderText("First name")).not.toBeInTheDocument();
    expect(screen.getByText("Edit Profile")).toBeInTheDocument();
  });

  it("Save Changes calls updateProfile mutation", async () => {
    const { authAPI } = await import("../../../api/auth");
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />);
    await waitFor(() => screen.getByText("Edit Profile"));
    await user.click(screen.getByText("Edit Profile"));
    await user.click(screen.getByText("Save Changes"));
    await waitFor(() => {
      expect(authAPI.updateProfile).toHaveBeenCalled();
    });
  });

  it("switching to My Posts tab hides profile details", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />);
    await waitFor(() => screen.getByText("My Posts"));
    await user.click(screen.getByText("My Posts"));
    await waitFor(() => {
      expect(screen.queryByText("Profile Details")).not.toBeInTheDocument();
    });
  });

  async function goToPrivacyTab(user) {
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Privacy" })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: "Privacy" }));
  }

  it("Privacy tab shows blocked and muted users", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />);
    await goToPrivacyTab(user);
    await waitFor(() => {
      expect(screen.getByText("Blocked Users")).toBeInTheDocument();
      expect(screen.getByText("Muted Users")).toBeInTheDocument();
      expect(screen.getByText("@blockeduser")).toBeInTheDocument();
      expect(screen.getByText("@muteduser")).toBeInTheDocument();
    });
  });

  it("Privacy tab shows Unblock button for blocked users", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />);
    await goToPrivacyTab(user);
    await waitFor(() => screen.getByText("@blockeduser"));
    expect(screen.getByRole("button", { name: "Unblock" })).toBeInTheDocument();
  });

  it("Privacy tab shows Unmute button for muted users", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />);
    await goToPrivacyTab(user);
    await waitFor(() => screen.getByText("@muteduser"));
    expect(screen.getByRole("button", { name: "Unmute" })).toBeInTheDocument();
  });

  it("clicking Unblock calls blockUser API", async () => {
    const { postsAPI } = await import("../../../api/posts");
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />);
    await goToPrivacyTab(user);
    await waitFor(() => screen.getByRole("button", { name: "Unblock" }));
    await user.click(screen.getByRole("button", { name: "Unblock" }));
    await waitFor(() => {
      expect(postsAPI.blockUser).toHaveBeenCalledWith(2);
    });
  });

  it("clicking Unmute calls muteUser API", async () => {
    const { postsAPI } = await import("../../../api/posts");
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />);
    await goToPrivacyTab(user);
    await waitFor(() => screen.getByRole("button", { name: "Unmute" }));
    await user.click(screen.getByRole("button", { name: "Unmute" }));
    await waitFor(() => {
      expect(postsAPI.muteUser).toHaveBeenCalledWith(3);
    });
  });
});
