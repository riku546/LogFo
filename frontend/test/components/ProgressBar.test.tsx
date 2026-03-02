import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "@/features/roadmap/components/ProgressBar";

describe("ProgressBar", () => {
  it("進捗率0%を正しく表示する", () => {
    render(React.createElement(ProgressBar, { progress: 0 }));

    expect(screen.getByText("全体の進捗")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });

  it("進捗率50%を正しく表示する", () => {
    render(React.createElement(ProgressBar, { progress: 50 }));

    expect(screen.getByText("50%")).toBeInTheDocument();
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "50");
    expect(progressbar).toHaveStyle({ width: "50%" });
  });

  it("進捗率100%を正しく表示する", () => {
    render(React.createElement(ProgressBar, { progress: 100 }));

    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
  });
});
