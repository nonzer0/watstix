import { describe, it, expect } from 'vitest';
import { isSafeUrl, isPrivateHostname } from './url-safety';

describe('isSafeUrl', () => {
  it('allows a normal public https URL', () => {
    expect(isSafeUrl(new URL('https://example.com/jobs/123'))).toBe(true);
  });

  it('allows a normal public http URL', () => {
    expect(isSafeUrl(new URL('http://example.com/jobs/123'))).toBe(true);
  });

  it('rejects non-http(s) protocols', () => {
    expect(isSafeUrl(new URL('ftp://example.com/file'))).toBe(false);
    expect(isSafeUrl(new URL('file:///etc/passwd'))).toBe(false);
  });

  it('rejects localhost and its subdomains', () => {
    expect(isSafeUrl(new URL('http://localhost:5432'))).toBe(false);
    expect(isSafeUrl(new URL('http://api.localhost'))).toBe(false);
  });

  it('rejects loopback addresses', () => {
    expect(isSafeUrl(new URL('http://127.0.0.1'))).toBe(false);
    expect(isSafeUrl(new URL('http://127.255.255.255'))).toBe(false);
  });

  it('rejects the 10.0.0.0/8 private range', () => {
    expect(isSafeUrl(new URL('http://10.0.0.1'))).toBe(false);
    expect(isSafeUrl(new URL('http://10.255.255.255'))).toBe(false);
  });

  it('rejects the 172.16.0.0/12 private range at its boundaries', () => {
    expect(isSafeUrl(new URL('http://172.16.0.0'))).toBe(false);
    expect(isSafeUrl(new URL('http://172.31.255.255'))).toBe(false);
  });

  it('allows addresses just outside the 172.16.0.0/12 boundary', () => {
    expect(isSafeUrl(new URL('http://172.15.255.255'))).toBe(true);
    expect(isSafeUrl(new URL('http://172.32.0.0'))).toBe(true);
  });

  it('rejects the 192.168.0.0/16 private range', () => {
    expect(isSafeUrl(new URL('http://192.168.1.1'))).toBe(false);
  });

  it('rejects the 169.254.0.0/16 link-local range, including the cloud metadata address', () => {
    expect(isSafeUrl(new URL('http://169.254.169.254'))).toBe(false);
    expect(isSafeUrl(new URL('http://169.254.0.1'))).toBe(false);
  });

  it('rejects 0.0.0.0', () => {
    expect(isSafeUrl(new URL('http://0.0.0.0'))).toBe(false);
  });

  it('rejects IPv6 loopback and unique-local/link-local ranges', () => {
    expect(isSafeUrl(new URL('http://[::1]'))).toBe(false);
    expect(isSafeUrl(new URL('http://[fd00::1]'))).toBe(false);
    expect(isSafeUrl(new URL('http://[fe80::1]'))).toBe(false);
  });

  it('allows a public IPv4 address that is not in any private range', () => {
    expect(isSafeUrl(new URL('http://8.8.8.8'))).toBe(true);
  });
});

describe('isPrivateHostname', () => {
  it('is case-insensitive', () => {
    expect(isPrivateHostname('LOCALHOST')).toBe(true);
  });
});
