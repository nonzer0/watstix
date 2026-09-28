// Supabase Edge Function (Deno runtime).
// Fetches a job posting URL server-side and extracts schema.org JobPosting
// JSON-LD data to autofill the job application form. Requires a valid user
// JWT (Supabase's default verify_jwt = true for functions) so only signed-in
// users can trigger server-side fetches through this proxy.

import { extractJobPostingFields } from './extract.ts';
import { isSafeUrl } from './url-safety.ts';
import type { FailureReason } from './types.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const FETCH_TIMEOUT_MS = 8000;
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const MAX_REDIRECTS = 2;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function failure(reason: FailureReason, status = 200): Response {
  return jsonResponse({ found: false, fields: {}, error: reason }, status);
}

function parseUrl(raw: string, base?: URL): URL | undefined {
  try {
    return new URL(raw, base);
  } catch {
    return undefined;
  }
}

// Returns undefined once the body exceeds MAX_RESPONSE_BYTES, cancelling the
// stream rather than buffering an arbitrarily large page into memory.
async function readCappedText(response: Response): Promise<string | undefined> {
  const reader = response.body?.getReader();
  if (!reader) return undefined;

  const decoder = new TextDecoder();
  let text = '';
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) return text + decoder.decode();
    received += value.byteLength;
    if (received > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      return undefined;
    }
    text += decoder.decode(value, { stream: true });
  }
}

async function fetchHtmlWithin(
  start: URL,
  signal: AbortSignal
): Promise<string | FailureReason> {
  let current = start;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const response = await fetch(current, {
      redirect: 'manual',
      signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WatstixJobFetcher/1.0)',
        Accept: 'text/html',
      },
    });

    if (response.status >= 300 && response.status < 400) {
      const next = parseUrl(response.headers.get('location') ?? '', current);
      if (!next) return 'fetch_failed';
      if (!isSafeUrl(next)) return 'invalid_url';
      current = next;
      continue;
    }

    const contentType = response.headers.get('content-type') ?? '';
    const isHtml =
      contentType.includes('text/html') ||
      contentType.includes('application/xhtml+xml');
    if (!response.ok || !isHtml) return 'fetch_failed';

    return (await readCappedText(response)) ?? 'fetch_failed';
  }
  return 'fetch_failed';
}

async function fetchHtml(rawUrl: string): Promise<string | FailureReason> {
  const start = parseUrl(rawUrl);
  if (!start || !isSafeUrl(start)) return 'invalid_url';

  // A single signal bounds the whole operation — every redirect hop and the
  // body download — so neither a redirect chain nor a slow-drip body can
  // outlast FETCH_TIMEOUT_MS.
  const signal = AbortSignal.timeout(FETCH_TIMEOUT_MS);
  try {
    return await fetchHtmlWithin(start, signal);
  } catch {
    return signal.aborted ? 'timeout' : 'fetch_failed';
  }
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

  const html = await fetchHtml(url.trim());
  if (typeof html !== 'string') {
    return failure(html);
  }

  return jsonResponse(extractJobPostingFields(html));
});
