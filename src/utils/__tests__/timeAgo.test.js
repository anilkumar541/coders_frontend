import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { timeAgo } from "../timeAgo";

function isoSecondsAgo(seconds) {
  return new Date(Date.now() - seconds * 1000).toISOString();
}

describe("timeAgo", () => {
  // ── "just now" (< 60 s) ──────────────────────────────────────────────────
  it("returns 'just now' for 0 seconds ago", () => {
    expect(timeAgo(isoSecondsAgo(0))).toBe("just now");
  });

  it("returns 'just now' for 30 seconds ago", () => {
    expect(timeAgo(isoSecondsAgo(30))).toBe("just now");
  });

  it("returns 'just now' for 59 seconds ago", () => {
    expect(timeAgo(isoSecondsAgo(59))).toBe("just now");
  });

  // ── Minutes (60 s – 3599 s) ──────────────────────────────────────────────
  it("returns '1m ago' for exactly 60 seconds ago", () => {
    expect(timeAgo(isoSecondsAgo(60))).toBe("1m ago");
  });

  it("returns '1m ago' for 90 seconds ago", () => {
    expect(timeAgo(isoSecondsAgo(90))).toBe("1m ago");
  });

  it("returns '5m ago' for 300 seconds ago", () => {
    expect(timeAgo(isoSecondsAgo(300))).toBe("5m ago");
  });

  it("returns '59m ago' for 3599 seconds ago", () => {
    expect(timeAgo(isoSecondsAgo(3599))).toBe("59m ago");
  });

  // ── Hours (3600 s – 86399 s) ─────────────────────────────────────────────
  it("returns '1h ago' for exactly 3600 seconds ago", () => {
    expect(timeAgo(isoSecondsAgo(3600))).toBe("1h ago");
  });

  it("returns '2h ago' for 7200 seconds ago", () => {
    expect(timeAgo(isoSecondsAgo(7200))).toBe("2h ago");
  });

  it("returns '23h ago' for 86399 seconds ago", () => {
    expect(timeAgo(isoSecondsAgo(86399))).toBe("23h ago");
  });

  // ── Days (86400 s – 2591999 s) ───────────────────────────────────────────
  it("returns '1d ago' for exactly 86400 seconds ago", () => {
    expect(timeAgo(isoSecondsAgo(86400))).toBe("1d ago");
  });

  it("returns '2d ago' for 172800 seconds ago", () => {
    expect(timeAgo(isoSecondsAgo(172800))).toBe("2d ago");
  });

  it("returns '29d ago' for 2591999 seconds ago", () => {
    expect(timeAgo(isoSecondsAgo(2591999))).toBe("29d ago");
  });

  // ── Month/day format (>= 30 days) ────────────────────────────────────────
  it("returns a locale date string for 30+ days ago", () => {
    const result = timeAgo(isoSecondsAgo(2592000)); // exactly 30 days
    // Should be something like "Mar 27" or similar locale format
    expect(result).toMatch(/^[A-Z][a-z]+ \d+$/);
  });

  it("returns a locale date string for 1 year ago", () => {
    const result = timeAgo(isoSecondsAgo(365 * 86400));
    expect(result).toMatch(/^[A-Z][a-z]+ \d+$/);
  });

  // ── Fixed date check ─────────────────────────────────────────────────────
  it("formats a fixed past date correctly", () => {
    // Jan 5 of a past year
    const date = new Date("2020-01-05T12:00:00Z").toISOString();
    const result = timeAgo(date);
    expect(result).toBe("Jan 5");
  });
});
