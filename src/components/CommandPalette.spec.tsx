import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CommandPalette, { type Command } from './CommandPalette';

const makeCommands = () => {
  const perform = { new: vi.fn(), job: vi.fn(), theme: vi.fn() };
  const commands: Command[] = [
    {
      id: 'new',
      label: 'New application',
      group: 'Actions',
      perform: perform.new,
    },
    {
      id: 'theme',
      label: 'Change theme',
      group: 'Actions',
      perform: perform.theme,
    },
    {
      id: 'job-1',
      label: 'Staff Engineer',
      keywords: 'Northwind',
      group: 'Applications',
      perform: perform.job,
    },
  ];
  return { commands, perform };
};

describe('CommandPalette', () => {
  it('groups commands when the query is empty', () => {
    const { commands } = makeCommands();
    render(<CommandPalette commands={commands} onClose={vi.fn()} />);

    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('Applications')).toBeInTheDocument();
    expect(screen.getAllByRole('option', { hidden: true })).toHaveLength(3);
  });

  it('filters by query and runs the active result on Enter', () => {
    const { commands, perform } = makeCommands();
    const onClose = vi.fn();
    render(<CommandPalette commands={commands} onClose={onClose} />);
    const input = screen.getByRole('combobox', { hidden: true });

    fireEvent.change(input, { target: { value: 'northwind' } });
    expect(screen.getAllByRole('option', { hidden: true })).toHaveLength(1);

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onClose).toHaveBeenCalled();
    expect(perform.job).toHaveBeenCalledTimes(1);
  });

  it('moves the active option with arrow keys', () => {
    const { commands, perform } = makeCommands();
    render(<CommandPalette commands={commands} onClose={vi.fn()} />);
    const input = screen.getByRole('combobox', { hidden: true });

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(perform.theme).toHaveBeenCalledTimes(1);
  });

  it('shows an empty state and closes on Escape', () => {
    const { commands } = makeCommands();
    const onClose = vi.fn();
    render(<CommandPalette commands={commands} onClose={onClose} />);
    const input = screen.getByRole('combobox', { hidden: true });

    fireEvent.change(input, { target: { value: 'zzzz' } });
    expect(screen.getByText('No results')).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
