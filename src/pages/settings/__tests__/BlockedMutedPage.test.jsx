import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BlockedMutedPage from "../BlockedMutedPage";

vi.mock("../../../api/posts", () => ({
  postsAPI: {
    getBlockedUsers: vi.fn(),
    getMutedUsers: vi.fn(),
    blockUser: vi.fn(),
    muteUser: vi.fn(),
  },
}));

// Avatar uses authStore — stub it out
vi.mock("../../../store/authStore", () => ({
  useAuthStore: vi.fn((selector) =>
    selector({ user: { id: 1, username: "me" }, accessToken: "token" })
  ),
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <BlockedMutedPage />
    </QueryClientProvider>
  );
}

describe("BlockedMutedPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page heading", async () => {
    const { postsAPI } = await import("../../../api/posts");
    postsAPI.getBlockedUsers.mockResolvedValue({ data: [] });
    postsAPI.getMutedUsers.mockResolvedValue({ data: [] });
    renderPage();
    expect(screen.getByText("Privacy Settings")).toBeInTheDocument();
  });

  it("shows empty state when no blocked users", async () => {
    const { postsAPI } = await import("../../../api/posts");
    postsAPI.getBlockedUsers.mockResolvedValue({ data: [] });
    postsAPI.getMutedUsers.mockResolvedValue({ data: [] });
    renderPage();
    expect(
      await screen.findByText("You haven't blocked anyone.")
    ).toBeInTheDocument();
  });

  it("shows empty state when no muted users", async () => {
    const { postsAPI } = await import("../../../api/posts");
    postsAPI.getBlockedUsers.mockResolvedValue({ data: [] });
    postsAPI.getMutedUsers.mockResolvedValue({ data: [] });
    renderPage();
    expect(
      await screen.findByText("You haven't muted anyone.")
    ).toBeInTheDocument();
  });

  it("lists blocked users with Unblock button", async () => {
    const { postsAPI } = await import("../../../api/posts");
    postsAPI.getBlockedUsers.mockResolvedValue({
      data: [{ id: 2, username: "blockeduser", profile_picture: null }],
    });
    postsAPI.getMutedUsers.mockResolvedValue({ data: [] });
    renderPage();
    expect(await screen.findByText("blockeduser")).toBeInTheDocument();
    expect(screen.getByText("Unblock")).toBeInTheDocument();
  });

  it("lists muted users with Unmute button", async () => {
    const { postsAPI } = await import("../../../api/posts");
    postsAPI.getBlockedUsers.mockResolvedValue({ data: [] });
    postsAPI.getMutedUsers.mockResolvedValue({
      data: [{ id: 3, username: "muteduser", profile_picture: null }],
    });
    renderPage();
    expect(await screen.findByText("muteduser")).toBeInTheDocument();
    expect(screen.getByText("Unmute")).toBeInTheDocument();
  });

  it("calls blockUser API when Unblock is clicked", async () => {
    const user = userEvent.setup();
    const { postsAPI } = await import("../../../api/posts");
    postsAPI.getBlockedUsers.mockResolvedValue({
      data: [{ id: 2, username: "blockeduser", profile_picture: null }],
    });
    postsAPI.getMutedUsers.mockResolvedValue({ data: [] });
    postsAPI.blockUser.mockResolvedValue({ data: { blocked: false } });
    renderPage();
    const btn = await screen.findByText("Unblock");
    await user.click(btn);
    expect(postsAPI.blockUser).toHaveBeenCalledWith(2);
  });

  it("calls muteUser API when Unmute is clicked", async () => {
    const user = userEvent.setup();
    const { postsAPI } = await import("../../../api/posts");
    postsAPI.getBlockedUsers.mockResolvedValue({ data: [] });
    postsAPI.getMutedUsers.mockResolvedValue({
      data: [{ id: 3, username: "muteduser", profile_picture: null }],
    });
    postsAPI.muteUser.mockResolvedValue({ data: { muted: false } });
    renderPage();
    const btn = await screen.findByText("Unmute");
    await user.click(btn);
    expect(postsAPI.muteUser).toHaveBeenCalledWith(3);
  });

  it("shows multiple blocked and muted users", async () => {
    const { postsAPI } = await import("../../../api/posts");
    postsAPI.getBlockedUsers.mockResolvedValue({
      data: [
        { id: 2, username: "blocked1", profile_picture: null },
        { id: 3, username: "blocked2", profile_picture: null },
      ],
    });
    postsAPI.getMutedUsers.mockResolvedValue({
      data: [{ id: 4, username: "muted1", profile_picture: null }],
    });
    renderPage();
    expect(await screen.findByText("blocked1")).toBeInTheDocument();
    expect(screen.getByText("blocked2")).toBeInTheDocument();
    expect(screen.getByText("muted1")).toBeInTheDocument();
    expect(screen.getAllByText("Unblock")).toHaveLength(2);
    expect(screen.getByText("Unmute")).toBeInTheDocument();
  });
});
