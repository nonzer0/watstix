import { extractOgTag, decodeEntities } from './html.ts';
import type { ParsedJobPostingFields } from './types.ts';

// LinkedIn never embeds JobPosting JSON-LD, but its og:title always follows
// this fixed "{Company} hiring {Title} in {Location} | LinkedIn" template —
// reliable enough to parse directly, unlike other sites' free-form titles.
const LINKEDIN_TITLE_RE =
  /^(.+?)\s+hiring\s+(.+?)\s+in\s+(.+?)(?:\s*\|\s*LinkedIn)?$/i;

// Greenhouse-hosted pages (job-boards.greenhouse.io) title the document
// "Job Application for {Title} at {Company}" — true for both the embedded
// apply widget and the full job posting page, even when the posting has no
// JobPosting JSON-LD at all (e.g. parachutehealth's listings).
const GREENHOUSE_DOCUMENT_TITLE_RE = /^Job Application for (.+?) at (.+)$/i;

function extractDocumentTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (!match) return undefined;
  const value = decodeEntities(match[1]).trim();
  return value || undefined;
}

export function extractFromPageMeta(html: string): ParsedJobPostingFields {
  const fields: ParsedJobPostingFields = {};

  const ogTitle = extractOgTag(html, 'og:title');
  const linkedInMatch = ogTitle?.match(LINKEDIN_TITLE_RE);
  if (linkedInMatch) {
    const [, company, title, location] = linkedInMatch;
    if (company.trim()) fields.company_name = company.trim();
    if (title.trim()) fields.position_title = title.trim();
    if (location.trim()) fields.location = location.trim();
  } else {
    const documentTitle = extractDocumentTitle(html);
    const greenhouseMatch = documentTitle?.match(GREENHOUSE_DOCUMENT_TITLE_RE);
    if (greenhouseMatch) {
      const [, title, company] = greenhouseMatch;
      if (title.trim()) fields.position_title = title.trim();
      if (company.trim()) fields.company_name = company.trim();
    }
  }

  const ogDescription = extractOgTag(html, 'og:description');
  if (ogDescription) fields.job_description = ogDescription;

  return fields;
}
