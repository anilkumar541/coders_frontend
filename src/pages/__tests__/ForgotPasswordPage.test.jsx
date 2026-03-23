import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPasswordPage from "../ForgotPasswordPage";
import { renderWithProviders, resetAuthStore } from "../../test/helpers";

vi.mock("../../api/auth", () => ({
  authAPI: {
    forgotPassword: vi.fn(),
  },
}));

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    resetAuthStore();
    vi.clearAllMocks();
  });

  it("renders forgot password form", () => {
    renderWithProviders(<ForgotPasswordPage />);
    expect(screen.getByText("Forgot password")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send reset link/i })
    ).toBeInTheDocument();
  });

  it("allows typing email", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordPage />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    expect(screen.getByLabelText(/email/i)).toHaveValue("test@example.com");
  });

  it("has link back to login", () => {
    renderWithProviders(<ForgotPasswordPage />);
    const backLink = screen.getByRole("link", { name: /back to login/i });
    expect(backLink).toHaveAttribute("href", "/login");
  });

  it("email field is required", () => {
    renderWithProviders(<ForgotPasswordPage />);
    expect(screen.getByLabelText(/email/i)).toBeRequired();
  });
});
