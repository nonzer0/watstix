import { create } from "zustand";
import { JobApplication } from "../lib/supabase";

interface StoreState {
  isEditing: boolean;
  jobInEdit?: JobApplication;
  updateJobInEdit: (job: JobApplication) => void;
  toggleEditing: () => void;
}

export const useStore = create<StoreState>((set) => ({
  isEditing: false,
  jobInEdit: undefined,
  updateJobInEdit: (job: JobApplication) => set(() => ({ jobInEdit: job })),
  toggleEditing: () => set((state) => ({ isEditing: !state.isEditing })),
}));
