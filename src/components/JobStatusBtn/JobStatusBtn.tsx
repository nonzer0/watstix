import { JobApplication } from "../../lib/supabase";

type StatusFilter = "all" | JobApplication["status"];

interface StatusGridProps {
  status: { label: string; value: StatusFilter; color: string };
  statusFilter: string;
  setStatusFilter: (status: StatusFilter) => void;
  applications: JobApplication[];
}

export function JobStatusBtn({
  status,
  statusFilter,
  setStatusFilter,
  applications,
}: StatusGridProps) {
  const getStatusCount = (status: JobApplication["status"]) => {
    return applications.filter((app) => app.status === status).length;
  };

  return (
    <button
      onClick={() => setStatusFilter(status.value)}
      className={`px-4 py-3 rounded-lg border-2 transition-all ${
        statusFilter === status.value
          ? `${status.color} text-white border-transparent shadow-md`
          : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow"
      }`}
    >
      <div className="text-sm font-medium">{status.label}</div>
      <div className="text-xl font-bold">
        {status.value === "all"
          ? applications.length
          : getStatusCount(status.value as JobApplication["status"])}
      </div>
    </button>
  );
}
