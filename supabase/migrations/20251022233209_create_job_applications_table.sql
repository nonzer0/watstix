/*
  # Job Applications Tracker Schema

  1. New Tables
    - `job_applications`
      - `id` (uuid, primary key) - Unique identifier for each application
      - `company_name` (text, required) - Name of the company
      - `position_title` (text, required) - Job title/position
      - `job_description` (text) - Description of the job
      - `location` (text) - Job location
      - `salary_range` (text) - Expected salary range
      - `application_date` (date, required) - Date when applied
      - `status` (text, required) - Application status (applied, interviewing, offered, rejected, accepted, withdrawn)
      - `contact_person` (text) - Name of recruiter/contact
      - `contact_email` (text) - Contact email
      - `notes` (text) - Additional notes about the application
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on `job_applications` table
    - Add policies for public access (no auth required for this app)
    
  3. Indexes
    - Index on status for efficient filtering
    - Index on application_date for sorting
*/

CREATE TABLE IF NOT EXISTS job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  position_title text NOT NULL,
  job_description text DEFAULT '',
  location text DEFAULT '',
  salary_range text DEFAULT '',
  application_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'applied',
  contact_person text DEFAULT '',
  contact_email text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (anyone can CRUD)
CREATE POLICY "Anyone can view job applications"
  ON job_applications FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert job applications"
  ON job_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update job applications"
  ON job_applications FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete job applications"
  ON job_applications FOR DELETE
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_date ON job_applications(application_date DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();