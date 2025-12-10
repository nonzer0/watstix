import { Briefcase, LogOut } from "lucide-react";

interface HeaderProps {
  setShowForm: (show: boolean) => void;
  signOut: () => void;
}

export function Header({ setShowForm, signOut }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="p-3 primary-bg-color rounded-lg">
          <Briefcase className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold primary-text-color">
            Application Tracker
          </h1>
          <p className="secondary-text-color">
            Manage and track your job applications
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowForm(true)}
          className="btn primary-bg-color"
        >
          Add Application
        </button>
        <button
          onClick={signOut}
          className="btn secondary-bg-color"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
