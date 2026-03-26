import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OnboardingPage from "../OnboardingPage";
import { renderWithProviders, setAuthState, resetAuthStore } from "../../../test/helpers";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockCompleteOnboarding = vi.fn();
vi.mock("../../../hooks/useAuth", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useCompleteOnboarding: () => ({
      mutate: mockCompleteOnboarding,
      isPending: false,
    }),
  };
});

describe("OnboardingPage", () => {
  beforeEach(() => {
    resetAuthStore();
    vi.clearAllMocks();
    setAuthState("test-token", { id: 1, username: "testuser" });
  });

  it("renders welcome heading and interest grid", () => {
    renderWithProviders(<OnboardingPage />);
    expect(screen.getByText("Welcome to Coduex")).toBeInTheDocument();
    expect(screen.getByText("LLMs")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("Rust")).toBeInTheDocument();
  });

  it("shows Continue button", () => {
    renderWithProviders(<OnboardingPage />);
    expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
  });

  it("shows Skip for now button", () => {
    renderWithProviders(<OnboardingPage />);
    expect(screen.getByRole("button", { name: /skip/i })).toBeInTheDocument();
  });

  it("toggles interest selection on click", async () => {
    renderWithProviders(<OnboardingPage />);
    const llmButton = screen.getByText("LLMs").closest("button");
    await userEvent.click(llmButton);
    expect(screen.getByText("1 interest selected")).toBeInTheDocument();
    await userEvent.click(llmButton);
    expect(screen.queryByText("1 interest selected")).not.toBeInTheDocument();
  });

  it("calls completeOnboarding with selected interests on Continue", async () => {
    mockCompleteOnboarding.mockImplementation((data, { onSuccess }) => onSuccess());
    renderWithProviders(<OnboardingPage />);
    await userEvent.click(screen.getByText("Python").closest("button"));
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(mockCompleteOnboarding).toHaveBeenCalledWith(
      { interests: ["python"] },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  it("calls completeOnboarding with empty array on Skip", async () => {
    mockCompleteOnboarding.mockImplementation((data, { onSuccess }) => onSuccess());
    renderWithProviders(<OnboardingPage />);
    await userEvent.click(screen.getByRole("button", { name: /skip/i }));
    expect(mockCompleteOnboarding).toHaveBeenCalledWith(
      { interests: [] },
      expect.any(Object)
    );
  });
});
