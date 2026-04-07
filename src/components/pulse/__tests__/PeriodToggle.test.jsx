import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import PeriodToggle from "../PeriodToggle";

describe("PeriodToggle", () => {
  it("renders all three period options", () => {
    render(<PeriodToggle value="7d" onChange={vi.fn()} />);
    expect(screen.getByText("24h")).toBeInTheDocument();
    expect(screen.getByText("7d")).toBeInTheDocument();
    expect(screen.getByText("30d")).toBeInTheDocument();
  });

  it("active period has active style", () => {
    render(<PeriodToggle value="7d" onChange={vi.fn()} />);
    const btn = screen.getByText("7d");
    expect(btn.className).toMatch(/bg-white/);
  });

  it("calls onChange with correct value when clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PeriodToggle value="7d" onChange={onChange} />);
    await user.click(screen.getByText("30d"));
    expect(onChange).toHaveBeenCalledWith("30d");
  });

  it("calls onChange with 24h when that button is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PeriodToggle value="7d" onChange={onChange} />);
    await user.click(screen.getByText("24h"));
    expect(onChange).toHaveBeenCalledWith("24h");
  });
});
