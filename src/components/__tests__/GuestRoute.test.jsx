import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";
import GuestRoute from "../GuestRoute";
import { renderWithProviders, resetAuthStore, setAuthState } from "../../test/helpers";

describe("GuestRoute", () => {
  beforeEach(() => {
    resetAuthStore();
  });

  it("renders child route when not authenticated", () => {
    renderWithProviders(
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<div>Login Page</div>} />
        </Route>
      </Routes>,
      { route: "/login" }
    );
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("redirects to dashboard when authenticated", () => {
    setAuthState("test-token", { username: "testuser" });
    renderWithProviders(
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<div>Login Page</div>} />
        </Route>
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>,
      { route: "/login" }
    );
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});
