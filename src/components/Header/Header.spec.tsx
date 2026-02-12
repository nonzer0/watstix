import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { Header } from './Header';

// Mock the lucide-react icons since they are not essential for the component logic test
// and this prevents potential issues if the test environment doesn't handle SVGs well.
vi.mock('lucide-react', () => ({
  Plus: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} data-testid="plus-icon" />
  ),
  Briefcase: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} data-testid="briefcase-icon" />
  ),
  LogOut: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} data-testid="logout-icon" />
  ),
}));

describe('Header', () => {
  const mockSetShowForm = vi.fn();
  const mockSignOut = vi.fn();

  const renderComponent = () =>
    render(<Header setShowForm={mockSetShowForm} signOut={mockSignOut} />);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main title and subtitle', () => {
    renderComponent();

    expect(screen.getByText('Application Tracker')).toBeInTheDocument();
    expect(
      screen.getByText('Manage and track your job applications')
    ).toBeInTheDocument();
  });

  it('calls setShowForm with true when the "Add Application" button is clicked', () => {
    renderComponent();

    const addButton = screen.getByRole('button', { name: /Add Application/i });

    fireEvent.click(addButton);

    expect(mockSetShowForm).toHaveBeenCalledTimes(1);

    expect(mockSetShowForm).toHaveBeenCalledWith(true);
  });

  it('calls signOut when the "Sign Out" button is clicked', () => {
    renderComponent();

    const signOutButton = screen.getByRole('button', { name: /Sign Out/i });

    fireEvent.click(signOutButton);

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('renders the expected icons', () => {
    renderComponent();

    expect(screen.getByTestId('briefcase-icon')).toBeInTheDocument();
    expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
  });
});
