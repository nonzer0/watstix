import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AppShell from './AppShell';

const signOut = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ signOut }),
}));

describe('AppShell', () => {
  beforeEach(() => vi.clearAllMocks());

  const renderShell = (onNew?: () => void) =>
    render(
      <MemoryRouter>
        <AppShell onNew={onNew}>
          <p>Page content</p>
        </AppShell>
      </MemoryRouter>
    );

  it('renders the wordmark linking home and the page content', () => {
    renderShell();
    expect(screen.getByRole('link', { name: /watstix home/i })).toHaveAttribute(
      'href',
      '/'
    );
    expect(screen.getByText('Page content')).toBeInTheDocument();
  });

  it('calls onNew from the New button', () => {
    const onNew = vi.fn();
    renderShell(onNew);
    fireEvent.click(screen.getByRole('button', { name: /new/i }));
    expect(onNew).toHaveBeenCalledTimes(1);
  });

  it('omits the New button without a handler', () => {
    renderShell();
    expect(
      screen.queryByRole('button', { name: /new/i })
    ).not.toBeInTheDocument();
  });

  it('signs out', () => {
    renderShell();
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
