import { Calendar, Users, FileText, Trash2, Edit } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { InterviewPhase } from '../lib/supabase';

interface InterviewPhaseCardProps {
  phase: InterviewPhase;
  onEdit: (phase: InterviewPhase) => void;
  onDelete: (id: string) => void;
}

const outcomeColors = {
  pending: 'bg-gray-100 text-gray-800 border-gray-200',
  passed: 'bg-green-100 text-green-800 border-green-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

export default function InterviewPhaseCard({
  phase,
  onEdit,
  onDelete,
}: InterviewPhaseCardProps) {
  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  function renderPhaseValue(val: string | null | undefined, Icon: LucideIcon) {
    if (!val) return null;
    return (
      <div className="flex items-center gap-2 text-color-neutral">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{val}</span>
      </div>
    );
  }

  const getOutcomeColor = (outcome?: string) => {
    if (!outcome) return outcomeColors.pending;
    const key = outcome.toLowerCase() as keyof typeof outcomeColors;
    return outcomeColors[key] || outcomeColors.pending;
  };

  return (
    <div className="bg-base-400 rounded-lg shadow-md border border-base-400 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-color-neutral mb-1">
            {phase.title}
          </h3>
          {phase.description && (
            <p className="text-sm text-color-neutral mt-2">
              {phase.description}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onDelete(phase.id)}
            className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
            title="Delete phase"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onEdit(phase)}
            className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
            title="Edit phase"
          >
            <Edit className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {renderPhaseValue(formatDateTime(phase.interview_date), Calendar)}
        {phase.interviewer_names.length > 0 &&
          renderPhaseValue(phase.interviewer_names.join(', '), Users)}
        {renderPhaseValue(phase.notes, FileText)}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        {phase.outcome && (
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getOutcomeColor(phase.outcome)}`}
          >
            {phase.outcome.charAt(0).toUpperCase() + phase.outcome.slice(1)}
          </span>
        )}
      </div>
    </div>
  );
}
