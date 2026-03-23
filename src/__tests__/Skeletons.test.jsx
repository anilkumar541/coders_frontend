import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PostSkeleton, CommentSkeleton, NotificationSkeleton } from "../components/Skeletons";

describe("Skeletons", () => {
  it("renders PostSkeleton with animate-pulse", () => {
    const { container } = render(<PostSkeleton />);
    expect(container.querySelector(".animate-pulse")).toBeTruthy();
  });

  it("renders CommentSkeleton with animate-pulse", () => {
    const { container } = render(<CommentSkeleton />);
    expect(container.querySelector(".animate-pulse")).toBeTruthy();
  });

  it("renders NotificationSkeleton with animate-pulse", () => {
    const { container } = render(<NotificationSkeleton />);
    expect(container.querySelector(".animate-pulse")).toBeTruthy();
  });
});
