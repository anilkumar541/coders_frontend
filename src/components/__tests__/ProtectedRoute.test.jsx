import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../ProtectedRoute";
import { renderWithProviders, resetAuthStore, setAuthState } from "../../test/helpers";

describe("ProtectedRoute", () => {
  beforeEach(() => {
    resetAuthStore();
  });

  it("redirects to login when not authenticated", () => {
    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>,
      { route: "/dashboard" }
    );
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders child route when authenticated", () => {
    setAuthState("test-token", { username: "testuser" });
    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Route>
      </Routes>,
      { route: "/dashboard" }
    );
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});
