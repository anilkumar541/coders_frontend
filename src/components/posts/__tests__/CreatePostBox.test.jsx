import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CreatePostBox from "../CreatePostBox";

vi.mock("../../../api/posts", () => ({
  postsAPI: {
    createPost: vi.fn(),
    uploadMedia: vi.fn(),
  },
}));

vi.mock("../../../store/authStore", () => ({
  useAuthStore: vi.fn((selector) => {
    const state = {
      user: { id: 1, username: "testuser" },
      accessToken: "mock-token",
    };
    return selector(state);
  }),
}));

function renderWithProviders(ui) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe("CreatePostBox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders textarea and post button", () => {
    renderWithProviders(<CreatePostBox />);
    expect(screen.getByPlaceholderText("What's on your mind?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /post/i })).toBeInTheDocument();
  });

  it("disables post button when empty", () => {
    renderWithProviders(<CreatePostBox />);
    expect(screen.getByRole("button", { name: /post/i })).toBeDisabled();
  });

  it("enables post button with valid content", async () => {
    renderWithProviders(<CreatePostBox />);
    await userEvent.type(
      screen.getByPlaceholderText("What's on your mind?"),
      "Hello world"
    );
    expect(screen.getByRole("button", { name: /post/i })).not.toBeDisabled();
  });

  it("has visibility selector with options", () => {
    renderWithProviders(<CreatePostBox />);
    const select = document.querySelector("select");
    expect(select).toBeInTheDocument();
    expect(select.value).toBe("public");
  });

  it("disables post button when only whitespace", async () => {
    renderWithProviders(<CreatePostBox />);
    await userEvent.type(
      screen.getByPlaceholderText("What's on your mind?"),
      "   "
    );
    expect(screen.getByRole("button", { name: /post/i })).toBeDisabled();
  });

  it("renders add media button", () => {
    renderWithProviders(<CreatePostBox />);
    expect(screen.getByLabelText("Add media")).toBeInTheDocument();
  });

  it("saves draft to localStorage after typing", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderWithProviders(<CreatePostBox />);
    await userEvent.type(
      screen.getByPlaceholderText("What's on your mind?"),
      "Draft content"
    );
    vi.advanceTimersByTime(1500);
    const draft = JSON.parse(localStorage.getItem("coders_draft_post"));
    expect(draft).not.toBeNull();
    expect(draft.content).toBe("Draft content");
    vi.useRealTimers();
  });

  it("restores draft from localStorage", () => {
    localStorage.setItem(
      "coders_draft_post",
      JSON.stringify({ content: "Saved draft", visibility: "public", savedAt: Date.now() })
    );
    renderWithProviders(<CreatePostBox />);
    expect(screen.getByPlaceholderText("What's on your mind?")).toHaveValue("Saved draft");
    expect(screen.getByText("Draft restored")).toBeInTheDocument();
  });

  it("does not upload media on file selection (deferred upload)", async () => {
    const { postsAPI } = await import("../../../api/posts");
    renderWithProviders(<CreatePostBox />);

    const file = new File(["hello"], "test.png", { type: "image/png" });
    const input = document.querySelector('input[type="file"]');
    await userEvent.upload(input, file);

    expect(postsAPI.uploadMedia).not.toHaveBeenCalled();
  });

  it("renders post button with send icon text", () => {
    renderWithProviders(<CreatePostBox />);
    const btn = screen.getByRole("button", { name: /post/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toBeDisabled();
  });
});
