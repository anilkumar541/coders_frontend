import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import VerifyEmailPage from "../VerifyEmailPage";
import { renderWithProviders } from "../../../test/helpers";

describe("VerifyEmailPage", () => {
  it("shows success message when status=success", () => {
    renderWithProviders(<VerifyEmailPage />, {
      route: "/verify-email?status=success",
    });
    expect(screen.getByText("Email verified!")).toBeInTheDocument();
    expect(
      screen.getByText(/verified successfully/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /go to login/i })
    ).toBeInTheDocument();
  });

  it("shows already verified message when status=already_verified", () => {
    renderWithProviders(<VerifyEmailPage />, {
      route: "/verify-email?status=already_verified",
    });
    expect(screen.getByText("Already verified")).toBeInTheDocument();
    expect(
      screen.getByText(/already been verified/i)
    ).toBeInTheDocument();
  });

  it("shows invalid link message when status=invalid", () => {
    renderWithProviders(<VerifyEmailPage />, {
      route: "/verify-email?status=invalid",
    });
    expect(screen.getByText("Invalid link")).toBeInTheDocument();
    expect(
      screen.getByText(/invalid or has expired/i)
    ).toBeInTheDocument();
  });

  it("shows invalid link message when no status param", () => {
    renderWithProviders(<VerifyEmailPage />, {
      route: "/verify-email",
    });
    expect(screen.getByText("Invalid link")).toBeInTheDocument();
  });

  it("has login link", () => {
    renderWithProviders(<VerifyEmailPage />, {
      route: "/verify-email?status=success",
    });
    const loginLink = screen.getByRole("link", { name: /go to login/i });
    expect(loginLink).toHaveAttribute("href", "/login");
  });
});
