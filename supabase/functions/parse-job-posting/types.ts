export type ParsedJobPostingFields = {
  company_name?: string;
  position_title?: string;
  location?: string;
  salary_range?: string;
  job_description?: string;
};

export type FailureReason = 'invalid_url' | 'fetch_failed' | 'timeout';

export type ExtractResult = {
  found: boolean;
  fields: ParsedJobPostingFields;
};
