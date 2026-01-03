/*
  # Interview Phases Table

  1. New Tables
    - `interview_phases`
      - `id` (uuid, primary key) - Unique identifier for each interview phase
      - `user_id` (uuid, foreign key) - References auth.users(id)
      - `job_application_id` (uuid, foreign key) - References job_applications(id)
      - `title` (text, required) - Name/title of the interview phase
      - `description` (text) - Additional details about the phase
      - `interview_date` (timestamptz) - When the interview happened or is scheduled
      - `interviewer_names` (text[]) - Array of interviewer names
      - `notes` (text) - Notes and feedback from the interview
      - `outcome` (text) - Result of the interview (pending, passed, failed, etc.)
      - `sort_order` (integer, required) - Order of phases within a job application
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on `interview_phases` table
    - Add policies for authenticated users to manage their own phases
    - Cascade delete when user or job application is deleted

  3. Indexes
    - Index on user_id for efficient user-based queries
    - Index on job_application_id for efficient job-based queries
    - Index on (job_application_id, sort_order) for ordered retrieval
*/

CREATE TABLE IF NOT EXISTS interview_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_application_id uuid REFERENCES job_applications(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  interview_date timestamptz,
  interviewer_names text[] DEFAULT '{}',
  notes text DEFAULT '',
  outcome text DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE interview_phases ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view own interview phases"
  ON interview_phases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interview phases"
  ON interview_phases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interview phases"
  ON interview_phases FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own interview phases"
  ON interview_phases FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_interview_phases_user_id ON interview_phases(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_phases_job_id ON interview_phases(job_application_id);
CREATE INDEX IF NOT EXISTS idx_interview_phases_sort_order ON interview_phases(job_application_id, sort_order);

-- Create updated_at trigger (reuses existing function)
CREATE TRIGGER update_interview_phases_updated_at
  BEFORE UPDATE ON interview_phases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
