/*
  # Update RLS Policies for Authentication

  1. Changes
    - Drop existing public access policies
    - Add user_id column to job_applications table
    - Create new RLS policies that require authentication
    - Only allow users to access their own job applications

  2. Security
    - Users can only view their own applications
    - Users can only insert applications for themselves
    - Users can only update their own applications
    - Users can only delete their own applications
*/

-- Add user_id column to link applications to users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_applications' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE job_applications ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Drop old public policies
DROP POLICY IF EXISTS "Anyone can view job applications" ON job_applications;
DROP POLICY IF EXISTS "Anyone can insert job applications" ON job_applications;
DROP POLICY IF EXISTS "Anyone can update job applications" ON job_applications;
DROP POLICY IF EXISTS "Anyone can delete job applications" ON job_applications;

-- Create new authenticated policies
CREATE POLICY "Users can view own job applications"
  ON job_applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own job applications"
  ON job_applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own job applications"
  ON job_applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own job applications"
  ON job_applications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index on user_id for better performance
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);