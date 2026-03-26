import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import OnboardingBar from "../OnboardingBar";

const baseUser = {
  bio: "",
  post_count: 0,
  following_count: 0,
  has_reacted: false,
  onboarding_completed: true,
};

function renderBar(user) {
  return render(
    <MemoryRouter>
      <OnboardingBar user={user} />
    </MemoryRouter>
  );
}

describe("OnboardingBar", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders Getting started heading", () => {
    renderBar(baseUser);
    expect(screen.getByText("Getting started")).toBeInTheDocument();
  });

  it("shows 0/4 steps initially", () => {
    renderBar(baseUser);
    expect(screen.getByText("0/4")).toBeInTheDocument();
  });

  it("marks bio step as done when user has bio", () => {
    renderBar({ ...baseUser, bio: "Hello" });
    // With bio set, 1/4 steps should be complete
    expect(screen.getByText("1/4")).toBeInTheDocument();
  });

  it("shows all done message when all steps complete", () => {
    renderBar({
      ...baseUser,
      bio: "Hello",
      post_count: 1,
      following_count: 5,
      has_reacted: true,
    });
    expect(screen.getByText(/You're all set/)).toBeInTheDocument();
    expect(screen.getByText("4/4")).toBeInTheDocument();
  });

  it("dismisses bar on X click", async () => {
    renderBar(baseUser);
    expect(screen.getByText("Getting started")).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Dismiss"));
    expect(screen.queryByText("Getting started")).not.toBeInTheDocument();
  });

  it("collapses steps on chevron click", async () => {
    renderBar(baseUser);
    expect(screen.getByText("Add a bio")).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Collapse"));
    expect(screen.queryByText("Add a bio")).not.toBeInTheDocument();
  });

  it("stays hidden after dismiss (localStorage)", () => {
    localStorage.setItem("onboarding_bar_dismissed", "true");
    renderBar(baseUser);
    expect(screen.queryByText("Getting started")).not.toBeInTheDocument();
  });
});
