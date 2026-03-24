import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignupPage from "../SignupPage";
import { renderWithProviders, resetAuthStore } from "../../../test/helpers";

vi.mock("../../../api/auth", () => ({
  authAPI: {
    signup: vi.fn(),
  },
}));

import { authAPI } from "../../../api/auth";

describe("SignupPage", () => {
  beforeEach(() => {
    resetAuthStore();
    vi.clearAllMocks();
  });

  it("renders signup form", () => {
    renderWithProviders(<SignupPage />);
    expect(screen.getByText("Create an account")).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  it("allows typing in all form fields", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignupPage />);

    await user.type(screen.getByLabelText(/username/i), "newuser");
    await user.type(screen.getByLabelText(/email/i), "new@example.com");
    await user.type(screen.getByLabelText("Password"), "StrongPass123!");
    await user.type(
      screen.getByLabelText(/confirm password/i),
      "StrongPass123!"
    );

    expect(screen.getByLabelText(/username/i)).toHaveValue("newuser");
    expect(screen.getByLabelText(/email/i)).toHaveValue("new@example.com");
    expect(screen.getByLabelText("Password")).toHaveValue("StrongPass123!");
    expect(screen.getByLabelText(/confirm password/i)).toHaveValue(
      "StrongPass123!"
    );
  });

  it("has link to login page", () => {
    renderWithProviders(<SignupPage />);
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
    const loginLink = screen.getByRole("link", { name: /login/i });
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("all fields are required", () => {
    renderWithProviders(<SignupPage />);
    expect(screen.getByLabelText(/username/i)).toBeRequired();
    expect(screen.getByLabelText(/email/i)).toBeRequired();
    expect(screen.getByLabelText("Password")).toBeRequired();
    expect(screen.getByLabelText(/confirm password/i)).toBeRequired();
  });

  it("shows check email message after successful signup", async () => {
    const user = userEvent.setup();
    authAPI.signup.mockResolvedValue({
      data: { detail: "Account created successfully." },
    });

    renderWithProviders(<SignupPage />);

    await user.type(screen.getByLabelText(/username/i), "newuser");
    await user.type(screen.getByLabelText(/email/i), "new@example.com");
    await user.type(screen.getByLabelText("Password"), "StrongPass123!");
    await user.type(
      screen.getByLabelText(/confirm password/i),
      "StrongPass123!"
    );
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByText(/check your email/i)).toBeInTheDocument();
    expect(screen.getByText("new@example.com")).toBeInTheDocument();
  });
});
