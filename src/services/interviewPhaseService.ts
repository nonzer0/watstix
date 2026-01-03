import { supabase, InterviewPhase } from "../lib/supabase";

const getPhasesByJobId = async (jobId: string): Promise<InterviewPhase[]> => {
  const phases: InterviewPhase[] = [];
  try {
    const { data, error } = await supabase
      .from("interview_phases")
      .select("*")
      .eq("job_application_id", jobId)
      .order("sort_order", { ascending: true });

    if (data) {
      phases.push(...data);
    }
    if (error) throw error;
  } catch (err) {
    console.error("Failed to fetch interview phases:", err);
  }
  return phases;
};

const createPhase = async (
  phase: Partial<InterviewPhase>,
): Promise<InterviewPhase | null> => {
  try {
    const { data, error } = await supabase
      .from("interview_phases")
      .insert([phase])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Failed to create interview phase:", err);
    return null;
  }
};

const updatePhase = async (
  id: string,
  updates: Partial<InterviewPhase>,
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("interview_phases")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Failed to update interview phase:", err);
    return false;
  }
};

const deletePhase = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("interview_phases")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Failed to delete interview phase:", err);
    return false;
  }
};

const reorderPhases = async (
  jobId: string,
  phaseIds: string[],
): Promise<boolean> => {
  try {
    const updates = phaseIds.map((phaseId, index) => ({
      id: phaseId,
      sort_order: index,
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from("interview_phases")
        .update({ sort_order: update.sort_order })
        .eq("id", update.id)
        .eq("job_application_id", jobId);

      if (error) throw error;
    }

    return true;
  } catch (err) {
    console.error("Failed to reorder interview phases:", err);
    return false;
  }
};

export const interviewPhaseService = {
  getPhasesByJobId,
  createPhase,
  updatePhase,
  deletePhase,
  reorderPhases,
};
