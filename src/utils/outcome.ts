export const OUTCOMES = ['pending', 'passed', 'failed', 'cancelled'] as const;

export type Outcome = (typeof OUTCOMES)[number];

export const OUTCOME_LABELS: Record<Outcome, string> = {
  pending: 'Pending',
  passed: 'Passed',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

/** Outcomes are free text in the database; unknown values display verbatim. */
export function outcomeLabel(outcome: string): string {
  const key = outcome.toLowerCase() as Outcome;
  return OUTCOME_LABELS[key] ?? outcome;
}
