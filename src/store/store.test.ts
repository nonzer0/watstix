import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore } from './store';
import type { JobApplication, InterviewPhase } from '../lib/supabase';

describe('useStore', () => {
  beforeEach(() => {
    useStore.setState({ jobs: [], interviewPhases: [] });
  });

  const mockJobs: JobApplication[] = [
    {
      id: '1',
      user_id: 'user1',
      company_name: 'Company A',
      position_title: 'Developer',
      application_date: '2023-01-01',
      status: 'applied',
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    } as JobApplication,
    {
      id: '2',
      user_id: 'user2',
      company_name: 'Company B',
      position_title: 'Designer',
      application_date: '2023-02-01',
      status: 'interviewing',
      created_at: '2023-02-01',
      updated_at: '2023-02-01',
    } as JobApplication,
  ];

  describe('setJobs', () => {
    it('should set jobs in the store', () => {
      useStore.getState().setJobs(mockJobs);

      expect(useStore.getState().jobs).toEqual(mockJobs);
    });

    it('should replace existing jobs', () => {
      const initialJobs: JobApplication[] = mockJobs;
      const newJobs: JobApplication[] = [
        {
          id: '2',
          user_id: 'user2',
          company_name: 'Company B',
          position_title: 'Designer',
          application_date: '2023-02-01',
          status: 'interviewing',
          created_at: '2023-02-01',
          updated_at: '2023-02-01',
        } as JobApplication,
      ];

      useStore.getState().setJobs(initialJobs);
      useStore.getState().setJobs(newJobs);

      expect(useStore.getState().jobs).toEqual(newJobs);
    });
  });

  describe('deleteJob', () => {
    it('should delete a job by id', () => {
      useStore.getState().setJobs(mockJobs);
      useStore.getState().deleteJob('1');

      expect(useStore.getState().jobs).toHaveLength(1);
      expect(useStore.getState().jobs[0].id).toBe('2');
    });

    it('should not modify state when deleting non-existent job', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      useStore.getState().setJobs(mockJobs);
      useStore.getState().deleteJob('non-existent');

      expect(useStore.getState().jobs).toEqual(mockJobs);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Cannot delete: Job with id non-existent not found'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('updateJob', () => {
    it('should update a job by id', () => {
      useStore.getState().setJobs(mockJobs);
      useStore.getState().updateJob('1', { company_name: 'Updated Company' });

      expect(useStore.getState().jobs[0].company_name).toBe('Updated Company');
      expect(useStore.getState().jobs[0].position_title).toBe('Developer');
    });

    it('should not modify state when updating non-existent job', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      useStore.getState().setJobs(mockJobs);
      useStore
        .getState()
        .updateJob('non-existent', { company_name: 'Updated' });

      expect(useStore.getState().jobs).toEqual(mockJobs);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Cannot update: Job with id non-existent not found'
      );

      consoleSpy.mockRestore();
    });

    it('should update multiple fields', () => {
      useStore.getState().setJobs(mockJobs);
      useStore.getState().updateJob('1', {
        company_name: 'New Company',
        position_title: 'Senior Developer',
      });

      expect(useStore.getState().jobs[0].company_name).toBe('New Company');
      expect(useStore.getState().jobs[0].position_title).toBe(
        'Senior Developer'
      );
    });
  });

  const mockPhases: InterviewPhase[] = [
    {
      id: 'p1',
      user_id: 'user1',
      job_application_id: 'job1',
      title: 'Phone Screen',
      interviewer_names: [],
      sort_order: 0,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    },
    {
      id: 'p2',
      user_id: 'user1',
      job_application_id: 'job1',
      title: 'Technical',
      interviewer_names: [],
      sort_order: 1,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    },
  ];

  describe('setInterviewPhases', () => {
    it('should set interview phases in the store', () => {
      useStore.getState().setInterviewPhases(mockPhases);
      expect(useStore.getState().interviewPhases).toEqual(mockPhases);
    });

    it('should replace existing interview phases', () => {
      const newPhases: InterviewPhase[] = [mockPhases[1]];
      useStore.getState().setInterviewPhases(mockPhases);
      useStore.getState().setInterviewPhases(newPhases);
      expect(useStore.getState().interviewPhases).toEqual(newPhases);
    });
  });

  describe('addInterviewPhase', () => {
    it('should add a phase to the store', () => {
      useStore.getState().setInterviewPhases([mockPhases[0]]);
      useStore.getState().addInterviewPhase(mockPhases[1]);
      expect(useStore.getState().interviewPhases).toHaveLength(2);
      expect(useStore.getState().interviewPhases[1].id).toBe('p2');
    });
  });

  describe('updateInterviewPhase', () => {
    it('should update a phase by id', () => {
      useStore.getState().setInterviewPhases(mockPhases);
      useStore.getState().updateInterviewPhase('p1', { title: 'Intro Call' });
      expect(useStore.getState().interviewPhases[0].title).toBe('Intro Call');
      expect(useStore.getState().interviewPhases[1].title).toBe('Technical');
    });

    it('should not modify state when updating non-existent phase', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      useStore.getState().setInterviewPhases(mockPhases);
      useStore.getState().updateInterviewPhase('non-existent', { title: 'X' });
      expect(useStore.getState().interviewPhases).toEqual(mockPhases);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Cannot update: Phase with id non-existent not found'
      );
      consoleSpy.mockRestore();
    });
  });

  describe('deleteInterviewPhase', () => {
    it('should delete a phase by id', () => {
      useStore.getState().setInterviewPhases(mockPhases);
      useStore.getState().deleteInterviewPhase('p1');
      expect(useStore.getState().interviewPhases).toHaveLength(1);
      expect(useStore.getState().interviewPhases[0].id).toBe('p2');
    });

    it('should not modify state when deleting non-existent phase', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      useStore.getState().setInterviewPhases(mockPhases);
      useStore.getState().deleteInterviewPhase('non-existent');
      expect(useStore.getState().interviewPhases).toEqual(mockPhases);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Cannot delete: Phase with id non-existent not found'
      );
      consoleSpy.mockRestore();
    });
  });
});
