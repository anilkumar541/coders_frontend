import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ReportModal from "../ReportModal";

vi.mock("../../../store/authStore", () => ({
  useAuthStore: vi.fn((selector) => {
    const state = {
      user: { id: 1, username: "testuser" },
      accessToken: "mock-token",
    };
    return selector(state);
  }),
}));

const mockReport = vi.fn();

vi.mock("../../../api/posts", () => ({
  postsAPI: {
    report: (...args) => mockReport(...args),
  },
}));

function renderWithProviders(ui) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe("ReportModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReport.mockResolvedValue({ data: { detail: "Report submitted." } });
  });

  it("renders report title", () => {
    renderWithProviders(<ReportModal postId={1} onClose={() => {}} />);
    expect(screen.getByText("Report")).toBeInTheDocument();
  });

  it("shows all report reasons", () => {
    renderWithProviders(<ReportModal postId={1} onClose={() => {}} />);
    expect(screen.getByText("Spam")).toBeInTheDocument();
    expect(screen.getByText("Abuse / Harassment")).toBeInTheDocument();
    expect(screen.getByText("Misinformation")).toBeInTheDocument();
    expect(screen.getByText("Violence")).toBeInTheDocument();
    expect(screen.getByText("Hate Speech")).toBeInTheDocument();
    expect(screen.getByText("Other")).toBeInTheDocument();
  });

  it("submit button is disabled without reason", () => {
    renderWithProviders(<ReportModal postId={1} onClose={() => {}} />);
    expect(screen.getByText("Submit Report")).toBeDisabled();
  });

  it("submit button enabled after selecting reason", async () => {
    renderWithProviders(<ReportModal postId={1} onClose={() => {}} />);
    await userEvent.click(screen.getByText("Spam"));
    expect(screen.getByText("Submit Report")).not.toBeDisabled();
  });

  it("shows description field for any selected reason", async () => {
    renderWithProviders(<ReportModal postId={1} onClose={() => {}} />);
    // Description textarea appears for every reason, not just "Other"
    await userEvent.click(screen.getByText("Spam"));
    expect(screen.getByPlaceholderText("Help us understand the issue better...")).toBeInTheDocument();
  });

  it("submits report and shows thank you", async () => {
    renderWithProviders(<ReportModal postId={1} onClose={() => {}} />);
    await userEvent.click(screen.getByText("Spam"));
    await userEvent.click(screen.getByText("Submit Report"));
    await waitFor(() => {
      expect(screen.getByText(/Thank you for your report/)).toBeInTheDocument();
    });
  });

  it("calls onClose when cancel clicked", async () => {
    const onClose = vi.fn();
    renderWithProviders(<ReportModal postId={1} onClose={onClose} />);
    await userEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalled();
  });

  it("has Close button after submission", async () => {
    renderWithProviders(<ReportModal postId={1} onClose={() => {}} />);
    await userEvent.click(screen.getByText("Spam"));
    await userEvent.click(screen.getByText("Submit Report"));
    await waitFor(() => {
      expect(screen.getByText("Close")).toBeInTheDocument();
    });
  });
});
