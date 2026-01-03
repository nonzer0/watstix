import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  status:
    | "applied"
    | "interviewing"
    | "offered"
    | "rejected"
    | "accepted"
    | "withdrawn";
  contact_person?: string;
  contact_email?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
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
