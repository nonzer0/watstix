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

const deleteJobById = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("job_applications")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Failed to delete application by ID:", err);
    return false;
  }
};

export const jobService = {
  getJobs,
  getJobById,
  deleteJobById,
};
