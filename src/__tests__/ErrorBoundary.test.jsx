import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ErrorBoundary from "../components/ErrorBoundary";

function BrokenComponent() {
  throw new Error("Test crash");
}

function WorkingComponent() {
  return <p>Everything works</p>;
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText("Everything works")).toBeInTheDocument();
  });

  it("shows error UI when child throws", () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Try again")).toBeInTheDocument();
  });

  it("resets on Try again click", async () => {
    let shouldThrow = true;
    function ConditionalCrash() {
      if (shouldThrow) throw new Error("crash");
      return <p>Recovered</p>;
    }

    const { rerender } = render(
      <ErrorBoundary>
        <ConditionalCrash />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    shouldThrow = false;

    await userEvent.click(screen.getByText("Try again"));
    // After reset, since we can't re-render children automatically,
    // the boundary should have cleared its error state
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("renders custom fallback", () => {
    render(
      <ErrorBoundary fallback={<p>Custom error</p>}>
        <BrokenComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText("Custom error")).toBeInTheDocument();
  });
});
