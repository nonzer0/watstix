import { describe, it, expect } from 'vitest';
import { displayHost, mailtoHref, safeExternalUrl } from './url';

describe('safeExternalUrl', () => {
  it('accepts http and https URLs', () => {
    expect(safeExternalUrl('https://example.com/jobs/1')).toBe(
      'https://example.com/jobs/1'
    );
    expect(safeExternalUrl(' http://example.com ')).toBe('http://example.com/');
  });

  it('rejects script and data URLs', () => {
    expect(safeExternalUrl('javascript:alert(1)')).toBeNull();
    expect(safeExternalUrl('JaVaScRiPt:alert(1)')).toBeNull();
    expect(
      safeExternalUrl('data:text/html,<script>alert(1)</script>')
    ).toBeNull();
  });

  it('rejects relative or malformed values', () => {
    expect(safeExternalUrl('/job/1')).toBeNull();
    expect(safeExternalUrl('example.com')).toBeNull();
    expect(safeExternalUrl('')).toBeNull();
    expect(safeExternalUrl(undefined)).toBeNull();
  });
});

describe('displayHost', () => {
  it('strips www and the path', () => {
    expect(displayHost('https://www.example.com/jobs/1')).toBe('example.com');
  });
});

describe('mailtoHref', () => {
  it('builds mailto links for plausible addresses only', () => {
    expect(mailtoHref('dana@example.com')).toBe('mailto:dana@example.com');
    expect(mailtoHref('not an email')).toBeNull();
    expect(mailtoHref('a@b.c?subject=x y')).toBeNull();
  });
});
