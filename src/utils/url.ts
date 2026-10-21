const SAFE_PROTOCOLS = new Set(['http:', 'https:']);

/**
 * Returns the URL only if it is an absolute http(s) URL; user-entered links
 * must never reach an href as `javascript:` or `data:`.
 */
export function safeExternalUrl(
  value: string | null | undefined
): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    return SAFE_PROTOCOLS.has(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

/** "jobs.example.com" for display; falls back to the raw value. */
export function displayHost(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./, '');
  } catch {
    return value;
  }
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function mailtoHref(email: string | null | undefined): string | null {
  return email && EMAIL.test(email.trim()) ? `mailto:${email.trim()}` : null;
}
