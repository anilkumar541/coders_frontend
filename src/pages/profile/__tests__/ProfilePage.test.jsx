import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProfilePage from "../ProfilePage";

/* ── Shared mock data ─────────────────────────────────────────────── */

const mockAuthUser = vi.hoisted(() => ({
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

const mockOtherProfile = vi.hoisted(() => ({
  id: 2,
  username: "otheruser",
  email: "other@example.com",
  bio: "I write code",
  first_name: "",
  last_name: "",
  website: "",
  location: "",
  profile_picture: null,
  follower_count: 3,
  following_count: 1,
  post_count: 5,
  is_following: false,
}));

/* ── Store mock ──────────────────────────────────────────────────── */

vi.mock("../../../store/authStore", () => ({
  useAuthStore: vi.fn((selector) => {
    const state = {
      user: mockAuthUser,
      accessToken: "mock-token",
      setUser: vi.fn(),
      loginSuccess: vi.fn(),
      logout: vi.fn(),
    };
    return selector ? selector(state) : state;
  }),
}));

/* ── API mocks ────────────────────────────────────────────────────── */

vi.mock("../../../api/auth", () => ({
  authAPI: {
    getMe: vi.fn().mockResolvedValue({ data: mockAuthUser }),
    updateProfile: vi.fn().mockResolvedValue({ data: mockAuthUser }),
    uploadProfilePicture: vi.fn().mockResolvedValue({ data: mockAuthUser }),
    deleteProfilePicture: vi.fn().mockResolvedValue({ data: mockAuthUser }),
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
    getPublicProfile: vi.fn().mockResolvedValue({ data: mockOtherProfile }),
    toggleFollow: vi.fn().mockResolvedValue({ data: { following: true } }),
    getFollowers: vi.fn().mockResolvedValue({ data: [] }),
    getFollowing: vi.fn().mockResolvedValue({ data: [] }),
    getUserPosts: vi.fn().mockResolvedValue({
      data: { results: [], has_more: false, next_cursor: null },
    }),
    getSavedPosts: vi.fn().mockResolvedValue({
      data: { results: [], has_more: false, next_cursor: null },
    }),
  },
}));

/* ── Render helpers ───────────────────────────────────────────────── */

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

// Render at /profile (own profile)
function renderOwnProfile() {
  return render(
    <QueryClientProvider client={makeQueryClient()}>
      <MemoryRouter initialEntries={["/profile"]}>
        <Routes>
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

// Render at /user/:userId (other user's profile)
function renderOtherProfile(userId = 2) {
  return render(
    <QueryClientProvider client={makeQueryClient()}>
      <MemoryRouter initialEntries={[`/user/${userId}`]}>
        <Routes>
          <Route path="/user/:userId" element={<ProfilePage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/* Own Profile Tests                                                  */
/* ══════════════════════════════════════════════════════════════════ */

describe("ProfilePage — own profile (/profile)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all own-profile tabs including Saved", async () => {
    renderOwnProfile();
    await waitFor(() => {
      // Use exact match to avoid matching "Edit Profile"
      expect(screen.getByRole("button", { name: /^Profile$/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^My Posts$/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^Saved$/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^Privacy$/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^Security$/ })).toBeInTheDocument();
    });
  });

  it("does not show Followers or Following tabs for own profile", async () => {
    renderOwnProfile();
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /^Followers$/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /^Following$/ })).not.toBeInTheDocument();
    });
  });

  it("shows user info in Profile tab by default", async () => {
    renderOwnProfile();
    await waitFor(() => {
      expect(screen.getAllByText("John Doe").length).toBeGreaterThan(0);
      expect(screen.getByText("@testuser")).toBeInTheDocument();
      expect(screen.getAllByText("Hello world").length).toBeGreaterThan(0);
      expect(screen.getByText("New York")).toBeInTheDocument();
    });
  });

  it("shows email in profile details", async () => {
    renderOwnProfile();
    await waitFor(() => {
      expect(screen.getAllByText("test@example.com").length).toBeGreaterThan(0);
    });
  });

  it("shows verified badge for verified users", async () => {
    renderOwnProfile();
    await waitFor(() => {
      expect(screen.getByText("Verified")).toBeInTheDocument();
    });
  });

  it("shows website link in profile details", async () => {
    renderOwnProfile();
    await waitFor(() => {
      const link = screen.getByRole("link", { name: /example\.com/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "https://example.com");
    });
  });

  it("shows Edit Profile button", async () => {
    renderOwnProfile();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Edit Profile/i })).toBeInTheDocument();
    });
  });

  it("clicking Edit Profile shows the edit form", async () => {
    const user = userEvent.setup();
    renderOwnProfile();
    await waitFor(() => screen.getByRole("button", { name: /Edit Profile/i }));
    await user.click(screen.getByRole("button", { name: /Edit Profile/i }));
    expect(screen.getByPlaceholderText("First name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Last name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tell people about yourself/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("https://yoursite.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("City, Country")).toBeInTheDocument();
  });

  it("Cancel in edit form restores view mode", async () => {
    const user = userEvent.setup();
    renderOwnProfile();
    await waitFor(() => screen.getByRole("button", { name: /Edit Profile/i }));
    await user.click(screen.getByRole("button", { name: /Edit Profile/i }));
    await user.click(screen.getByText("Cancel"));
    expect(screen.queryByPlaceholderText("First name")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Edit Profile/i })).toBeInTheDocument();
  });

  it("Save Changes calls updateProfile mutation", async () => {
    const { authAPI } = await import("../../../api/auth");
    const user = userEvent.setup();
    renderOwnProfile();
    await waitFor(() => screen.getByRole("button", { name: /Edit Profile/i }));
    await user.click(screen.getByRole("button", { name: /Edit Profile/i }));
    await user.click(screen.getByText("Save Changes"));
    await waitFor(() => {
      expect(authAPI.updateProfile).toHaveBeenCalled();
    });
  });

  it("switching to My Posts tab hides profile details", async () => {
    const user = userEvent.setup();
    renderOwnProfile();
    await waitFor(() => screen.getByRole("button", { name: /My Posts/i }));
    await user.click(screen.getByRole("button", { name: /My Posts/i }));
    await waitFor(() => {
      expect(screen.queryByText("Profile Details")).not.toBeInTheDocument();
    });
  });

  it("shows Change Photo button for own profile", async () => {
    renderOwnProfile();
    await waitFor(() => {
      // getByText matches the explicit button text (not the aria-label on the hover overlay)
      expect(screen.getByText("Change Photo")).toBeInTheDocument();
    });
  });

  it("Privacy tab shows blocked and muted users", async () => {
    const user = userEvent.setup();
    renderOwnProfile();
    await waitFor(() => screen.getByRole("button", { name: /Privacy/i }));
    await user.click(screen.getByRole("button", { name: /Privacy/i }));
    await waitFor(() => {
      expect(screen.getByText("Blocked Users")).toBeInTheDocument();
      expect(screen.getByText("Muted Users")).toBeInTheDocument();
      expect(screen.getByText("@blockeduser")).toBeInTheDocument();
      expect(screen.getByText("@muteduser")).toBeInTheDocument();
    });
  });

  it("Privacy tab shows Unblock button for blocked users", async () => {
    const user = userEvent.setup();
    renderOwnProfile();
    await waitFor(() => screen.getByRole("button", { name: /Privacy/i }));
    await user.click(screen.getByRole("button", { name: /Privacy/i }));
    await waitFor(() => screen.getByText("@blockeduser"));
    expect(screen.getByRole("button", { name: "Unblock" })).toBeInTheDocument();
  });

  it("Privacy tab shows Unmute button for muted users", async () => {
    const user = userEvent.setup();
    renderOwnProfile();
    await waitFor(() => screen.getByRole("button", { name: /Privacy/i }));
    await user.click(screen.getByRole("button", { name: /Privacy/i }));
    await waitFor(() => screen.getByText("@muteduser"));
    expect(screen.getByRole("button", { name: "Unmute" })).toBeInTheDocument();
  });

  it("clicking Unblock calls blockUser API", async () => {
    const { postsAPI } = await import("../../../api/posts");
    const user = userEvent.setup();
    renderOwnProfile();
    await waitFor(() => screen.getByRole("button", { name: /Privacy/i }));
    await user.click(screen.getByRole("button", { name: /Privacy/i }));
    await waitFor(() => screen.getByRole("button", { name: "Unblock" }));
    await user.click(screen.getByRole("button", { name: "Unblock" }));
    await waitFor(() => {
      expect(postsAPI.blockUser).toHaveBeenCalledWith(2);
    });
  });

  it("clicking Unmute calls muteUser API", async () => {
    const { postsAPI } = await import("../../../api/posts");
    const user = userEvent.setup();
    renderOwnProfile();
    await waitFor(() => screen.getByRole("button", { name: /Privacy/i }));
    await user.click(screen.getByRole("button", { name: /Privacy/i }));
    await waitFor(() => screen.getByRole("button", { name: "Unmute" }));
    await user.click(screen.getByRole("button", { name: "Unmute" }));
    await waitFor(() => {
      expect(postsAPI.muteUser).toHaveBeenCalledWith(3);
    });
  });
});

