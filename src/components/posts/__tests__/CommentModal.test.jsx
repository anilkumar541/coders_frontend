import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CommentModal from "../CommentModal";

// ── Mock CommentSection so we don't need the full API ────────────────────────
vi.mock("../CommentSection", () => ({
  default: ({ postId, targetCommentId, targetParentId }) => (
    <div
      data-testid="comment-section"
      data-post-id={postId}
      data-target-comment={targetCommentId}
      data-target-parent={targetParentId}
    />
  ),
}));

// ── Helpers ──────────────────────────────────────────────────────────────────
const mockPost = {
  id: "post-123",
  comment_count: 4,
  content: "Test post content",
};

function renderModal({
  post = mockPost,
  onClose = vi.fn(),
  targetCommentId,
  targetParentId,
} = {}) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return {
    onClose,
    ...render(
      <QueryClientProvider client={qc}>
        <CommentModal
          post={post}
          onClose={onClose}
          targetCommentId={targetCommentId}
          targetParentId={targetParentId}
        />
      </QueryClientProvider>
    ),
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────
describe("CommentModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the 'Comments' heading", () => {
    renderModal();
    expect(screen.getByText("Comments")).toBeInTheDocument();
  });

  it("shows comment count when > 0", () => {
    renderModal();
    expect(screen.getByText("4 comments")).toBeInTheDocument();
  });

  it("shows singular 'comment' for count of 1", () => {
    renderModal({ post: { ...mockPost, comment_count: 1 } });
    expect(screen.getByText("1 comment")).toBeInTheDocument();
  });

  it("hides comment count subtext when count is 0", () => {
    renderModal({ post: { ...mockPost, comment_count: 0 } });
    // The count subtext "0 comments" should not appear, only the heading "Comments"
    expect(screen.queryByText(/0 comment/i)).toBeNull();
  });

  it("renders close button with correct aria-label", () => {
    renderModal();
    expect(screen.getByLabelText("Close comments")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const { onClose } = renderModal();
    await userEvent.click(screen.getByLabelText("Close comments"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key is pressed", () => {
    const { onClose } = renderModal();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when clicking the overlay background", () => {
    const { onClose, container } = renderModal();
    // The overlay is the outermost div (fixed inset-0)
    const overlay = container.firstChild;
    fireEvent.click(overlay, { target: overlay });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders CommentSection with correct postId", () => {
    renderModal();
    const section = screen.getByTestId("comment-section");
    expect(section).toHaveAttribute("data-post-id", "post-123");
  });

  it("passes targetCommentId to CommentSection", () => {
    renderModal({ targetCommentId: "cmt-55" });
    const section = screen.getByTestId("comment-section");
    expect(section).toHaveAttribute("data-target-comment", "cmt-55");
  });

  it("passes targetParentId to CommentSection", () => {
    renderModal({ targetCommentId: "cmt-55", targetParentId: "parent-10" });
    const section = screen.getByTestId("comment-section");
    expect(section).toHaveAttribute("data-target-parent", "parent-10");
  });

  it("does not pass targetCommentId when not provided", () => {
    renderModal();
    const section = screen.getByTestId("comment-section");
    expect(section).not.toHaveAttribute("data-target-comment");
  });

  it("locks body scroll on mount", () => {
    renderModal();
    expect(document.body.style.position).toBe("fixed");
  });

  it("restores body scroll on unmount", () => {
    const { unmount } = renderModal().unmount
      ? renderModal()
      : { unmount: renderModal().unmount };
    unmount();
    expect(document.body.style.position).toBe("");
  });

  it("removes Escape key listener on unmount", () => {
    const { onClose, unmount } = renderModal();
    unmount();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });
});
