import { useState } from "react";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  User,
  Mail,
  Trash2,
  Edit,
  ExternalLink,
} from "lucide-react";
import JobApplicationForm from "./JobApplicationForm";
import { useStore } from "../store/store";
import { JobApplication, supabase } from "../lib/supabase";

interface JobApplicationCardProps {
  application: JobApplication;
  onUpdate: () => void;
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
}: JobApplicationCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // const [showForm, setShowForm] = useState(false);

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

  const isEdit = useStore((state) => state.isEditing);
  const toggleEditing = useStore((state) => state.toggleEditing);
  const updateJobInEdit = useStore((state) => state.updateJobInEdit);

  const handleEdit = async () => {
    console.log("Edit functionality to be implemented");
    // console.log("state before:", state);
    toggleEditing();
    updateJobInEdit(application);
    // console.log("state after:", state);
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
        {application.location && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{application.location}</span>
          </div>
        )}

        {application.salary_range && (
          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">{application.salary_range}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">
            Applied on {formatDate(application.application_date)}
          </span>
        </div>

        {application.contact_person && (
          <div className="flex items-center gap-2 text-gray-600">
            <User className="w-4 h-4" />
            <span className="text-sm">{application.contact_person}</span>
          </div>
        )}

        {application.contact_email && (
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="w-4 h-4" />
            <span className="text-sm">{application.contact_email}</span>
          </div>
        )}
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
