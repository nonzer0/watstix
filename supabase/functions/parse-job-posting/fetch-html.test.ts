import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchHtml } from './fetch-html';

function htmlResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

function redirectTo(location: string): Response {
  return new Response(null, { status: 302, headers: { location } });
}

function stubFetch(...responses: Response[]) {
  const mock = vi.fn();
  for (const response of responses) mock.mockResolvedValueOnce(response);
  vi.stubGlobal('fetch', mock);
  return mock;
}

describe('fetchHtml', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the page HTML on success', async () => {
    stubFetch(htmlResponse('<html>ok</html>'));

    expect(await fetchHtml('https://example.com/jobs/1')).toEqual({
      ok: true,
      html: '<html>ok</html>',
    });
  });

  it('rejects an unparseable URL as invalid_url without fetching', async () => {
    const mock = stubFetch();

    expect(await fetchHtml('not a url')).toEqual({
      ok: false,
      reason: 'invalid_url',
    });
    expect(mock).not.toHaveBeenCalled();
  });

  it('rejects a private address as invalid_url without fetching', async () => {
    const mock = stubFetch();

    expect(await fetchHtml('http://169.254.169.254/latest')).toEqual({
      ok: false,
      reason: 'invalid_url',
    });
    expect(mock).not.toHaveBeenCalled();
  });

  it('follows a redirect to a public URL', async () => {
    const mock = stubFetch(
      redirectTo('/jobs/2'),
      htmlResponse('<html>moved</html>')
    );

    expect(await fetchHtml('https://example.com/jobs/1')).toEqual({
      ok: true,
      html: '<html>moved</html>',
    });
    expect(String(mock.mock.calls[1][0])).toBe('https://example.com/jobs/2');
  });

  it('rejects a redirect to a private address as invalid_url', async () => {
    const mock = stubFetch(redirectTo('http://127.0.0.1/admin'));

    expect(await fetchHtml('https://example.com/jobs/1')).toEqual({
      ok: false,
      reason: 'invalid_url',
    });
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it('gives up with fetch_failed after too many redirects', async () => {
    stubFetch(redirectTo('/a'), redirectTo('/b'), redirectTo('/c'));

    expect(await fetchHtml('https://example.com/start')).toEqual({
      ok: false,
      reason: 'fetch_failed',
    });
  });

  it('returns fetch_failed for a non-2xx response', async () => {
    stubFetch(htmlResponse('Forbidden', 403));

    expect(await fetchHtml('https://example.com/jobs/1')).toEqual({
      ok: false,
      reason: 'fetch_failed',
    });
  });

  it('returns fetch_failed for a non-HTML response', async () => {
    stubFetch(
      new Response('{}', { headers: { 'content-type': 'application/json' } })
    );

    expect(await fetchHtml('https://example.com/jobs/1')).toEqual({
      ok: false,
      reason: 'fetch_failed',
    });
  });

  it('returns fetch_failed when the body exceeds the size cap', async () => {
    stubFetch(htmlResponse('x'.repeat(2 * 1024 * 1024 + 1)));

    expect(await fetchHtml('https://example.com/jobs/1')).toEqual({
      ok: false,
      reason: 'fetch_failed',
    });
  });

  it('returns fetch_failed when the request errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('DNS')));

    expect(await fetchHtml('https://example.com/jobs/1')).toEqual({
      ok: false,
      reason: 'fetch_failed',
    });
  });

  it('returns timeout when the request outlasts the deadline', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: URL, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener('abort', () =>
              reject(init.signal?.reason)
            );
          })
      )
    );

    expect(await fetchHtml('https://example.com/jobs/1', 20)).toEqual({
      ok: false,
      reason: 'timeout',
    });
  });
});
