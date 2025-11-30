import { supabase, JobApplication } from "../lib/supabase";

const getJobs = async (): Promise<JobApplication[]> => {
  const jobs: JobApplication[] = [];
  try {
    const { data, error } = await supabase
      .from("job_applications")
      .select("*")
      .order("application_date", { ascending: false });

    if (data) {
      jobs.push(...data);
    }
    if (error) throw error;
    //   setApplications(data || []);
  } catch (err) {
    console.error("Failed to fetch applications:", err);
  } finally {
    return jobs;
    //   setIsLoading(false);
  }
};

const getJobById = async (id: string): Promise<JobApplication | null> => {
  try {
    const { data, error } = await supabase
      .from("job_applications")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Failed to fetch application by ID:", err);
    return null;
  }
};

export const jobService = {
  getJobs,
  getJobById,
};
