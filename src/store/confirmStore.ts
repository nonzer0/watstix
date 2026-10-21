import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { createSelectors } from './store';

export type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  destructive?: boolean;
};

type ConfirmRequest = ConfirmOptions & {
  resolve: (confirmed: boolean) => void;
};

const useConfirmStoreBase = create(
  combine({ request: null as ConfirmRequest | null }, (set, get) => ({
    /** Resolves true when confirmed, false when cancelled or superseded. */
    confirm: (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        get().request?.resolve(false);
        set({ request: { ...options, resolve } });
      }),
    settle: (confirmed: boolean) => {
      get().request?.resolve(confirmed);
      set({ request: null });
    },
  }))
);

export const useConfirmStore = createSelectors(useConfirmStoreBase);

/** Promise-based replacement for window.confirm(). */
export const useConfirm = () => useConfirmStore.use.confirm();
