-- Add a new column 'job_posting_link' of type TEXT to the 'job_applications' table
ALTER TABLE IF EXISTS job_applications
ADD COLUMN job_posting_link TEXT;