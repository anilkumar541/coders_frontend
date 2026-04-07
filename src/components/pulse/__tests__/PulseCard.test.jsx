import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import PulseCard from "../PulseCard";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

function makeEntity(overrides = {}) {
  return {
    slug: "openai",
    name: "OpenAI",
    color: "#10a37f",
    pulse_label: "bullish",
    avg_compound: 0.3,
    positive_pct: 60,
    neutral_pct: 25,
    negative_pct: 15,
    mention_count: 342,
    ...overrides,
  };
}

function renderCard(entity) {
  return render(
    <MemoryRouter>
      <PulseCard entity={entity} />
    </MemoryRouter>
  );
}

describe("PulseCard", () => {
  it("renders entity name", () => {
    renderCard(makeEntity());
    expect(screen.getByText("OpenAI")).toBeInTheDocument();
  });

  it("renders bullish label for bullish entity", () => {
    renderCard(makeEntity({ pulse_label: "bullish" }));
    expect(screen.getByText(/bullish/i)).toBeInTheDocument();
  });

  it("renders bearish label for bearish entity", () => {
    renderCard(makeEntity({ pulse_label: "bearish" }));
    expect(screen.getByText(/bearish/i)).toBeInTheDocument();
  });

  it("renders mixed label for mixed entity", () => {
    renderCard(makeEntity({ pulse_label: "mixed" }));
    expect(screen.getByText(/mixed/i)).toBeInTheDocument();
  });

  it("renders mention count", () => {
    renderCard(makeEntity({ mention_count: 342 }));
    expect(screen.getByText(/342/)).toBeInTheDocument();
  });

  it("renders positive sentiment percentage", () => {
    renderCard(makeEntity({ avg_compound: 0.3 }));
    // +30% sentiment
    expect(screen.getByText(/\+30%/)).toBeInTheDocument();
  });

  it("renders negative sentiment percentage for bearish", () => {
    renderCard(makeEntity({ pulse_label: "bearish", avg_compound: -0.2 }));
    expect(screen.getByText(/-20%/)).toBeInTheDocument();
  });

  it("navigates to entity detail page on click", async () => {
    const user = userEvent.setup();
    renderCard(makeEntity({ slug: "anthropic" }));
    await user.click(screen.getByRole("button"));
    expect(mockNavigate).toHaveBeenCalledWith("/pulse/anthropic");
  });

  it("renders sentiment bar", () => {
    const { container } = renderCard(makeEntity());
    // SentimentBar renders divs with percentage widths
    const bars = container.querySelectorAll("[style*='width']");
    expect(bars.length).toBeGreaterThan(0);
  });
});
