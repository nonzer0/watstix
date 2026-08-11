import { supabase } from '../lib/supabase';
import { ParsedJobPosting } from '../types/types';

const parseJobPosting = async (
  url: string
): Promise<ParsedJobPosting | null> => {
  try {
    const { data, error } = await supabase.functions.invoke<ParsedJobPosting>(
      'parse-job-posting',
      { body: { url } }
    );

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Failed to parse job posting:', err);
    return null;
  }
};

export const jobPostingService = {
  parseJobPosting,
};
