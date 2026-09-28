// Supabase Edge Function (Deno runtime).
// Fetches a job posting URL server-side and extracts schema.org JobPosting
// JSON-LD data to autofill the job application form. Requires a valid user
// JWT (Supabase's default verify_jwt = true for functions) so only signed-in
// users can trigger server-side fetches through this proxy.

import { extractJobPostingFields } from './extract.ts';
import { fetchHtml } from './fetch-html.ts';
import type { FailureReason } from './types.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function failure(reason: FailureReason, status = 200): Response {
  return jsonResponse({ found: false, fields: {}, error: reason }, status);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return failure('invalid_url', 405);
  }

  let url: unknown;
  try {
    const body = await req.json();
    url = body?.url;
  } catch {
    return failure('invalid_url');
  }

  if (typeof url !== 'string' || !url.trim()) {
    return failure('invalid_url');
  }

  const result = await fetchHtml(url.trim());
  if (!result.ok) return failure(result.reason);

  return jsonResponse(extractJobPostingFields(result.html));
});
