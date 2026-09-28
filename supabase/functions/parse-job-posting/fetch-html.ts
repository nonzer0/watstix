import { isSafeUrl } from './url-safety.ts';
import type { FailureReason } from './types.ts';

const FETCH_TIMEOUT_MS = 8000;
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const MAX_REDIRECTS = 2;

// A tagged result rather than `string | FailureReason`: failure reasons are
// themselves strings, so a `typeof === 'string'` check can't tell them apart
// from HTML, and the compiler can't catch the mistake.
export type FetchHtmlResult =
  | { ok: true; html: string }
  | { ok: false; reason: FailureReason };

const fail = (reason: FailureReason): FetchHtmlResult => ({
  ok: false,
  reason,
});

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

async function fetchWithin(
  start: URL,
  signal: AbortSignal
): Promise<FetchHtmlResult> {
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
      if (!next) return fail('fetch_failed');
      if (!isSafeUrl(next)) return fail('invalid_url');
      current = next;
      continue;
    }

    const contentType = response.headers.get('content-type') ?? '';
    const isHtml =
      contentType.includes('text/html') ||
      contentType.includes('application/xhtml+xml');
    if (!response.ok || !isHtml) return fail('fetch_failed');

    const html = await readCappedText(response);
    return html === undefined ? fail('fetch_failed') : { ok: true, html };
  }
  return fail('fetch_failed');
}

export async function fetchHtml(
  rawUrl: string,
  timeoutMs = FETCH_TIMEOUT_MS
): Promise<FetchHtmlResult> {
  const start = parseUrl(rawUrl);
  if (!start || !isSafeUrl(start)) return fail('invalid_url');

  // A single signal bounds the whole operation — every redirect hop and the
  // body download — so neither a redirect chain nor a slow-drip body can
  // outlast the timeout.
  const signal = AbortSignal.timeout(timeoutMs);
  try {
    return await fetchWithin(start, signal);
  } catch {
    return fail(signal.aborted ? 'timeout' : 'fetch_failed');
  }
}
