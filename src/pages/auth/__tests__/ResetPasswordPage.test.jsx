import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResetPasswordPage from "../ResetPasswordPage";
import { renderWithProviders, resetAuthStore } from "../../../test/helpers";

vi.mock("../../../api/auth", () => ({
  authAPI: {
    resetPassword: vi.fn(),
  },
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ uid: "abc123", token: "tok-456" }),
  };
});

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    resetAuthStore();
    vi.clearAllMocks();
  });

  it("renders reset password form", () => {
    renderWithProviders(<ResetPasswordPage />);
    expect(screen.getByText("Reset password")).toBeInTheDocument();
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm New Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset password/i })
    ).toBeInTheDocument();
  });

  it("allows typing in password fields", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetPasswordPage />);

    await user.type(screen.getByLabelText("New Password"), "NewPass123!");
    await user.type(
      screen.getByLabelText(/confirm new password/i),
      "NewPass123!"
    );

    expect(screen.getByLabelText("New Password")).toHaveValue("NewPass123!");
    expect(screen.getByLabelText(/confirm new password/i)).toHaveValue(
      "NewPass123!"
    );
  });

  it("has link back to login", () => {
    renderWithProviders(<ResetPasswordPage />);
    const backLink = screen.getByRole("link", { name: /back to login/i });
    expect(backLink).toHaveAttribute("href", "/login");
  });

  it("both fields are required", () => {
    renderWithProviders(<ResetPasswordPage />);
    expect(screen.getByLabelText("New Password")).toBeRequired();
    expect(screen.getByLabelText(/confirm new password/i)).toBeRequired();
  });
});
