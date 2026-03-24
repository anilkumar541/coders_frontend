import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChangePasswordPage from "../../auth/ChangePasswordPage";
import { renderWithProviders, resetAuthStore } from "../../../test/helpers";

vi.mock("../../../api/auth", () => ({
  authAPI: {
    changePassword: vi.fn(),
  },
}));

describe("ChangePasswordPage", () => {
  beforeEach(() => {
    resetAuthStore();
    vi.clearAllMocks();
  });

  it("renders change password form", () => {
    renderWithProviders(<ChangePasswordPage />);
    expect(screen.getByText("Change password")).toBeInTheDocument();
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /change password/i })
    ).toBeInTheDocument();
  });

  it("allows typing in all fields", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChangePasswordPage />);

    await user.type(screen.getByLabelText(/current password/i), "OldPass123!");
    await user.type(screen.getByLabelText("New Password"), "NewPass456!");
    await user.type(
      screen.getByLabelText(/confirm new password/i),
      "NewPass456!"
    );

    expect(screen.getByLabelText(/current password/i)).toHaveValue(
      "OldPass123!"
    );
    expect(screen.getByLabelText("New Password")).toHaveValue("NewPass456!");
    expect(screen.getByLabelText(/confirm new password/i)).toHaveValue(
      "NewPass456!"
    );
  });

  it("all fields are required", () => {
    renderWithProviders(<ChangePasswordPage />);
    expect(screen.getByLabelText(/current password/i)).toBeRequired();
    expect(screen.getByLabelText("New Password")).toBeRequired();
    expect(screen.getByLabelText(/confirm new password/i)).toBeRequired();
  });

  it("all password fields have type password", () => {
    renderWithProviders(<ChangePasswordPage />);
    expect(screen.getByLabelText(/current password/i)).toHaveAttribute(
      "type",
      "password"
    );
    expect(screen.getByLabelText("New Password")).toHaveAttribute(
      "type",
      "password"
    );
    expect(screen.getByLabelText(/confirm new password/i)).toHaveAttribute(
      "type",
      "password"
    );
  });
});
