import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Calendar,
  User,
  Mail,
  Edit,
  ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { JobApplication, InterviewPhase } from "../lib/supabase";
import { useStore } from "../store";
import { interviewPhaseService } from "../services/interviewPhaseService";
import { jobService } from "../services/jobService";
import { Loading } from "../components/Loading";
import JobApplicationForm from "../components/JobApplicationForm";
import InterviewPhaseForm from "../components/InterviewPhaseForm";
import InterviewPhaseTimeline from "../components/InterviewPhaseTimeline";

const statusColors = {
  applied: "bg-blue-100 text-blue-800 border-blue-200",
  interviewing: "bg-yellow-100 text-yellow-800 border-yellow-200",
  offered: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  accepted: "bg-emerald-100 text-emerald-800 border-emerald-200",
  withdrawn: "bg-gray-100 text-gray-800 border-gray-200",
};

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [editingPhase, setEditingPhase] = useState<InterviewPhase | null>(null);

  const jobs = useStore.use.jobs();
  const phases = useStore.use.interviewPhases();
  const setJobs = useStore.use.setJobs();
  const setInterviewPhases = useStore.use.setInterviewPhases();
  const deleteInterviewPhase = useStore.use.deleteInterviewPhase();

  const job = jobs.find((j) => j.id === id);
  const jobPhases = phases
    .filter((p) => p.job_application_id === id)
    .sort((a, b) => a.sort_order - b.sort_order);

  const fetchJobAndPhases = useCallback(async () => {
    if (!id) return;

    try {
      const [jobData, phasesData] = await Promise.all([
        jobService.getJobById(id),
        interviewPhaseService.getPhasesByJobId(id),
      ]);

      if (jobData && !jobs.find((j) => j.id === id)) {
        setJobs([...jobs, jobData]);
      }

      setInterviewPhases(phasesData);
    } catch (err) {
      console.error("Failed to fetch job and phases:", err);
    } finally {
      setIsLoading(false);
    }
  }, [id, jobs, setJobs, setInterviewPhases]);

  useEffect(() => {
    fetchJobAndPhases();
  }, [fetchJobAndPhases]);

  const handleJobFormSuccess = () => {
    setEditingJob(null);
    fetchJobAndPhases();
  };

  const handlePhaseFormSuccess = () => {
    setEditingPhase(null);
    fetchJobAndPhases();
  };

  const handleDeletePhase = async (phaseId: string) => {
    if (!confirm("Are you sure you want to delete this interview phase?"))
      return;

    const success = await interviewPhaseService.deletePhase(phaseId);
    if (success) {
      deleteInterviewPhase(phaseId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  function renderJobValue(val: string | null | undefined, Icon: LucideIcon) {
    if (!val) return null;
    return (
      <div className="flex items-center gap-2 text-color-neutral">
        <Icon className="w-5 h-5" />
        <span className="text-base">{val}</span>
      </div>
    );
  }

  if (isLoading) {
    return <Loading />;
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Job Application Not Found
          </h2>
          <button onClick={() => navigate("/")} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-color-neutral hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        <div className="bg-base-200 rounded-lg shadow-lg border border-base-200 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-color-neutral mb-2">
                {job.position_title}
              </h1>
              <h2 className="text-2xl text-color-neutral font-medium mb-4">
                {job.company_name}
              </h2>
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${statusColors[job.status]}`}
              >
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
            </div>
            <button
              onClick={() => setEditingJob(job)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Job
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {renderJobValue(job.location, MapPin)}
            {renderJobValue(job.salary_range, DollarSign)}
            {renderJobValue(formatDate(job.application_date), Calendar)}
            {renderJobValue(job.contact_person, User)}
            {renderJobValue(job.contact_email, Mail)}
          </div>

          {job.job_posting_link && (
            <div className="mb-6">
              <a
                href={job.job_posting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:underline"
              >
                <span>View Job Posting</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {job.job_description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-color-neutral mb-2">
                Job Description
              </h3>
              <div className="p-4 bg-accent/70 rounded-lg">
                <p className="text-sm text-accent-content whitespace-pre-wrap">
                  {job.job_description}
                </p>
              </div>
            </div>
          )}

          {job.notes && (
            <div>
              <h3 className="text-lg font-semibold text-color-neutral mb-2">
                Notes
              </h3>
              <div className="p-4 bg-info/70 rounded-lg border border-blue-100">
                <p className="text-sm text-info-content whitespace-pre-wrap">
                  {job.notes}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-base-200 rounded-lg shadow-lg border border-base-200 p-8">
          <h2 className="text-2xl font-bold text-color-neutral mb-6">
            Interview Process
          </h2>
          <InterviewPhaseTimeline
            phases={jobPhases}
            onAdd={() => setEditingPhase({} as InterviewPhase)}
            onEdit={setEditingPhase}
            onDelete={handleDeletePhase}
          />
        </div>
      </div>

      {editingJob && (
        <JobApplicationForm
          jobToEdit={editingJob}
          onSuccess={handleJobFormSuccess}
          onCancel={() => setEditingJob(null)}
        />
      )}

      {editingPhase && id && (
        <InterviewPhaseForm
          phaseToEdit={editingPhase}
          jobId={id}
          onSuccess={handlePhaseFormSuccess}
          onCancel={() => setEditingPhase(null)}
        />
      )}
    </div>
  );
}
