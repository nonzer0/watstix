import { describe, it, expect, vi, beforeEach } from 'vitest';
import { jobPostingService } from './jobPostingService';
import { supabase } from '../lib/supabase';

vi.mock('../lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('jobPostingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('parseJobPosting', () => {
    it('returns the parsed result when the function call succeeds', async () => {
      const mockResult = {
        found: true,
        fields: { company_name: 'Acme', position_title: 'Engineer' },
      };
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockResult,
        error: null,
      });

      const result = await jobPostingService.parseJobPosting(
        'https://example.com/jobs/1'
      );

      expect(result).toEqual(mockResult);
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'parse-job-posting',
        { body: { url: 'https://example.com/jobs/1' } }
      );
    });

    it('returns null and logs an error when the function call returns an error', async () => {
      const mockError = new Error('Function invocation failed');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await jobPostingService.parseJobPosting(
        'https://example.com/jobs/1'
      );

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Failed to parse job posting:',
        mockError
      );
    });

    it('returns null and logs an error when invoke throws', async () => {
      const mockError = new Error('Network error');
      vi.mocked(supabase.functions.invoke).mockRejectedValue(mockError);

      const result = await jobPostingService.parseJobPosting(
        'https://example.com/jobs/1'
      );

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Failed to parse job posting:',
        mockError
      );
    });
  });
});