/* ══════════════════════════════════════════════════════════════════ */
/* Other Profile Tests                                                */
/* ══════════════════════════════════════════════════════════════════ */

describe("ProfilePage — other user (/user/:userId)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders other user's username and bio", async () => {
    const { postsAPI } = await import("../../../api/posts");
    postsAPI.getPublicProfile.mockResolvedValue({ data: mockOtherProfile });
    renderOtherProfile();
    await screen.findByText("@otheruser");
    expect(screen.getAllByText("otheruser").length).toBeGreaterThan(0);
    expect(screen.getAllByText("I write code").length).toBeGreaterThan(0);
  });

  it("shows follower/following/post counts", async () => {
    const { postsAPI } = await import("../../../api/posts");
    postsAPI.getPublicProfile.mockResolvedValue({ data: mockOtherProfile });
    renderOtherProfile();
    await screen.findByText("@otheruser");
    expect(screen.getByText("3")).toBeInTheDocument(); // follower_count
    expect(screen.getByText("1")).toBeInTheDocument(); // following_count
    expect(screen.getByText("5")).toBeInTheDocument(); // post_count
  });

  it("shows Posts, Followers, Following tabs (not Privacy or Security)", async () => {
    const { postsAPI } = await import("../../../api/posts");
    postsAPI.getPublicProfile.mockResolvedValue({ data: mockOtherProfile });
    renderOtherProfile();
    await screen.findByText("@otheruser");
    expect(screen.getByRole("button", { name: /^Posts$/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Followers$/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Following$/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Privacy/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Security/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /My Posts/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Saved$/i })).not.toBeInTheDocument();
  });

  it("does not show Edit Profile button for other user", async () => {
    const { postsAPI } = await import("../../../api/posts");
    postsAPI.getPublicProfile.mockResolvedValue({ data: mockOtherProfile });
    renderOtherProfile();
    await screen.findByText("@otheruser");
    expect(screen.queryByRole("button", { name: /Edit Profile/i })).not.toBeInTheDocument();
  });

  it("does not show Change Photo button for other user", async () => {
    const { postsAPI } = await import("../../../api/posts");
    postsAPI.getPublicProfile.mockResolvedValue({ data: mockOtherProfile });
    renderOtherProfile();
    await screen.findByText("@otheruser");
    expect(screen.queryByRole("button", { name: /Change Photo/i })).not.toBeInTheDocument();
  });

  it("shows Follow button when not following", async () => {
    const { postsAPI } = await import("../../../api/posts");
    postsAPI.getPublicProfile.mockResolvedValue({ data: { ...mockOtherProfile, is_following: false } });
    renderOtherProfile();
    await screen.findByText("@otheruser");
    expect(screen.getByRole("button", { name: /^Follow$/ })).toBeInTheDocument();
  });

  it("shows Unfollow button when already following", async () => {
    const { postsAPI } = await import("../../../api/posts");
    postsAPI.getPublicProfile.mockResolvedValue({ data: { ...mockOtherProfile, is_following: true } });
    renderOtherProfile();
    await screen.findByText("@otheruser");
    expect(screen.getByRole("button", { name: /^Unfollow$/ })).toBeInTheDocument();
  });

  it("clicking Follow calls toggleFollow API", async () => {
    const { postsAPI } = await import("../../../api/posts");
    postsAPI.getPublicProfile.mockResolvedValue({ data: mockOtherProfile });
    postsAPI.toggleFollow.mockResolvedValue({ data: { following: true } });
    const user = userEvent.setup();
    renderOtherProfile();
    await screen.findByText("@otheruser");
    await user.click(screen.getByRole("button", { name: /^Follow$/ }));
    await waitFor(() => {
      expect(postsAPI.toggleFollow).toHaveBeenCalledWith(mockOtherProfile.id);
    });
  });

  it("shows 'No followers yet' on Followers tab when empty", async () => {
    const { postsAPI } = await import("../../../api/posts");
    postsAPI.getPublicProfile.mockResolvedValue({ data: mockOtherProfile });
    postsAPI.getFollowers.mockResolvedValue({ data: [] });
    const user = userEvent.setup();
    renderOtherProfile();
    await screen.findByText("@otheruser");
    await user.click(screen.getByRole("button", { name: /^Followers$/ }));
    expect(await screen.findByText("No followers yet.")).toBeInTheDocument();
  });

  it("shows 'Not following anyone yet' on Following tab when empty", async () => {
    const { postsAPI } = await import("../../../api/posts");
    postsAPI.getPublicProfile.mockResolvedValue({ data: mockOtherProfile });
    postsAPI.getFollowing.mockResolvedValue({ data: [] });
    const user = userEvent.setup();
    renderOtherProfile();
    await screen.findByText("@otheruser");
    await user.click(screen.getByRole("button", { name: /^Following$/ }));
    expect(await screen.findByText("Not following anyone yet.")).toBeInTheDocument();
  });

  it("shows 'No public posts yet' on Posts tab when empty", async () => {
    const { postsAPI } = await import("../../../api/posts");
    postsAPI.getPublicProfile.mockResolvedValue({ data: mockOtherProfile });
    postsAPI.getUserPosts.mockResolvedValue({
      data: { results: [], has_more: false, next_cursor: null },
    });
    const user = userEvent.setup();
    renderOtherProfile();
    await screen.findByText("@otheruser");
    await user.click(screen.getByRole("button", { name: /^Posts$/ }));
    expect(await screen.findByText(/No posts/i)).toBeInTheDocument();
  });

  it("shows 'User not found' when profile fetch fails", async () => {
    const { postsAPI } = await import("../../../api/posts");
    postsAPI.getPublicProfile.mockRejectedValue(new Error("Not found"));
    renderOtherProfile();
    expect(await screen.findByText("User not found.")).toBeInTheDocument();
  });

  it("shows initials avatar when no profile picture", async () => {
    const { postsAPI } = await import("../../../api/posts");
    postsAPI.getPublicProfile.mockResolvedValue({ data: mockOtherProfile });
    renderOtherProfile();
    await screen.findByText("@otheruser");
    // "OT" initials from "otheruser"
    expect(screen.getByText("OT")).toBeInTheDocument();
  });

  it("does not show email for other user", async () => {
    const { postsAPI } = await import("../../../api/posts");
    postsAPI.getPublicProfile.mockResolvedValue({ data: mockOtherProfile });
    renderOtherProfile();
    await screen.findByText("@otheruser");
    expect(screen.queryByText("other@example.com")).not.toBeInTheDocument();
  });
});
