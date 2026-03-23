import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EditHistoryModal from "../components/EditHistoryModal";

vi.mock("../store/authStore", () => ({
  useAuthStore: vi.fn((selector) => {
    const state = {
      user: { id: 1, username: "testuser" },
      accessToken: "mock-token",
    };
    return selector(state);
  }),
}));

const mockGetEditHistory = vi.fn();

vi.mock("../api/posts", () => ({
  postsAPI: {
    getEditHistory: (...args) => mockGetEditHistory(...args),
  },
}));

function renderWithProviders(ui) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe("EditHistoryModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows current version", () => {
    mockGetEditHistory.mockResolvedValue({ data: [] });
    renderWithProviders(
      <EditHistoryModal
        postId={1}
        currentContent="Current content"
        onClose={() => {}}
      />
    );
    expect(screen.getByText("Edit History")).toBeInTheDocument();
    expect(screen.getByText("Current version")).toBeInTheDocument();
    expect(screen.getByText("Current content")).toBeInTheDocument();
    expect(screen.getByText("Latest")).toBeInTheDocument();
  });

  it("shows previous versions", async () => {
    mockGetEditHistory.mockResolvedValue({
      data: [
        { id: 1, old_content: "Old content v1", edited_at: new Date().toISOString() },
      ],
    });
    renderWithProviders(
      <EditHistoryModal
        postId={1}
        currentContent="New content"
        onClose={() => {}}
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Old content v1")).toBeInTheDocument();
    });
  });

  it("shows no previous versions message", async () => {
    mockGetEditHistory.mockResolvedValue({ data: [] });
    renderWithProviders(
      <EditHistoryModal
        postId={1}
        currentContent="Content"
        onClose={() => {}}
      />
    );
    await waitFor(() => {
      expect(screen.getByText("No previous versions")).toBeInTheDocument();
    });
  });

  it("calls onClose when close button clicked", async () => {
    mockGetEditHistory.mockResolvedValue({ data: [] });
    const onClose = vi.fn();
    renderWithProviders(
      <EditHistoryModal
        postId={1}
        currentContent="Content"
        onClose={onClose}
      />
    );
    await userEvent.click(screen.getByText("\u00d7"));
    expect(onClose).toHaveBeenCalled();
  });
});
