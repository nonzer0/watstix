import { act, render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Toaster from './Toaster';
import { useToastStore } from '../store';

describe('Toaster', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useToastStore.setState({ toasts: [] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a toast and dismisses it on click', () => {
    render(<Toaster />);
    act(() => {
      useToastStore.getState().showToast('Saved', 'success');
    });

    expect(screen.getByText('Saved')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });

  it('auto-dismisses after its duration', () => {
    render(<Toaster />);
    act(() => {
      useToastStore.getState().showToast('Could not save', 'error');
    });

    act(() => {
      vi.advanceTimersByTime(6999);
    });
    expect(screen.getByText('Could not save')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByText('Could not save')).not.toBeInTheDocument();
  });
});
