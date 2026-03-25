import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navbar from "../Navbar";
import {
  renderWithProviders,
  resetAuthStore,
  setAuthState,
} from "../../../test/helpers";

vi.mock("../../../api/auth", () => ({
  authAPI: {
    logout: vi.fn(),
  },
}));

vi.mock("../../../api/notifications", () => ({
  notificationsAPI: {
    getUnreadCount: vi.fn().mockResolvedValue({ data: { unread_count: 0 } }),
  },
}));

describe("Navbar", () => {
  beforeEach(() => {
    resetAuthStore();
  });

  it("shows login and signup links when not authenticated", () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
  });

  it("shows avatar button when authenticated", () => {
    setAuthState("test-token", { username: "testuser", email: "test@example.com" });
    renderWithProviders(<Navbar />);
    expect(screen.getByLabelText("Open user menu")).toBeInTheDocument();
  });

  it("shows dropdown with Profile, Notification Preferences, Logout on avatar click (no Change Password or Privacy Settings)", async () => {
    setAuthState("test-token", { username: "testuser", email: "test@example.com" });
    renderWithProviders(<Navbar />);
    await userEvent.click(screen.getByLabelText("Open user menu"));
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.queryByText("Change Password")).not.toBeInTheDocument();
    expect(screen.queryByText("Privacy Settings")).not.toBeInTheDocument();
    expect(screen.getByText("Notification Preferences")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("shows nav links (Home, Create) when authenticated — no Search", () => {
    setAuthState("test-token", { username: "testuser" });
    renderWithProviders(<Navbar />);
    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /search/i })).not.toBeInTheDocument();
  });

  it("does not show nav links when not authenticated", () => {
    renderWithProviders(<Navbar />);
    expect(screen.queryByRole("link", { name: /home/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /create/i })).not.toBeInTheDocument();
  });

  it("shows brand link", () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText("Coduex")).toBeInTheDocument();
  });

  it("brand links to home when not authenticated", () => {
    renderWithProviders(<Navbar />);
    const brand = screen.getByText("Coduex");
    expect(brand.closest("a")).toHaveAttribute("href", "/");
  });

  it("brand links to dashboard when authenticated", () => {
    setAuthState("test-token", { username: "testuser" });
    renderWithProviders(<Navbar />);
    const brand = screen.getByText("Coduex");
    expect(brand.closest("a")).toHaveAttribute("href", "/dashboard");
  });

  it("highlights Login link when on /login route", () => {
    renderWithProviders(<Navbar />, { route: "/login" });
    const loginLink = screen.getByRole("link", { name: /login/i });
    expect(loginLink.className).toContain("font-medium");
    expect(loginLink.className).toContain("text-gray-900");
  });

  it("highlights Sign Up link when on /signup route", () => {
    renderWithProviders(<Navbar />, { route: "/signup" });
    const signupLink = screen.getByRole("link", { name: /sign up/i });
    expect(signupLink.className).toContain("border-gray-900");
    expect(signupLink.className).toContain("font-medium");
  });

  it("does not highlight Login link when on /signup route", () => {
    renderWithProviders(<Navbar />, { route: "/signup" });
    const loginLink = screen.getByRole("link", { name: /login/i });
    expect(loginLink.className).not.toContain("font-medium");
  });

  it("renders user initials in avatar when no profile picture", () => {
    setAuthState("test-token", { username: "testuser" });
    renderWithProviders(<Navbar />);
    expect(screen.getByText("TE")).toBeInTheDocument();
  });
});
