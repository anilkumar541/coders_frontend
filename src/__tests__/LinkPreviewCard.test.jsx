import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import LinkPreviewCard from "../components/LinkPreviewCard";

describe("LinkPreviewCard", () => {
  it("renders nothing when no preview", () => {
    const { container } = render(<LinkPreviewCard preview={null} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when preview has no title", () => {
    const { container } = render(
      <LinkPreviewCard preview={{ url: "https://example.com", title: "" }} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders title and domain", () => {
    render(
      <LinkPreviewCard
        preview={{
          url: "https://example.com/article",
          title: "Test Article",
          description: "A great article",
          domain: "example.com",
          image_url: "",
        }}
      />
    );
    expect(screen.getByText("Test Article")).toBeInTheDocument();
    expect(screen.getByText("A great article")).toBeInTheDocument();
    expect(screen.getByText("example.com")).toBeInTheDocument();
  });

  it("renders as a link to the URL", () => {
    render(
      <LinkPreviewCard
        preview={{
          url: "https://example.com/article",
          title: "Test",
          domain: "example.com",
        }}
      />
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com/article");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders image when image_url provided", () => {
    render(
      <LinkPreviewCard
        preview={{
          url: "https://example.com",
          title: "With Image",
          image_url: "https://example.com/img.jpg",
          domain: "example.com",
        }}
      />
    );
    const img = document.querySelector("img");
    expect(img).toHaveAttribute("src", "https://example.com/img.jpg");
  });
});
