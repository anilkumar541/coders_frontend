import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import HomePage from "../HomePage";
import { renderWithProviders } from "../../../test/helpers";

describe("HomePage", () => {
  it("renders hero heading", () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText(/speaks code/i)).toBeInTheDocument();
  });

  it("has signup and login links", () => {
    renderWithProviders(<HomePage />);
    const signupLink = screen.getByRole("link", { name: /join for free/i });
    const loginLink = screen.getByRole("link", { name: /already have an account/i });
    expect(signupLink).toHaveAttribute("href", "/signup");
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("renders mock feed preview section", () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText(/what your feed looks like/i)).toBeInTheDocument();
    expect(screen.getByText("anil_dev")).toBeInTheDocument();
    expect(screen.getByText("sara_rust")).toBeInTheDocument();
    expect(screen.getByText("mcode42")).toBeInTheDocument();
  });

  it("renders feature cards", () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText("Share your code")).toBeInTheDocument();
    expect(screen.getByText("Developer-only community")).toBeInTheDocument();
    expect(screen.getByText("All skill levels welcome")).toBeInTheDocument();
    expect(screen.getByText("Learn by osmosis")).toBeInTheDocument();
  });

  it("renders CTA section", () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText("Ready to join?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create your account/i })).toHaveAttribute("href", "/signup");
  });

  it("renders footer", () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText(/built for developers/i)).toBeInTheDocument();
  });
});
