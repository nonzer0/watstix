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

  describe('setInterviewPhases', () => {
    const mockPhases: InterviewPhase[] = [
      {
        id: 'phase-1',
        user_id: 'user1',
        job_application_id: 'job-1',
        title: 'Phone Screen',
        interviewer_names: ['Jane Doe'],
        sort_order: 0,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      } as InterviewPhase,
      {
        id: 'phase-2',
        user_id: 'user1',
        job_application_id: 'job-1',
        title: 'Technical Interview',
        interviewer_names: ['John Smith'],
        sort_order: 1,
        created_at: '2023-01-02',
        updated_at: '2023-01-02',
      } as InterviewPhase,
    ];

    it('should set interview phases in the store', () => {
      useStore.getState().setInterviewPhases(mockPhases);

      expect(useStore.getState().interviewPhases).toEqual(mockPhases);
    });

    it('should replace existing interview phases', () => {
      const newPhases: InterviewPhase[] = [mockPhases[0]];

      useStore.getState().setInterviewPhases(mockPhases);
      useStore.getState().setInterviewPhases(newPhases);

      expect(useStore.getState().interviewPhases).toEqual(newPhases);
    });
  });

  describe('addInterviewPhase', () => {
    const newPhase: InterviewPhase = {
      id: 'phase-3',
      user_id: 'user1',
      job_application_id: 'job-1',
      title: 'Final Interview',
      interviewer_names: ['CEO'],
      sort_order: 2,
      created_at: '2023-01-03',
      updated_at: '2023-01-03',
    } as InterviewPhase;

    it('should add a new interview phase', () => {
      useStore.getState().addInterviewPhase(newPhase);

      expect(useStore.getState().interviewPhases).toHaveLength(1);
      expect(useStore.getState().interviewPhases[0]).toEqual(newPhase);
    });

    it('should append to existing phases', () => {
      const existingPhase: InterviewPhase = {
        id: 'phase-1',
        user_id: 'user1',
        job_application_id: 'job-1',
        title: 'Phone Screen',
        interviewer_names: [],
        sort_order: 0,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      } as InterviewPhase;

      useStore.getState().setInterviewPhases([existingPhase]);
      useStore.getState().addInterviewPhase(newPhase);

      expect(useStore.getState().interviewPhases).toHaveLength(2);
      expect(useStore.getState().interviewPhases[1]).toEqual(newPhase);
    });
  });

  describe('updateInterviewPhase', () => {
    const mockPhases: InterviewPhase[] = [
      {
        id: 'phase-1',
        user_id: 'user1',
        job_application_id: 'job-1',
        title: 'Phone Screen',
        interviewer_names: ['Jane Doe'],
        sort_order: 0,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      } as InterviewPhase,
      {
        id: 'phase-2',
        user_id: 'user1',
        job_application_id: 'job-1',
        title: 'Technical Interview',
        interviewer_names: ['John Smith'],
        sort_order: 1,
        created_at: '2023-01-02',
        updated_at: '2023-01-02',
      } as InterviewPhase,
    ];

    it('should update an interview phase by id', () => {
      useStore.getState().setInterviewPhases(mockPhases);
      useStore.getState().updateInterviewPhase('phase-1', {
        title: 'Updated Phone Screen',
        outcome: 'passed',
      });

      expect(useStore.getState().interviewPhases[0].title).toBe(
        'Updated Phone Screen'
      );
      expect(useStore.getState().interviewPhases[0].outcome).toBe('passed');
    });

    it('should not modify state when updating non-existent phase', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      useStore.getState().setInterviewPhases(mockPhases);
      useStore.getState().updateInterviewPhase('non-existent', {
        title: 'Updated',
      });

      expect(useStore.getState().interviewPhases).toEqual(mockPhases);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Cannot update: Phase with id non-existent not found'
      );

      consoleSpy.mockRestore();
    });

    it('should update multiple fields', () => {
      useStore.getState().setInterviewPhases(mockPhases);
      useStore.getState().updateInterviewPhase('phase-1', {
        title: 'New Title',
        notes: 'Great interview!',
        outcome: 'passed',
      });

      expect(useStore.getState().interviewPhases[0].title).toBe('New Title');
      expect(useStore.getState().interviewPhases[0].notes).toBe(
        'Great interview!'
      );
      expect(useStore.getState().interviewPhases[0].outcome).toBe('passed');
    });
  });

  describe('deleteInterviewPhase', () => {
    const mockPhases: InterviewPhase[] = [
      {
        id: 'phase-1',
        user_id: 'user1',
        job_application_id: 'job-1',
        title: 'Phone Screen',
        interviewer_names: [],
        sort_order: 0,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      } as InterviewPhase,
      {
        id: 'phase-2',
        user_id: 'user1',
        job_application_id: 'job-1',
        title: 'Technical Interview',
        interviewer_names: [],
        sort_order: 1,
        created_at: '2023-01-02',
        updated_at: '2023-01-02',
      } as InterviewPhase,
    ];

    it('should delete an interview phase by id', () => {
      useStore.getState().setInterviewPhases(mockPhases);
      useStore.getState().deleteInterviewPhase('phase-1');

      expect(useStore.getState().interviewPhases).toHaveLength(1);
      expect(useStore.getState().interviewPhases[0].id).toBe('phase-2');
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
