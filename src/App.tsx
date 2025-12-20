import { useEffect, useState } from "react";
import { Plus, Briefcase } from "lucide-react";
import { JobApplication, StatusFilter, StatusType } from "./types/types";
import { supabase } from "./lib/supabase";
import { useAuth } from "./contexts/AuthContext";
import { Header } from "./components/Header";
import JobApplicationForm from "./components/JobApplicationForm";
import JobApplicationCard from "./components/JobApplicationCard";
import { Loading } from "./components/Loading";
import AuthForm from "./components/AuthForm";
import { JobStatusBtn } from "./components/JobStatusBtn";

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    JobApplication[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .order("application_date", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(
        applications.filter((app) => app.status === statusFilter),
      );
    }
  }, [applications, statusFilter]);

  if (authLoading) {
    return <Loading />;
  }

  if (!user) {
    return <AuthForm />;
  }

  const handleFormSuccess = () => {
    setEditingJob(null);
    fetchApplications();
  };

  const displayForm = editingJob !== null;

  const statuses: StatusType[] = [
    { value: "all", label: "All", color: "bg-gray-600" },
    { value: "applied", label: "Applied", color: "bg-blue-600" },
    { value: "interviewing", label: "Interviewing", color: "bg-yellow-600" },
    { value: "offered", label: "Offered", color: "bg-green-600" },
    { value: "rejected", label: "Rejected", color: "bg-red-600" },
    { value: "accepted", label: "Accepted", color: "bg-emerald-600" },
    { value: "withdrawn", label: "Withdrawn", color: "bg-gray-500" },
  ];

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Header
            setShowForm={() => setEditingJob({} as JobApplication)}
            signOut={signOut}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
            {statuses.map((status) => (
              <JobStatusBtn
                key={status.value}
                status={status}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                applications={applications}
              />
            ))}
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading applications...</p>
            </div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-20 bg-base-200 rounded-lg shadow-md border border-gray-200">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {statusFilter === "all"
                ? "No Applications Yet"
                : `No ${statusFilter} Applications`}
            </h3>
            <p className="text-gray-600 mb-6">
              {statusFilter === "all"
                ? "Start tracking your job applications by adding your first one"
                : "Try selecting a different filter or add a new application"}
            </p>
            {statusFilter === "all" && (
              <button
                onClick={() => setEditingJob({} as JobApplication)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Your First Application
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApplications.map((application) => (
              <JobApplicationCard
                key={application.id}
                application={application}
                onUpdate={fetchApplications}
                onEdit={(job) => setEditingJob(job)}
              />
            ))}
          </div>
        )}
      </div>

      {displayForm && (
        <JobApplicationForm
          jobToEdit={editingJob}
          onSuccess={handleFormSuccess}
          onCancel={() => setEditingJob(null)}
        />
      )}
    </div>
  );
}

export default App;
