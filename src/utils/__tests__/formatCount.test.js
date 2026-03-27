import { describe, it, expect } from "vitest";
import { formatCount } from "../formatCount";

describe("formatCount", () => {
  // ── Null / invalid inputs ────────────────────────────────────────────────
  it("returns null for null", () => {
    expect(formatCount(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(formatCount(undefined)).toBeNull();
  });

  it("returns null for NaN", () => {
    expect(formatCount(NaN)).toBeNull();
  });

  it("returns null for Infinity", () => {
    expect(formatCount(Infinity)).toBeNull();
  });

  it("returns null for -Infinity", () => {
    expect(formatCount(-Infinity)).toBeNull();
  });

  // ── 0–999 → exact string ─────────────────────────────────────────────────
  it("returns '0' for 0", () => {
    expect(formatCount(0)).toBe("0");
  });

  it("returns '1' for 1", () => {
    expect(formatCount(1)).toBe("1");
  });

  it("returns '42' for 42", () => {
    expect(formatCount(42)).toBe("42");
  });

  it("returns '999' for 999", () => {
    expect(formatCount(999)).toBe("999");
  });

  // ── 1 000–999 999 → k suffix ─────────────────────────────────────────────
  it("returns '1k' for 1000", () => {
    expect(formatCount(1000)).toBe("1k");
  });

  it("returns '1.5k' for 1500", () => {
    expect(formatCount(1500)).toBe("1.5k");
  });

  it("returns '1.9k' for 1999 (truncated, not rounded)", () => {
    expect(formatCount(1999)).toBe("1.9k");
  });

  it("returns '10k' for 10000", () => {
    expect(formatCount(10000)).toBe("10k");
  });

  it("returns '10.5k' for 10500", () => {
    expect(formatCount(10500)).toBe("10.5k");
  });

  it("returns '999.9k' for 999999 (never rounds up to 1M)", () => {
    expect(formatCount(999999)).toBe("999.9k");
  });

  it("returns '100k' for 100000", () => {
    expect(formatCount(100000)).toBe("100k");
  });

  // ── 1 000 000+ → M suffix ───────────────────────────────────────────────
  it("returns '1M' for 1000000", () => {
    expect(formatCount(1000000)).toBe("1M");
  });

  it("returns '1.5M' for 1500000", () => {
    expect(formatCount(1500000)).toBe("1.5M");
  });

  it("returns '8.8M' for 8800000", () => {
    expect(formatCount(8800000)).toBe("8.8M");
  });

  it("returns '999.9M' for 999999999", () => {
    expect(formatCount(999999999)).toBe("999.9M");
  });

  // ── 1 000 000 000+ → B suffix ────────────────────────────────────────────
  it("returns '1B' for 1000000000", () => {
    expect(formatCount(1000000000)).toBe("1B");
  });

  it("returns '2.5B' for 2500000000", () => {
    expect(formatCount(2500000000)).toBe("2.5B");
  });

  // ── Negatives ────────────────────────────────────────────────────────────
  it("returns '-500' for -500", () => {
    expect(formatCount(-500)).toBe("-500");
  });

  it("returns '-1.5k' for -1500", () => {
    expect(formatCount(-1500)).toBe("-1.5k");
  });

  it("returns '-1M' for -1000000", () => {
    expect(formatCount(-1000000)).toBe("-1M");
  });

  // ── Truncation (floor, not round) ────────────────────────────────────────
  it("truncates 1490 to '1.4k', not '1.5k'", () => {
    expect(formatCount(1490)).toBe("1.4k");
  });

  it("truncates 1990 to '1.9k', not '2k'", () => {
    expect(formatCount(1990)).toBe("1.9k");
  });
});
