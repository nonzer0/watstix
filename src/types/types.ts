export type Status =
  | 'applied'
  | 'interviewing'
  | 'offered'
  | 'rejected'
  | 'accepted'
  | 'withdrawn';

export type JobApplication = {
  id: string;
  user_id: string;
  company_name: string;
  position_title: string;
  job_description?: string;
  job_posting_link?: string;
  location?: string;
  salary_range?: string;
  application_date: string;
  status: Status;
  contact_person?: string;
  contact_email?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type StatusFilter = 'all' | JobApplication['status'];

export interface StatusType {
  value: StatusFilter;
  label: string;
  color: string;
}

export type ParsedJobPosting = {
  found: boolean;
  fields: Partial<
    Pick<
      JobApplication,
      | 'company_name'
      | 'position_title'
      | 'location'
      | 'salary_range'
      | 'job_description'
    >
  >;
  error?: 'invalid_url' | 'fetch_failed' | 'timeout';
};

export type InterviewPhase = {
  id: string;
  user_id: string;
  job_application_id: string;
  title: string;
  description?: string;
  interview_date?: string;
  interviewer_names: string[];
  notes?: string;
  outcome?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};
