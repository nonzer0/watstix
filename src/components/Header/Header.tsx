import { Briefcase, LogOut } from "lucide-react";

interface HeaderProps {
  setShowForm: (show: boolean) => void;
  signOut: () => void;
}

export function Header({ setShowForm, signOut }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="bg-primary text-primary-content p-3 rounded-full">
          <Briefcase className="w-6 h-6 text-white bg-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Application Tracker
          </h1>
          <p className="text-secondary">
            Manage and track your job applications
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary btn-lg"
        >
          Add Application
        </button>
        <button
          onClick={signOut}
          className="btn btn-primary btn-lg px-4"
          title="Sign Out"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
