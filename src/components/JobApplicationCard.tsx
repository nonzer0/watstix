import { useState } from "react";
import {
  MapPin,
  DollarSign,
  Calendar,
  User,
  Mail,
  Trash2,
  Edit,
  ExternalLink,
  LucideIcon,
} from "lucide-react";
import { JobApplication, supabase } from "../lib/supabase";

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
  onUpdate,
  onEdit,
}: JobApplicationCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this application?")) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("job_applications")
        .delete()
        .eq("id", application.id);

      if (error) throw error;
      onUpdate();
    } catch (err) {
      alert("Failed to delete application");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: JobApplication["status"]) => {
    try {
      const { error } = await supabase
        .from("job_applications")
        .update({ status: newStatus })
        .eq("id", application.id);

      if (error) throw error;
      onUpdate();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  function renderJobField(value: string, Icon: LucideIcon) {
    if (!value) return null;
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{value}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {application.position_title}
          </h3>
          <p className="text-lg text-gray-700 font-medium">
            {application.company_name}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="subtle-btn hover:text-red-600 hover:bg-red-50"
            title="Delete application"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onEdit(application)}
            className="subtle-btn hover:text-blue-600 hover:bg-blue-50"
            title="Edit application"
          >
            <Edit className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {application.location && renderJobField(application.location, MapPin)}

        {application.salary_range &&
          renderJobField(application.salary_range, DollarSign)}

        {renderJobField(application.application_date, Calendar)}

        {application.contact_person &&
          renderJobField(application.contact_person, User)}

        {application.contact_email &&
          renderJobField(application.contact_email, Mail)}
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
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700 line-clamp-3">
            {application.job_description}
          </p>
        </div>
      )}

      {application.notes && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-gray-700">{application.notes}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <select
          value={application.status}
          onChange={(e) =>
            handleStatusChange(e.target.value as JobApplication["status"])
          }
          className={`px-3 py-1.5 rounded-full text-sm font-medium border ${statusColors[application.status]} cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none`}
        >
          <option value="applied">Applied</option>
          <option value="interviewing">Interviewing</option>
          <option value="offered">Offered</option>
          <option value="rejected">Rejected</option>
          <option value="accepted">Accepted</option>
          <option value="withdrawn">Withdrawn</option>
        </select>

        <span className="text-xs text-gray-500">
          Updated {formatDate(application.updated_at)}
        </span>
      </div>
    </div>
  );
}
