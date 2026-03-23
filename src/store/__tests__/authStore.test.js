import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../authStore";

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, user: null });
  });

  it("has correct initial state", () => {
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it("sets access token", () => {
    useAuthStore.getState().setAccessToken("test-token");
    expect(useAuthStore.getState().accessToken).toBe("test-token");
  });

  it("sets user", () => {
    const user = { id: 1, username: "test", email: "test@example.com" };
    useAuthStore.getState().setUser(user);
    expect(useAuthStore.getState().user).toEqual(user);
  });

  it("handles loginSuccess", () => {
    const user = { id: 1, username: "test" };
    useAuthStore.getState().loginSuccess("token123", user);
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe("token123");
    expect(state.user).toEqual(user);
  });

  it("handles logout", () => {
    useAuthStore.getState().loginSuccess("token123", { id: 1 });
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
  });
});
