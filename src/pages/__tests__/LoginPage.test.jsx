import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../LoginPage";
import { renderWithProviders, resetAuthStore } from "../../test/helpers";

vi.mock("../../api/auth", () => ({
  authAPI: {
    login: vi.fn(),
    resendVerification: vi.fn(),
  },
}));

import { authAPI } from "../../api/auth";

describe("LoginPage", () => {
  beforeEach(() => {
    resetAuthStore();
    vi.clearAllMocks();
  });

  it("renders login form", () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByLabelText(/username or email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });

  it("allows typing in form fields", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    const usernameInput = screen.getByLabelText(/username or email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "password123");

    expect(usernameInput).toHaveValue("testuser");
    expect(passwordInput).toHaveValue("password123");
  });

  it("has required fields", () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByLabelText(/username or email/i)).toBeRequired();
    expect(screen.getByLabelText(/password/i)).toBeRequired();
  });

  it("password field has type password", () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByLabelText(/password/i)).toHaveAttribute(
      "type",
      "password"
    );
  });

  it("shows unverified email warning with resend button", async () => {
    const user = userEvent.setup();
    const error = new Error("Forbidden");
    error.response = {
      status: 403,
      data: {
        detail: "Please verify your email address before logging in.",
        email_not_verified: true,
        email: "test@example.com",
      },
    };
    authAPI.login.mockRejectedValue(error);
    authAPI.resendVerification.mockResolvedValue({ data: { detail: "Sent" } });

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/username or email/i), "testuser");
    await user.type(screen.getByLabelText(/password/i), "pass");
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(
      await screen.findByText(/verify your email/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/resend verification email/i)
    ).toBeInTheDocument();

    // Click resend
    await user.click(screen.getByText(/resend verification email/i));
    expect(authAPI.resendVerification).toHaveBeenCalledWith({
      email: "test@example.com",
    });
  });
});
