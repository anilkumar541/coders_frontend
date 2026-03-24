import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import PostContent from "../PostContent";

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("PostContent", () => {
  it("renders plain text", () => {
    renderWithRouter(<PostContent content="Hello world" />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders hashtags as clickable links", () => {
    renderWithRouter(<PostContent content="Hello #python world" />);
    const link = screen.getByText("#python");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/hashtag/python");
    expect(link.className).toContain("text-indigo-600");
  });

  it("renders mentions as clickable links", () => {
    renderWithRouter(<PostContent content="Hello @alice" />);
    const link = screen.getByText("@alice");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/user/alice");
    expect(link.className).toContain("text-indigo-600");
  });

  it("renders mixed content with hashtags and mentions", () => {
    renderWithRouter(
      <PostContent content="Check #python by @alice today" />
    );
    expect(screen.getByText("#python")).toHaveAttribute("href", "/hashtag/python");
    expect(screen.getByText("@alice")).toHaveAttribute("href", "/user/alice");
  });

  it("normalizes hashtag links to lowercase", () => {
    renderWithRouter(<PostContent content="Hello #Python" />);
    const link = screen.getByText("#Python");
    expect(link).toHaveAttribute("href", "/hashtag/python");
  });

  it("returns null for empty content", () => {
    const { container } = renderWithRouter(<PostContent content="" />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null for undefined content", () => {
    const { container } = renderWithRouter(<PostContent content={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it("handles multiple hashtags", () => {
    renderWithRouter(
      <PostContent content="#python #django #react" />
    );
    expect(screen.getByText("#python")).toBeInTheDocument();
    expect(screen.getByText("#django")).toBeInTheDocument();
    expect(screen.getByText("#react")).toBeInTheDocument();
  });
});
