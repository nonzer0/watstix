// Orchestrates extraction: JSON-LD JobPosting data is authoritative when
// present; page meta tags (Open Graph, <title>) are a best-effort fallback
// when it's not. See the sibling modules for the actual parsing logic —
// this file just wires them together into the field set used to autofill
// the job application form.

import type { ParsedJobPostingFields, ExtractResult } from './types.ts';
import {
  collectJsonLdBlocks,
  flattenCandidates,
  isJobPosting,
  buildIdIndex,
  nonEmptyString,
} from './json-ld.ts';
import { stripHtml } from './html.ts';
import { extractCompanyName, extractLocation } from './job-fields.ts';
import { extractSalary, extractSalaryFromDescription } from './salary.ts';
import { extractFromPageMeta } from './page-meta.ts';

function hasAnyField(fields: ParsedJobPostingFields): boolean {
  return Object.keys(fields).length > 0;
}

export function extractJobPostingFields(html: string): ExtractResult {
  const candidates = flattenCandidates(collectJsonLdBlocks(html));
  const posting = candidates.find(isJobPosting);

  if (!posting) {
    const metaFields = extractFromPageMeta(html);
    return { found: hasAnyField(metaFields), fields: metaFields };
  }

  const idIndex = buildIdIndex(candidates);
  const fields: ParsedJobPostingFields = {};

  const title = nonEmptyString(posting['title']);
  if (title) fields.position_title = title;

  const companyName = extractCompanyName(posting, idIndex);
  if (companyName) fields.company_name = companyName;

  const location = extractLocation(posting);
  if (location) fields.location = location;

  const description = nonEmptyString(posting['description']);
  const strippedDescription = description && stripHtml(description);
  if (strippedDescription) fields.job_description = strippedDescription;

  const salary =
    extractSalary(posting) ??
    (fields.job_description
      ? extractSalaryFromDescription(fields.job_description)
      : undefined);
  if (salary) fields.salary_range = salary;

  return { found: hasAnyField(fields), fields };
}
