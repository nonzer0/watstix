import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StatusMenu from './StatusMenu';

describe('StatusMenu', () => {
  const setup = (onChange = vi.fn()) => {
    render(<StatusMenu value="applied" onChange={onChange} />);
    return {
      onChange,
      trigger: screen.getByRole('button', { name: /applied/i }),
    };
  };

  it('opens a listbox with the current status selected', () => {
    const { trigger } = setup();
    fireEvent.click(trigger);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /applied/i })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('selects with arrow keys and Enter', () => {
    const { trigger, onChange } = setup();
    fireEvent.click(trigger);
    const list = screen.getByRole('listbox');

    fireEvent.keyDown(list, { key: 'ArrowDown' });
    fireEvent.keyDown(list, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith('interviewing');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('selects directly with a number key', () => {
    const { trigger, onChange } = setup();
    fireEvent.click(trigger);
    fireEvent.keyDown(screen.getByRole('listbox'), { key: '5' });

    expect(onChange).toHaveBeenCalledWith('rejected');
  });

  it('closes on Escape without changing and returns focus', () => {
    const { trigger, onChange } = setup();
    fireEvent.click(trigger);
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('does not call onChange when re-selecting the current value', () => {
    const { trigger, onChange } = setup();
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('option', { name: /applied/i }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('closes on an outside click', () => {
    const { trigger } = setup();
    fireEvent.click(trigger);
    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('stops clicks from reaching a clickable parent', () => {
    const parentClick = vi.fn();
    render(
      <div onClick={parentClick}>
        <StatusMenu value="applied" onChange={vi.fn()} variant="icon" />
      </div>
    );
    fireEvent.click(screen.getByRole('button', { name: /status: applied/i }));

    expect(parentClick).not.toHaveBeenCalled();
  });
});
