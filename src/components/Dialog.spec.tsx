import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Dialog from './Dialog';

describe('Dialog', () => {
  const renderDialog = (
    props: Partial<React.ComponentProps<typeof Dialog>> = {}
  ) => {
    const onClose = vi.fn();
    render(
      <Dialog title="Edit application" onClose={onClose} {...props}>
        <p>Body</p>
      </Dialog>
    );
    return { onClose, dialog: screen.getByRole('dialog', { hidden: true }) };
  };

  it('is labelled by its title', () => {
    const { dialog } = renderDialog();
    expect(dialog).toHaveAccessibleName('Edit application');
  });

  it('closes on Escape and via the close button', () => {
    const { onClose, dialog } = renderDialog();
    fireEvent.keyDown(dialog, { key: 'Escape' });
    fireEvent.click(
      screen.getByRole('button', { name: 'Close', hidden: true })
    );
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('closes on backdrop click only when allowed', () => {
    const { onClose, dialog } = renderDialog({ dismissOnBackdrop: false });
    fireEvent.mouseDown(dialog);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('ignores clicks inside the panel', () => {
    const { onClose } = renderDialog();
    fireEvent.mouseDown(screen.getByText('Body'));
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('Dialog focus', () => {
  it('focuses the data-autofocus field and returns focus to the opener', () => {
    const opener = document.body.appendChild(document.createElement('button'));
    opener.focus();

    const { unmount } = render(
      <Dialog title="Reset password" onClose={() => {}}>
        <input aria-label="Email" data-autofocus />
      </Dialog>
    );
    expect(screen.getByLabelText('Email')).toHaveFocus();

    unmount();
    expect(opener).toHaveFocus();
    opener.remove();
  });
});
