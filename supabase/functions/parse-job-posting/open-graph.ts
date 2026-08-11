import { extractOgTag } from './html.ts';
import type { ParsedJobPostingFields } from './types.ts';

// LinkedIn never embeds JobPosting JSON-LD, but its og:title always follows
// this fixed "{Company} hiring {Title} in {Location} | LinkedIn" template —
// reliable enough to parse directly, unlike other sites' free-form titles.
const LINKEDIN_TITLE_RE =
  /^(.+?)\s+hiring\s+(.+?)\s+in\s+(.+?)(?:\s*\|\s*LinkedIn)?$/i;

export function extractFromOpenGraph(html: string): ParsedJobPostingFields {
  const fields: ParsedJobPostingFields = {};

  const ogTitle = extractOgTag(html, 'og:title');
  const linkedInMatch = ogTitle?.match(LINKEDIN_TITLE_RE);
  if (linkedInMatch) {
    const [, company, title, location] = linkedInMatch;
    if (company.trim()) fields.company_name = company.trim();
    if (title.trim()) fields.position_title = title.trim();
    if (location.trim()) fields.location = location.trim();
  }

  const ogDescription = extractOgTag(html, 'og:description');
  if (ogDescription) fields.job_description = ogDescription;

  return fields;
}
