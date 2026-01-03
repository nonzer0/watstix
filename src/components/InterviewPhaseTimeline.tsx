import { Plus, Briefcase } from "lucide-react";
import type { InterviewPhase } from "../lib/supabase";
import InterviewPhaseCard from "./InterviewPhaseCard";

interface InterviewPhaseTimelineProps {
  phases: InterviewPhase[];
  onAdd: () => void;
  onEdit: (phase: InterviewPhase) => void;
  onDelete: (id: string) => void;
}

export default function InterviewPhaseTimeline({
  phases,
  onAdd,
  onEdit,
  onDelete,
}: InterviewPhaseTimelineProps) {
  const sortedPhases = [...phases].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-4">
      {sortedPhases.length === 0 ? (
        <div className="text-center py-12 bg-base-200 rounded-lg shadow-md border border-gray-200">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            No Interview Phases Yet
          </h4>
          <p className="text-gray-600 mb-4">
            Track your interview process by adding phases
          </p>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add First Phase
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {sortedPhases.map((phase) => (
              <InterviewPhaseCard
                key={phase.id}
                phase={phase}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
          <button
            onClick={onAdd}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-base-200 text-color-neutral rounded-lg hover:bg-base-300 transition-colors border-2 border-dashed border-gray-300 hover:border-primary"
          >
            <Plus className="w-5 h-5" />
            Add Interview Phase
          </button>
        </>
      )}
    </div>
  );
}
