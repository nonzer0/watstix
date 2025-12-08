import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { JobStatusBtn } from "./JobStatusBtn";
import { JobApplication } from "../../lib/supabase";

const mockApplications: JobApplication[] = [
  { id: "1", status: "applied" } as JobApplication,
  { id: "2", status: "applied" } as JobApplication,
  { id: "3", status: "interviewing" } as JobApplication,
  { id: "4", status: "offered" } as JobApplication,
];

describe("JobStatusBtn", () => {
  it("renders status label and count", () => {
    const mockSetStatusFilter = vi.fn();
    const status = {
      label: "Applied",
      value: "applied" as const,
      color: "bg-blue-500",
    };

    render(
      <JobStatusBtn
        status={status}
        statusFilter="all"
        setStatusFilter={mockSetStatusFilter}
        applications={mockApplications}
      />,
    );

    expect(screen.getByText("Applied")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it('shows total count for "all" status', () => {
    const mockSetStatusFilter = vi.fn();
    const status = {
      label: "All",
      value: "all" as const,
      color: "bg-gray-500",
    };

    render(
      <JobStatusBtn
        status={status}
        statusFilter="all"
        setStatusFilter={mockSetStatusFilter}
        applications={mockApplications}
      />,
    );

    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("applies active styles when selected", () => {
    const mockSetStatusFilter = vi.fn();
    const status = {
      label: "Applied",
      value: "applied" as const,
      color: "bg-blue-500",
    };

    const { container } = render(
      <JobStatusBtn
        status={status}
        statusFilter="applied"
        setStatusFilter={mockSetStatusFilter}
        applications={mockApplications}
      />,
    );

    const button = container.querySelector("button");
    expect(button?.className).toContain("bg-blue-500");
    expect(button?.className).toContain("text-white");
  });

  it("applies inactive styles when not selected", () => {
    const mockSetStatusFilter = vi.fn();
    const status = {
      label: "Applied",
      value: "applied" as const,
      color: "bg-blue-500",
    };

    const { container } = render(
      <JobStatusBtn
        status={status}
        statusFilter="all"
        setStatusFilter={mockSetStatusFilter}
        applications={mockApplications}
      />,
    );

    const button = container.querySelector("button");
    expect(button?.className).toContain("bg-white");
    expect(button?.className).toContain("text-gray-700");
  });

  it("calls setStatusFilter with correct value on click", () => {
    const mockSetStatusFilter = vi.fn();
    const status = {
      label: "Interviewing",
      value: "interviewing" as const,
      color: "bg-yellow-500",
    };

    render(
      <JobStatusBtn
        status={status}
        statusFilter="all"
        setStatusFilter={mockSetStatusFilter}
        applications={mockApplications}
      />,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(mockSetStatusFilter).toHaveBeenCalledWith("interviewing");
  });
});
