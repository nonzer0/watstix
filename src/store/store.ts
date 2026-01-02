import { create, StoreApi, UseBoundStore } from "zustand";
import { combine } from "zustand/middleware";
import type { JobApplication, InterviewPhase } from "../lib/supabase";

// interface StoreState {
//     jobs: JobApplication[];
//     setJobs: (jobs: JobApplication[]) => void;
// }

const useStoreBase = create(
  combine(
    {
      jobs: [] as JobApplication[],
      interviewPhases: [] as InterviewPhase[],
    },
    (set) => {
      return {
        setJobs: (jobs: JobApplication[]) => set({ jobs }),
        deleteJob: (id: string) =>
          set((state) => {
            const jobExists = state.jobs.some((job) => job.id === id);
            if (!jobExists) {
              console.warn(`Cannot delete: Job with id ${id} not found`);
              return state;
            }
            return {
              jobs: state.jobs.filter((job) => job.id !== id),
            };
          }),
        updateJob: (id: string, updates: Partial<JobApplication>) =>
          set((state) => {
            const jobExists = state.jobs.some((job) => job.id === id);
            if (!jobExists) {
              console.warn(`Cannot update: Job with id ${id} not found`);
              return state;
            }
            return {
              jobs: state.jobs.map((job) =>
                job.id === id ? { ...job, ...updates } : job,
              ),
            };
          }),
        setInterviewPhases: (phases: InterviewPhase[]) =>
          set({ interviewPhases: phases }),
        addInterviewPhase: (phase: InterviewPhase) =>
          set((state) => ({
            interviewPhases: [...state.interviewPhases, phase],
          })),
        updateInterviewPhase: (id: string, updates: Partial<InterviewPhase>) =>
          set((state) => {
            const phaseExists = state.interviewPhases.some(
              (phase) => phase.id === id,
            );
            if (!phaseExists) {
              console.warn(`Cannot update: Phase with id ${id} not found`);
              return state;
            }
            return {
              interviewPhases: state.interviewPhases.map((phase) =>
                phase.id === id ? { ...phase, ...updates } : phase,
              ),
            };
          }),
        deleteInterviewPhase: (id: string) =>
          set((state) => {
            const phaseExists = state.interviewPhases.some(
              (phase) => phase.id === id,
            );
            if (!phaseExists) {
              console.warn(`Cannot delete: Phase with id ${id} not found`);
              return state;
            }
            return {
              interviewPhases: state.interviewPhases.filter(
                (phase) => phase.id !== id,
              ),
            };
          }),
      };
    },
  ),
);

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S,
) => {
  const store = _store as WithSelectors<typeof _store>;
  store.use = {};
  for (const k of Object.keys(store.getState())) {
    (store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
  }

  return store;
};

export const useStore = createSelectors(useStoreBase);
