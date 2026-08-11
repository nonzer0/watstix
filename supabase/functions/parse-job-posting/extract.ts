// Orchestrates extraction: JSON-LD JobPosting data is authoritative when
// present; Open Graph tags are a best-effort fallback when it's not. See
// the sibling modules for the actual parsing logic — this file just wires
// them together into the field set used to autofill the job application
// form.

import type { ParsedJobPostingFields, ExtractResult } from './types.ts';
import {
  collectJsonLdBlocks,
  flattenCandidates,
  isJobPosting,
  buildIdIndex,
} from './json-ld.ts';
import { stripHtml } from './html.ts';
import { extractCompanyName, extractLocation } from './job-fields.ts';
import { extractSalary, extractSalaryFromDescription } from './salary.ts';
import { extractFromOpenGraph } from './open-graph.ts';

function hasAnyField(fields: ParsedJobPostingFields): boolean {
  return Object.keys(fields).length > 0;
}

export function extractJobPostingFields(html: string): ExtractResult {
  const candidates = flattenCandidates(collectJsonLdBlocks(html));
  const posting = candidates.find(isJobPosting);

  if (!posting) {
    const ogFields = extractFromOpenGraph(html);
    return { found: hasAnyField(ogFields), fields: ogFields };
  }

  const idIndex = buildIdIndex(candidates);
  const fields: ParsedJobPostingFields = {};

  const title = posting['title'];
  if (typeof title === 'string' && title.trim()) {
    fields.position_title = title.trim();
  }

  const companyName = extractCompanyName(posting, idIndex);
  if (companyName) fields.company_name = companyName;

  const location = extractLocation(posting);
  if (location) fields.location = location;

  const description = posting['description'];
  if (typeof description === 'string' && description.trim()) {
    const stripped = stripHtml(description);
    if (stripped) fields.job_description = stripped;
  }

  const salary =
    extractSalary(posting) ??
    (fields.job_description
      ? extractSalaryFromDescription(fields.job_description)
      : undefined);
  if (salary) fields.salary_range = salary;

  return { found: hasAnyField(fields), fields };
}
