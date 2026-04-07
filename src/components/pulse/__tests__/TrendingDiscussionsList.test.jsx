import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TrendingDiscussionsList from "../TrendingDiscussionsList";

function makeDiscussion(overrides = {}) {
  return {
    id: "post-1",
    title: "OpenAI quietly removed the free tier",
    url: "https://reddit.com/r/ChatGPT/abc",
    subreddit: "r/ChatGPT",
    score: 1200,
    comment_count: 489,
    created_at: new Date().toISOString(),
    velocity_score: 120,
    sentiment_label: "negative",
    sentiment_compound: -0.72,
    source: "reddit",
    entity_slug: "openai",
    entity_name: "OpenAI",
    ...overrides,
  };
}

describe("TrendingDiscussionsList", () => {
  it("renders empty state when no discussions", () => {
    render(<TrendingDiscussionsList discussions={[]} />);
    expect(screen.getByText(/no trending discussions/i)).toBeInTheDocument();
  });

  it("renders discussion titles", () => {
    const items = [makeDiscussion(), makeDiscussion({ id: "post-2", title: "Llama 4 released" })];
    render(<TrendingDiscussionsList discussions={items} />);
    expect(screen.getByText("OpenAI quietly removed the free tier")).toBeInTheDocument();
    expect(screen.getByText("Llama 4 released")).toBeInTheDocument();
  });

  it("renders subreddit name", () => {
    render(<TrendingDiscussionsList discussions={[makeDiscussion()]} />);
    expect(screen.getByText("r/ChatGPT")).toBeInTheDocument();
  });

  it("renders score", () => {
    render(<TrendingDiscussionsList discussions={[makeDiscussion({ score: 1200 })]} />);
    expect(screen.getByText(/1\.2k upvotes/i)).toBeInTheDocument();
  });

  it("renders comment count", () => {
    render(<TrendingDiscussionsList discussions={[makeDiscussion({ comment_count: 489 })]} />);
    expect(screen.getByText(/489 comments/i)).toBeInTheDocument();
  });

  it("renders rank numbers", () => {
    const items = [makeDiscussion(), makeDiscussion({ id: "2", title: "Second post" })];
    render(<TrendingDiscussionsList discussions={items} />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
  });

  it("renders negative sentiment badge", () => {
    render(<TrendingDiscussionsList discussions={[makeDiscussion({ sentiment_label: "negative", sentiment_compound: -0.72 })]} />);
    expect(screen.getByText(/negative/i)).toBeInTheDocument();
  });

  it("renders positive sentiment badge", () => {
    render(<TrendingDiscussionsList discussions={[makeDiscussion({ sentiment_label: "positive", sentiment_compound: 0.78 })]} />);
    expect(screen.getByText(/positive/i)).toBeInTheDocument();
  });

  it("renders HackerNews source label", () => {
    render(<TrendingDiscussionsList discussions={[makeDiscussion({ source: "hn", subreddit: "" })]} />);
    expect(screen.getByText("HackerNews")).toBeInTheDocument();
  });

  it("renders title as a link", () => {
    render(<TrendingDiscussionsList discussions={[makeDiscussion()]} />);
    const link = screen.getByRole("link", { name: "OpenAI quietly removed the free tier" });
    expect(link).toHaveAttribute("href", "https://reddit.com/r/ChatGPT/abc");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
