import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import MediaGallery from "../MediaGallery";

const makeMedia = (overrides = {}) => ({
  id: 1,
  media_type: "image",
  file_name: "test.jpg",
  file_size: 1024,
  cdn_url: "https://cdn.test/image1.webp",
  thumbnail_url: "https://cdn.test/thumb1.webp",
  width: 800,
  height: 600,
  duration: null,
  order: 0,
  ...overrides,
});

describe("MediaGallery", () => {
  it("returns null when no media", () => {
    const { container } = render(<MediaGallery media={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when media is undefined", () => {
    const { container } = render(<MediaGallery media={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders single image directly", () => {
    const media = [makeMedia()];
    const { container } = render(<MediaGallery media={media} />);
    const imgs = container.querySelectorAll("img");
    expect(imgs).toHaveLength(1);
    expect(imgs[0].src).toContain("image1.webp");
  });

  it("clicking single image does nothing (no lightbox)", async () => {
    const media = [makeMedia()];
    const { container } = render(<MediaGallery media={media} />);
    await userEvent.click(container.querySelector("img"));
    expect(screen.queryByLabelText("Close lightbox")).not.toBeInTheDocument();
  });

  it("renders carousel for multiple images", () => {
    const media = [
      makeMedia({ id: 1, cdn_url: "https://cdn.test/a.webp" }),
      makeMedia({ id: 2, cdn_url: "https://cdn.test/b.webp" }),
    ];
    const { container } = render(<MediaGallery media={media} />);
    const imgs = container.querySelectorAll("img");
    expect(imgs).toHaveLength(2);
  });

  it("shows counter badge for multiple items", () => {
    const media = [makeMedia({ id: 1 }), makeMedia({ id: 2 }), makeMedia({ id: 3 })];
    render(<MediaGallery media={media} />);
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("shows dot indicators for multiple items", () => {
    const media = [makeMedia({ id: 1 }), makeMedia({ id: 2 })];
    render(<MediaGallery media={media} />);
    const dots = screen.getAllByLabelText(/Go to slide/);
    expect(dots).toHaveLength(2);
  });

  it("navigates with arrow buttons", async () => {
    const media = [makeMedia({ id: 1 }), makeMedia({ id: 2 }), makeMedia({ id: 3 })];
    render(<MediaGallery media={media} />);
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Next"));
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Previous"));
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("navigates with dot indicators", async () => {
    const media = [makeMedia({ id: 1 }), makeMedia({ id: 2 }), makeMedia({ id: 3 })];
    render(<MediaGallery media={media} />);
    await userEvent.click(screen.getByLabelText("Go to slide 3"));
    expect(screen.getByText("3 / 3")).toBeInTheDocument();
  });

  it("renders video element for single video media", () => {
    const media = [makeMedia({ id: 1, media_type: "video", cdn_url: "https://cdn.test/clip.mp4" })];
    const { container } = render(<MediaGallery media={media} />);
    expect(container.querySelector("video")).toBeInTheDocument();
  });

  it("renders video elements in carousel", () => {
    const media = [
      makeMedia({ id: 1, media_type: "video", cdn_url: "https://cdn.test/clip.mp4" }),
      makeMedia({ id: 2 }),
    ];
    const { container } = render(<MediaGallery media={media} />);
    expect(container.querySelector("video")).toBeInTheDocument();
  });

  it("has rounded style on single media container", () => {
    const media = [makeMedia()];
    const { container } = render(<MediaGallery media={media} />);
    const wrapper = container.firstChild;
    expect(wrapper.className).toContain("rounded-xl");
  });

  it("has rounded style on carousel container", () => {
    const media = [makeMedia({ id: 1 }), makeMedia({ id: 2 })];
    const { container } = render(<MediaGallery media={media} />);
    // The inner carousel div should have rounded-xl
    const roundedEl = container.querySelector(".rounded-xl");
    expect(roundedEl).toBeInTheDocument();
  });
});
