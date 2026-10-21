import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { createSelectors } from './store';

export type ToastTone = 'default' | 'success' | 'error';

export type Toast = {
  id: number;
  message: string;
  tone: ToastTone;
};

let nextToastId = 1;

const useToastStoreBase = create(
  combine({ toasts: [] as Toast[] }, (set) => ({
    showToast: (message: string, tone: ToastTone = 'default') => {
      const id = nextToastId++;
      set((state) => ({ toasts: [...state.toasts, { id, message, tone }] }));
      return id;
    },
    dismissToast: (id: number) =>
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  }))
);

export const useToastStore = createSelectors(useToastStoreBase);
