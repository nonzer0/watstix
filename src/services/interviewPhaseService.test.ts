import { describe, it, expect, vi, beforeEach } from 'vitest';
import { interviewPhaseService } from './interviewPhaseService';
import { supabase } from '../lib/supabase';
import type { InterviewPhase } from '../lib/supabase';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
  InterviewPhase: {},
}));

describe('interviewPhaseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getPhasesByJobId', () => {
    it('should return phases when data is available', async () => {
      const mockPhases: Partial<InterviewPhase>[] = [
        {
          id: 'phase-1',
          job_application_id: 'job-1',
          title: 'Phone Screen',
          sort_order: 0,
        },
        {
          id: 'phase-2',
          job_application_id: 'job-1',
          title: 'Technical Interview',
          sort_order: 1,
        },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockPhases, error: null }),
          }),
        }),
      });

      (supabase.from as any) = mockFrom;

      const result = await interviewPhaseService.getPhasesByJobId('job-1');

      expect(result).toEqual(mockPhases);
      expect(mockFrom).toHaveBeenCalledWith('interview_phases');
    });

    it('should return empty array when data is null', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      });

      (supabase.from as any) = mockFrom;

      const result = await interviewPhaseService.getPhasesByJobId('job-1');

      expect(result).toEqual([]);
    });

    it('should return empty array and log error on failure', async () => {
      const mockError = new Error('Database error');
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
          }),
        }),
      });

      (supabase.from as any) = mockFrom;

      const result = await interviewPhaseService.getPhasesByJobId('job-1');

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to fetch interview phases:',
        mockError
      );
    });

    it('should order phases by sort_order ascending', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      });

      (supabase.from as any) = mockFrom;

      await interviewPhaseService.getPhasesByJobId('job-1');

      const orderCall = mockFrom().select().eq().order;
      expect(orderCall).toHaveBeenCalledWith('sort_order', {
        ascending: true,
      });
    });
  });

  describe('createPhase', () => {
    it('should create and return phase when successful', async () => {
      const newPhase: Partial<InterviewPhase> = {
        job_application_id: 'job-1',
        title: 'Phone Screen',
        sort_order: 0,
      };

      const createdPhase = {
        ...newPhase,
        id: 'phase-1',
        created_at: '2024-01-01',
      };

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi
              .fn()
              .mockResolvedValue({ data: createdPhase, error: null }),
          }),
        }),
      });

      (supabase.from as any) = mockFrom;

      const result = await interviewPhaseService.createPhase(newPhase);

      expect(result).toEqual(createdPhase);
      expect(mockFrom).toHaveBeenCalledWith('interview_phases');
    });

    it('should return null and log error when creation fails', async () => {
      const mockError = new Error('Insert failed');
      const newPhase: Partial<InterviewPhase> = {
        job_application_id: 'job-1',
        title: 'Phone Screen',
      };

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
          }),
        }),
      });

      (supabase.from as any) = mockFrom;

      const result = await interviewPhaseService.createPhase(newPhase);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Failed to create interview phase:',
        mockError
      );
    });
  });

  describe('updatePhase', () => {
    it('should return true when update is successful', async () => {
      const updates: Partial<InterviewPhase> = {
        title: 'Updated Title',
        outcome: 'passed',
      };

      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      (supabase.from as any) = mockFrom;

      const result = await interviewPhaseService.updatePhase(
        'phase-1',
        updates
      );

      expect(result).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith('interview_phases');
    });

    it('should return false and log error when update fails', async () => {
      const mockError = new Error('Update failed');
      const updates: Partial<InterviewPhase> = {
        title: 'Updated Title',
      };

      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: mockError }),
        }),
      });

      (supabase.from as any) = mockFrom;

      const result = await interviewPhaseService.updatePhase(
        'phase-1',
        updates
      );

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to update interview phase:',
        mockError
      );
    });
  });

  describe('deletePhase', () => {
    it('should return true when deletion is successful', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      (supabase.from as any) = mockFrom;

      const result = await interviewPhaseService.deletePhase('phase-1');

      expect(result).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith('interview_phases');
    });

    it('should return false and log error when deletion fails', async () => {
      const mockError = new Error('Delete failed');
      const mockFrom = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: mockError }),
        }),
      });

      (supabase.from as any) = mockFrom;

      const result = await interviewPhaseService.deletePhase('phase-1');

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to delete interview phase:',
        mockError
      );
    });
  });

  describe('reorderPhases', () => {
    it('should return true when reordering is successful', async () => {
      const phaseIds = ['phase-1', 'phase-2', 'phase-3'];

      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      });

      (supabase.from as any) = mockFrom;

      const result = await interviewPhaseService.reorderPhases(
        'job-1',
        phaseIds
      );

      expect(result).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith('interview_phases');
      // Should be called once for each phase
      expect(mockFrom).toHaveBeenCalledTimes(3);
    });

    it('should update each phase with correct sort_order', async () => {
      const phaseIds = ['phase-1', 'phase-2'];
      const updateCalls: any[] = [];

      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockImplementation((data) => {
          updateCalls.push(data);
          return {
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }),
      });

      (supabase.from as any) = mockFrom;

      await interviewPhaseService.reorderPhases('job-1', phaseIds);

      expect(updateCalls).toEqual([{ sort_order: 0 }, { sort_order: 1 }]);
    });

    it('should return false and log error when reordering fails', async () => {
      const mockError = new Error('Update failed');
      const phaseIds = ['phase-1', 'phase-2'];

      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: mockError }),
          }),
        }),
      });

      (supabase.from as any) = mockFrom;

      const result = await interviewPhaseService.reorderPhases(
        'job-1',
        phaseIds
      );

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to reorder interview phases:',
        mockError
      );
    });

    it('should verify job_application_id in update query', async () => {
      const phaseIds = ['phase-1'];
      let eqCalls: any[] = [];

      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockImplementation((field, value) => {
            eqCalls.push({ field, value });
            return {
              eq: vi.fn().mockImplementation((field, value) => {
                eqCalls.push({ field, value });
                return Promise.resolve({ error: null });
              }),
            };
          }),
        }),
      });

      (supabase.from as any) = mockFrom;

      await interviewPhaseService.reorderPhases('job-1', phaseIds);

      expect(eqCalls).toContainEqual({ field: 'id', value: 'phase-1' });
      expect(eqCalls).toContainEqual({
        field: 'job_application_id',
        value: 'job-1',
      });
    });
  });
});
