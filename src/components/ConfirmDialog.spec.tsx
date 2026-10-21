import { act, render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import ConfirmDialog from './ConfirmDialog';
import { useConfirmStore } from '../store';

describe('ConfirmDialog', () => {
  beforeEach(() => {
    act(() => useConfirmStore.getState().settle(false));
  });

  const ask = () => {
    let result!: Promise<boolean>;
    act(() => {
      result = useConfirmStore.getState().confirm({
        title: 'Delete application?',
        message: 'This cannot be undone.',
        confirmLabel: 'Delete',
        destructive: true,
      });
    });
    return result;
  };

  it('renders nothing without a pending request', () => {
    render(<ConfirmDialog />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('resolves true when confirmed', async () => {
    render(<ConfirmDialog />);
    const result = ask();

    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await expect(result).resolves.toBe(true);
    expect(screen.queryByText('Delete application?')).not.toBeInTheDocument();
  });

  it('resolves false when cancelled', async () => {
    render(<ConfirmDialog />);
    const result = ask();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await expect(result).resolves.toBe(false);
  });

  it('resolves false on Escape', async () => {
    render(<ConfirmDialog />);
    const result = ask();

    fireEvent.keyDown(screen.getByRole('alertdialog', { hidden: true }), {
      key: 'Escape',
    });

    await expect(result).resolves.toBe(false);
  });

  it('resolves a superseded request as false', async () => {
    render(<ConfirmDialog />);
    const first = ask();
    ask();

    await expect(first).resolves.toBe(false);
  });
});
