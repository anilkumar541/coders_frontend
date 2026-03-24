import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MediaUploader from "../MediaUploader";

vi.mock("../../../api/posts", () => ({
  postsAPI: {
    uploadMedia: vi.fn(),
  },
}));

describe("MediaUploader", () => {
  let files;
  let setFiles;

  beforeEach(() => {
    vi.clearAllMocks();
    files = [];
    setFiles = vi.fn((updater) => {
      if (typeof updater === "function") {
        files = updater(files);
      } else {
        files = updater;
      }
    });
  });

  it("renders add media button when no files", () => {
    render(<MediaUploader files={[]} setFiles={setFiles} />);
    expect(screen.getByLabelText("Add media")).toBeInTheDocument();
  });

  it("has a hidden file input", () => {
    const { container } = render(<MediaUploader files={[]} setFiles={setFiles} />);
    const input = container.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
    expect(input.className).toContain("hidden");
  });

  it("accepts correct file types", () => {
    const { container } = render(<MediaUploader files={[]} setFiles={setFiles} />);
    const input = container.querySelector('input[type="file"]');
    expect(input.accept).toContain("image/jpeg");
    expect(input.accept).toContain("video/mp4");
  });

  it("allows multiple file selection", () => {
    const { container } = render(<MediaUploader files={[]} setFiles={setFiles} />);
    const input = container.querySelector('input[type="file"]');
    expect(input.multiple).toBe(true);
  });

  it("shows previews for uploaded files", () => {
    const mockFiles = [
      {
        localPreview: "blob:test",
        name: "photo.jpg",
        mediaType: "image",
        uploading: false,
        progress: 100,
        mediaId: 1,
        cdnUrl: "https://cdn.test/photo.webp",
        thumbnailUrl: "https://cdn.test/thumb.webp",
        error: null,
      },
    ];
    render(<MediaUploader files={mockFiles} setFiles={setFiles} />);
    const img = screen.getByAltText("photo.jpg");
    expect(img).toBeInTheDocument();
  });

  it("shows upload progress overlay", () => {
    const mockFiles = [
      {
        localPreview: "blob:test",
        name: "photo.jpg",
        mediaType: "image",
        uploading: true,
        progress: 45,
        mediaId: null,
        cdnUrl: null,
        thumbnailUrl: null,
        error: null,
      },
    ];
    render(<MediaUploader files={mockFiles} setFiles={setFiles} />);
    expect(screen.getByText("45%")).toBeInTheDocument();
  });

  it("shows error overlay for failed uploads", () => {
    const mockFiles = [
      {
        localPreview: "blob:test",
        name: "photo.jpg",
        mediaType: "image",
        uploading: false,
        progress: 0,
        mediaId: null,
        cdnUrl: null,
        thumbnailUrl: null,
        error: "Upload failed.",
      },
    ];
    render(<MediaUploader files={mockFiles} setFiles={setFiles} />);
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("shows remove button for non-uploading files", () => {
    const mockFiles = [
      {
        localPreview: "blob:test",
        name: "photo.jpg",
        mediaType: "image",
        uploading: false,
        progress: 100,
        mediaId: 1,
        cdnUrl: "https://cdn.test/photo.webp",
        thumbnailUrl: null,
        error: null,
      },
    ];
    render(<MediaUploader files={mockFiles} setFiles={setFiles} />);
    expect(screen.getByLabelText("Remove photo.jpg")).toBeInTheDocument();
  });

  it("calls setFiles to remove file when remove button clicked", async () => {
    const mockFiles = [
      {
        localPreview: "blob:test",
        name: "photo.jpg",
        mediaType: "image",
        uploading: false,
        progress: 100,
        mediaId: 1,
        cdnUrl: "https://cdn.test/photo.webp",
        thumbnailUrl: null,
        error: null,
      },
    ];
    const mockSetFiles = vi.fn();
    render(<MediaUploader files={mockFiles} setFiles={mockSetFiles} />);
    await userEvent.click(screen.getByLabelText("Remove photo.jpg"));
    expect(mockSetFiles).toHaveBeenCalled();
  });

  it("hides add media button when at max files", () => {
    const maxFiles = Array.from({ length: 10 }, (_, i) => ({
      localPreview: `blob:test-${i}`,
      name: `photo${i}.jpg`,
      mediaType: "image",
      uploading: false,
      progress: 100,
      mediaId: i + 1,
      cdnUrl: `https://cdn.test/photo${i}.webp`,
      thumbnailUrl: null,
      error: null,
    }));
    render(<MediaUploader files={maxFiles} setFiles={setFiles} />);
    expect(screen.queryByLabelText("Add media")).not.toBeInTheDocument();
  });

  it("renders video preview for video files", () => {
    const mockFiles = [
      {
        localPreview: "blob:video-test",
        name: "clip.mp4",
        mediaType: "video",
        uploading: false,
        progress: 100,
        mediaId: 1,
        cdnUrl: "https://cdn.test/clip.mp4",
        thumbnailUrl: null,
        error: null,
      },
    ];
    const { container } = render(<MediaUploader files={mockFiles} setFiles={setFiles} />);
    const video = container.querySelector("video");
    expect(video).toBeInTheDocument();
    expect(video.src).toContain("blob:video-test");
  });
});
