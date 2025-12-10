import { Briefcase, LogOut } from "lucide-react";

interface HeaderProps {
  setShowForm: (show: boolean) => void;
  signOut: () => void;
}

export function Header({ setShowForm, signOut }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-600 rounded-lg">
          <Briefcase className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Application Tracker
          </h1>
          <p className="text-gray-600">
            Manage and track your job applications
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          Add Application
        </button>
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md hover:shadow-lg"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
