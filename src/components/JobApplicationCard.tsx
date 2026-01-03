import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  DollarSign,
  Calendar,
  User,
  Mail,
  Trash2,
  Edit,
  ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { JobApplication, supabase } from "../lib/supabase";
import { jobService } from "../services/jobService";
import { useStore } from "../store";

interface JobApplicationCardProps {
  application: JobApplication;
  onUpdate: () => void;
  onEdit: (job: JobApplication) => void;
}

const statusColors = {
  applied: "bg-blue-100 text-blue-800 border-blue-200",
  interviewing: "bg-yellow-100 text-yellow-800 border-yellow-200",
  offered: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  accepted: "bg-emerald-100 text-emerald-800 border-emerald-200",
  withdrawn: "bg-gray-100 text-gray-800 border-gray-200",
};

export default function JobApplicationCard({
  application,
  onEdit,
}: JobApplicationCardProps) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteJob = useStore.use.deleteJob();
  const updateJob = useStore.use.updateJob();

  const handleCardClick = () => {
    navigate(`/job/${application.id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this application?")) return;

    setIsDeleting(true);
    await jobService.deleteJobById(application.id);
    deleteJob(application.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(application);
  };

  const handleStatusChange = async (newStatus: JobApplication["status"]) => {
    try {
      const { error } = await supabase
        .from("job_applications")
        .update({ status: newStatus })
        .eq("id", application.id);

      if (error) throw error;
      updateJob(application.id, { status: newStatus });
    } catch (err) {
      alert(`Failed to update status ${err}`);
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
        <Icon className="w-4 h-4" />
        <span className="text-sm">{val}</span>
      </div>
    );
  }

  return (
    <div
      onClick={handleCardClick}
      className="bg-base-400 rounded-lg shadow-md border border-base-400 p-6 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-color-neutral mb-1">
            {application.position_title}
          </h3>
          <p className="text-lg text-color-neutral font-medium">
            {application.company_name}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
            title="Delete application"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleEdit}
            className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
            title="Edit application"
          >
            <Edit className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {renderJobValue(application.location, MapPin)}
        {renderJobValue(application.salary_range, DollarSign)}
        {renderJobValue(application.application_date, Calendar)}
        {renderJobValue(application.contact_person, User)}
        {renderJobValue(application.contact_email, Mail)}
      </div>

      {application.job_posting_link && (
        <div className="mb-4">
          <a
            href={application.job_posting_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            View Job Posting
          </a>
          <ExternalLink className="inline-block w-4 h-4 ml-1 text-blue-600" />
        </div>
      )}

      {application.job_description && (
        <div className="mb-4 p-3 bg-accent/70 rounded-lg">
          <p className="text-sm text-accent-content line-clamp-3">
            {application.job_description}
          </p>
        </div>
      )}

      {application.notes && (
        <div className="mb-4 p-3 bg-info/70 rounded-lg border border-blue-100">
          <p className="text-sm text-info-content">{application.notes}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <select
          value={application.status}
          onChange={(e) =>
            handleStatusChange(e.target.value as JobApplication["status"])
          }
          className={`px-3 py-1.5 rounded-full text-sm font-medium border ${statusColors[application.status]} cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-hidden`}
        >
          <option value="applied">Applied</option>
          <option value="interviewing">Interviewing</option>
          <option value="offered">Offered</option>
          <option value="rejected">Rejected</option>
          <option value="accepted">Accepted</option>
          <option value="withdrawn">Withdrawn</option>
        </select>

        <span className="text-xs text-color-neutral">
          Updated {formatDate(application.updated_at)}
        </span>
      </div>
    </div>
  );
}
