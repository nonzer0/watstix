import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StatusFilterBar from './StatusFilterBar';

const counts = {
  all: 5,
  applied: 2,
  interviewing: 1,
  offered: 0,
  accepted: 0,
  rejected: 2,
  withdrawn: 0,
};

describe('StatusFilterBar', () => {
  it('marks the active filter as pressed and shows counts', () => {
    render(
      <StatusFilterBar value="applied" onChange={vi.fn()} counts={counts} />
    );

    const applied = screen.getByRole('button', { name: /applied/i });
    expect(applied).toHaveAttribute('aria-pressed', 'true');
    expect(applied).toHaveTextContent('2');
    expect(screen.getByRole('button', { name: /all/i })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('reports the selected filter', () => {
    const onChange = vi.fn();
    render(<StatusFilterBar value="all" onChange={onChange} counts={counts} />);

    fireEvent.click(screen.getByRole('button', { name: /rejected/i }));
    expect(onChange).toHaveBeenCalledWith('rejected');
  });
});
