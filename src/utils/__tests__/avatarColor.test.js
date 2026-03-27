import { describe, it, expect } from "vitest";
import { getAvatarStyle } from "../avatarColor";

describe("getAvatarStyle", () => {
  // ── Null / empty inputs → default gradient ───────────────────────────────
  it("returns default indigo gradient for null username", () => {
    const style = getAvatarStyle(null);
    expect(style.background).toBe("linear-gradient(135deg, #6366f1, #4f46e5)");
  });

  it("returns default indigo gradient for undefined username", () => {
    const style = getAvatarStyle(undefined);
    expect(style.background).toBe("linear-gradient(135deg, #6366f1, #4f46e5)");
  });

  it("returns default indigo gradient for empty string", () => {
    const style = getAvatarStyle("");
    expect(style.background).toBe("linear-gradient(135deg, #6366f1, #4f46e5)");
  });

  // ── Return shape ─────────────────────────────────────────────────────────
  it("returns an object with a background property", () => {
    const style = getAvatarStyle("alice");
    expect(style).toHaveProperty("background");
    expect(typeof style.background).toBe("string");
  });

  it("background contains 'linear-gradient'", () => {
    const style = getAvatarStyle("alice");
    expect(style.background).toContain("linear-gradient");
  });

  it("background uses 135deg angle", () => {
    const style = getAvatarStyle("alice");
    expect(style.background).toContain("135deg");
  });

  it("background uses hsl colors for non-empty usernames", () => {
    const style = getAvatarStyle("alice");
    expect(style.background).toContain("hsl(");
  });

  // ── Determinism ──────────────────────────────────────────────────────────
  it("same username always returns the same gradient", () => {
    const a = getAvatarStyle("testuser");
    const b = getAvatarStyle("testuser");
    expect(a.background).toBe(b.background);
  });

  it("'alice' always returns the same gradient across calls", () => {
    const results = Array.from({ length: 5 }, () => getAvatarStyle("alice"));
    const unique = new Set(results.map((r) => r.background));
    expect(unique.size).toBe(1);
  });

  // ── Different usernames → different gradients ────────────────────────────
  it("different usernames produce different gradients", () => {
    const alice = getAvatarStyle("alice");
    const bob = getAvatarStyle("bob");
    expect(alice.background).not.toBe(bob.background);
  });

  it("'a' and 'b' produce different gradients", () => {
    expect(getAvatarStyle("a").background).not.toBe(getAvatarStyle("b").background);
  });

  // ── Single character ─────────────────────────────────────────────────────
  it("handles single character username", () => {
    const style = getAvatarStyle("x");
    expect(style.background).toContain("linear-gradient");
  });

  // ── Long username ────────────────────────────────────────────────────────
  it("handles very long username without throwing", () => {
    const longName = "a".repeat(200);
    expect(() => getAvatarStyle(longName)).not.toThrow();
    expect(getAvatarStyle(longName)).toHaveProperty("background");
  });
});
