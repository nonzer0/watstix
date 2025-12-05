import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, it, expect, vi } from "vitest";
import { Header } from "./Header"; // Assuming the component is in Header.tsx or a similar path

// Mock the lucide-react icons since they are not essential for the component logic test
// and this prevents potential issues if the test environment doesn't handle SVGs well.
vi.mock("lucide-react", () => ({
  Plus: (props: any) => <svg {...props} data-testid="plus-icon" />,
  Briefcase: (props: any) => <svg {...props} data-testid="briefcase-icon" />,
  LogOut: (props: any) => <svg {...props} data-testid="logout-icon" />,
}));

describe("Header", () => {
  // Mock functions for the props
  const mockSetShowForm = vi.fn();
  const mockSignOut = vi.fn();

  // Setup function to render the component with default props
  const renderComponent = () =>
    render(<Header setShowForm={mockSetShowForm} signOut={mockSignOut} />);

  // Clear mocks before each test to ensure tests are independent
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the main title and subtitle", () => {
    renderComponent();

    // Check for the main heading
    expect(screen.getByText("Job Application Tracker")).toBeInTheDocument();
    // Check for the subtitle/description
    expect(
      screen.getByText("Manage and track your job applications"),
    ).toBeInTheDocument();
  });

  it('calls setShowForm with true when the "Add Application" button is clicked', () => {
    renderComponent();

    // Find the 'Add Application' button using its text content
    const addButton = screen.getByRole("button", { name: /Add Application/i });

    // Simulate a click event
    fireEvent.click(addButton);

    // Expect the mock function to have been called once
    expect(mockSetShowForm).toHaveBeenCalledTimes(1);

    // Expect the mock function to have been called with 'true'
    expect(mockSetShowForm).toHaveBeenCalledWith(true);
  });

  it('calls signOut when the "Sign Out" button is clicked', () => {
    renderComponent();

    // Find the 'Sign Out' button using its title attribute or by finding the LogOut icon
    // We use the title attribute for robust selection, as the button text is just an icon.
    const signOutButton = screen.getByRole("button", { name: /Sign Out/i });

    // Simulate a click event
    fireEvent.click(signOutButton);

    // Expect the mock function to have been called once
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("renders the expected icons", () => {
    renderComponent();

    // Check for the main Briefcase icon (part of the logo)
    expect(screen.getByTestId("briefcase-icon")).toBeInTheDocument();
    // Check for the Plus icon (inside the Add button)
    expect(screen.getByTestId("plus-icon")).toBeInTheDocument();
    // Check for the LogOut icon (inside the Sign Out button)
    expect(screen.getByTestId("logout-icon")).toBeInTheDocument();
  });
});
