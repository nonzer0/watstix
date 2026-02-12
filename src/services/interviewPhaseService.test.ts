import { describe, it, expect, vi, beforeEach } from 'vitest';
import { interviewPhaseService } from './interviewPhaseService';
import { supabase } from '../lib/supabase';
import type { InterviewPhase } from '../lib/supabase';

// Mock the supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('interviewPhaseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPhase: InterviewPhase = {
    id: '123',
    user_id: 'user-1',
    job_application_id: 'job-1',
    title: 'Phone Screen',
    description: 'Initial phone screening',
    interview_date: '2025-01-20T10:00:00Z',
    interviewer_names: ['Jane Doe'],
    notes: 'Went well',
    outcome: 'passed',
    sort_order: 0,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
  };

  describe('getPhasesByJobId', () => {
    it('should fetch phases for a job successfully', async () => {
      const mockData = [mockPhase];
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi
        .fn()
        .mockResolvedValue({ data: mockData, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await interviewPhaseService.getPhasesByJobId('job-1');

      expect(supabase.from).toHaveBeenCalledWith('interview_phases');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('job_application_id', 'job-1');
      expect(mockOrder).toHaveBeenCalledWith('sort_order', { ascending: true });
      expect(result).toEqual(mockData);
    });

    it('should return empty array on error', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      } as unknown as ReturnType<typeof supabase.from>);

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await interviewPhaseService.getPhasesByJobId('job-1');

      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch interview phases:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('createPhase', () => {
    it('should create a phase successfully', async () => {
      const newPhaseData = {
        user_id: 'user-1',
        job_application_id: 'job-1',
        title: 'Technical Interview',
        sort_order: 1,
      };

      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: { ...mockPhase, ...newPhaseData },
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await interviewPhaseService.createPhase(newPhaseData);

      expect(supabase.from).toHaveBeenCalledWith('interview_phases');
      expect(mockInsert).toHaveBeenCalledWith([newPhaseData]);
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();
      expect(result).toEqual({ ...mockPhase, ...newPhaseData });
    });

    it('should return null on error', async () => {
      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Insert failed'),
      });

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      } as unknown as ReturnType<typeof supabase.from>);

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await interviewPhaseService.createPhase({
        title: 'Test Phase',
      });

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to create interview phase:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('updatePhase', () => {
    it('should update a phase successfully', async () => {
      const updates = { title: 'Updated Title', outcome: 'passed' };

      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ data: null, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await interviewPhaseService.updatePhase('123', updates);

      expect(supabase.from).toHaveBeenCalledWith('interview_phases');
      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(mockEq).toHaveBeenCalledWith('id', '123');
      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Update failed'),
      });

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
      } as unknown as ReturnType<typeof supabase.from>);

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await interviewPhaseService.updatePhase('123', {
        title: 'Updated',
      });

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to update interview phase:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('deletePhase', () => {
    it('should delete a phase successfully', async () => {
      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ data: null, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
        eq: mockEq,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await interviewPhaseService.deletePhase('123');

      expect(supabase.from).toHaveBeenCalledWith('interview_phases');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', '123');
      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Delete failed'),
      });

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
        eq: mockEq,
      } as unknown as ReturnType<typeof supabase.from>);

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await interviewPhaseService.deletePhase('123');

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to delete interview phase:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('reorderPhases', () => {
    it('should reorder phases successfully', async () => {
      const phaseIds = ['phase-1', 'phase-2', 'phase-3'];

      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq1 = vi.fn().mockReturnThis();
      const mockEq2 = vi.fn().mockResolvedValue({ data: null, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: mockEq1.mockReturnValue({ eq: mockEq2 }),
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await interviewPhaseService.reorderPhases(
        'job-1',
        phaseIds
      );

      expect(supabase.from).toHaveBeenCalledTimes(3);
      expect(mockUpdate).toHaveBeenCalledTimes(3);
      expect(mockUpdate).toHaveBeenNthCalledWith(1, { sort_order: 0 });
      expect(mockUpdate).toHaveBeenNthCalledWith(2, { sort_order: 1 });
      expect(mockUpdate).toHaveBeenNthCalledWith(3, { sort_order: 2 });
      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      const phaseIds = ['phase-1', 'phase-2'];

      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq1 = vi.fn().mockReturnThis();
      const mockEq2 = vi
        .fn()
        .mockResolvedValueOnce({ data: null, error: null })
        .mockResolvedValueOnce({
          data: null,
          error: new Error('Update failed'),
        });

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: mockEq1.mockReturnValue({ eq: mockEq2 }),
      } as unknown as ReturnType<typeof supabase.from>);

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await interviewPhaseService.reorderPhases(
        'job-1',
        phaseIds
      );

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to reorder interview phases:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
