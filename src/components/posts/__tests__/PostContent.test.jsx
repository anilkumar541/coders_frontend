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

  it("renders mentions as clickable links (falls back to username when no mentions prop)", () => {
    renderWithRouter(<PostContent content="Hello @alice" />);
    const link = screen.getByText("@alice");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/user/alice");
    expect(link.className).toContain("text-indigo-600");
  });

  it("renders mentions with ID-based link when mentions prop provided", () => {
    renderWithRouter(
      <PostContent content="Hello @alice" mentions={[{ id: 42, username: "alice" }]} />
    );
    expect(screen.getByText("@alice")).toHaveAttribute("href", "/user/42");
  });

  it("renders mixed content with hashtags and mentions", () => {
    renderWithRouter(
      <PostContent
        content="Check #python by @alice today"
        mentions={[{ id: 42, username: "alice" }]}
      />
    );
    expect(screen.getByText("#python")).toHaveAttribute("href", "/hashtag/python");
    expect(screen.getByText("@alice")).toHaveAttribute("href", "/user/42");
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

  it("renders a fenced code block with a Copy button", () => {
    renderWithRouter(
      <PostContent content={"```javascript\nconsole.log('hello')\n```"} />
    );
    expect(screen.getByText("Copy")).toBeInTheDocument();
    expect(screen.getByText("javascript")).toBeInTheDocument();
  });

  it("renders text before and after a code block", () => {
    renderWithRouter(
      <PostContent content={"Here is code:\n```python\nprint('hi')\n```\nDone."} />
    );
    expect(screen.getByText(/Here is code/)).toBeInTheDocument();
    expect(screen.getByText(/Done/)).toBeInTheDocument();
    expect(screen.getByText("Copy")).toBeInTheDocument();
  });

  it("does not apply See more truncation to posts with code blocks", () => {
    const longCodePost = "```python\n" + "x = 1\n".repeat(50) + "```";
    renderWithRouter(<PostContent content={longCodePost} />);
    expect(screen.queryByText("See more")).not.toBeInTheDocument();
  });
});
