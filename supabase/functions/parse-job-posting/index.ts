// Supabase Edge Function (Deno runtime).
// Fetches a job posting URL server-side and extracts schema.org JobPosting
// JSON-LD data to autofill the job application form. Requires a valid user
// JWT (Supabase's default verify_jwt = true for functions) so only signed-in
// users can trigger server-side fetches through this proxy.

import { extractJobPostingFields } from './extract.ts';
import { isSafeUrl } from './url-safety.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const FETCH_TIMEOUT_MS = 8000;
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const MAX_REDIRECTS = 2;

type FailureReason = 'invalid_url' | 'fetch_failed' | 'timeout';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function failure(reason: FailureReason, status = 200): Response {
  return jsonResponse({ found: false, fields: {}, error: reason }, status);
}

function concatChunks(chunks: Uint8Array[], totalLength: number): Uint8Array {
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}

async function fetchHtml(startUrl: string): Promise<string | FailureReason> {
  let current: URL;
  try {
    current = new URL(startUrl);
  } catch {
    return 'invalid_url';
  }
  if (!isSafeUrl(current)) return 'invalid_url';

  // One deadline shared across every redirect hop — without this, each hop
  // would get its own fresh FETCH_TIMEOUT_MS, letting a redirect chain block
  // for MAX_REDIRECTS+1 times longer than the timeout implies.
  const deadline = Date.now() + FETCH_TIMEOUT_MS;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) return 'timeout';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), remaining);

    let response: Response;
    try {
      response = await fetch(current.toString(), {
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WatstixJobFetcher/1.0)',
          Accept: 'text/html',
        },
      });
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof DOMException && err.name === 'AbortError')
        return 'timeout';
      return 'fetch_failed';
    }
    clearTimeout(timeout);

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) return 'fetch_failed';
      let next: URL;
      try {
        next = new URL(location, current);
      } catch {
        return 'fetch_failed';
      }
      if (!isSafeUrl(next)) return 'invalid_url';
      current = next;
      continue;
    }

    if (!response.ok) return 'fetch_failed';

    const contentType = response.headers.get('content-type') ?? '';
    if (
      !contentType.includes('text/html') &&
      !contentType.includes('application/xhtml+xml')
    ) {
      return 'fetch_failed';
    }

    const reader = response.body?.getReader();
    if (!reader) return 'fetch_failed';

    const chunks: Uint8Array[] = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > MAX_RESPONSE_BYTES) {
        await reader.cancel();
        return 'fetch_failed';
      }
      chunks.push(value);
    }
    return new TextDecoder().decode(concatChunks(chunks, received));
  }

  return 'fetch_failed';
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
