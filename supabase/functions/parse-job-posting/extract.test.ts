import { describe, it, expect } from 'vitest';
import { extractJobPostingFields } from './extract';

function withLdJson(json: unknown): string {
  return `<html><head><script type="application/ld+json">${JSON.stringify(json)}</script></head><body></body></html>`;
}

describe('extractJobPostingFields', () => {
  it('extracts fields from a single JobPosting object', () => {
    const html = withLdJson({
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: 'Senior Software Engineer',
      hiringOrganization: { '@type': 'Organization', name: 'Acme Corp' },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'San Francisco',
          addressRegion: 'CA',
        },
      },
      baseSalary: {
        '@type': 'MonetaryAmount',
        value: {
          '@type': 'QuantitativeValue',
          minValue: 120000,
          maxValue: 150000,
          unitText: 'YEAR',
        },
      },
      description:
        '<p>Build things.</p><ul><li>React</li><li>TypeScript</li></ul>',
    });

    const result = extractJobPostingFields(html);

    expect(result.found).toBe(true);
    expect(result.fields).toEqual({
      position_title: 'Senior Software Engineer',
      company_name: 'Acme Corp',
      location: 'San Francisco, CA',
      salary_range: '$120,000 - $150,000 / year',
      job_description: 'Build things.\n- React\n- TypeScript',
    });
  });

  it('extracts a JobPosting nested inside an @graph array', () => {
    const html = withLdJson({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Organization', name: 'Should Be Ignored' },
        {
          '@type': 'JobPosting',
          title: 'Data Analyst',
          hiringOrganization: { name: 'Graph Co' },
        },
      ],
    });

    const result = extractJobPostingFields(html);

    expect(result.found).toBe(true);
    expect(result.fields.position_title).toBe('Data Analyst');
    expect(result.fields.company_name).toBe('Graph Co');
  });

  it('extracts a JobPosting from an array of ld+json scripts', () => {
    const html = `
      <html><head>
        <script type="application/ld+json">${JSON.stringify({ '@type': 'WebSite', name: 'Careers' })}</script>
        <script type="application/ld+json">${JSON.stringify([
          { '@type': 'BreadcrumbList' },
          {
            '@type': 'JobPosting',
            title: 'Support Engineer',
            hiringOrganization: { name: 'Array Inc' },
          },
        ])}</script>
      </head><body></body></html>
    `;

    const result = extractJobPostingFields(html);

    expect(result.found).toBe(true);
    expect(result.fields.position_title).toBe('Support Engineer');
    expect(result.fields.company_name).toBe('Array Inc');
  });

  it('resolves hiringOrganization when it is a JSON-LD @id reference to an Organization node in a sibling script block', () => {
    // Mirrors real-world Greenhouse-hosted postings (e.g. sentinelone.com/jobs),
    // which split @graph metadata and the JobPosting across separate <script> tags.
    const html = `
      <html><head>
        <script type="application/ld+json">${JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Organization',
              '@id': 'https://example.com/#organization',
              name: 'Example Corp',
            },
          ],
        })}</script>
        <script id="job-posting-schema" type="application/ld+json">${JSON.stringify(
          {
            '@context': 'https://schema.org/',
            '@type': 'JobPosting',
            title: 'Engineering Manager',
            hiringOrganization: { '@id': 'https://example.com/#organization' },
          }
        )}</script>
      </head><body></body></html>
    `;

    const result = extractJobPostingFields(html);

    expect(result.fields.company_name).toBe('Example Corp');
    expect(result.fields.position_title).toBe('Engineering Manager');
  });

  it('marks remote jobs as "Remote" when jobLocationType is TELECOMMUTE and no address is present', () => {
    const html = withLdJson({
      '@type': 'JobPosting',
      title: 'Remote Engineer',
      jobLocationType: 'TELECOMMUTE',
    });

    const result = extractJobPostingFields(html);

    expect(result.fields.location).toBe('Remote');
  });

  it('omits salary_range when baseSalary is missing', () => {
    const html = withLdJson({
      '@type': 'JobPosting',
      title: 'Designer',
      hiringOrganization: { name: 'NoSalary Co' },
    });

    const result = extractJobPostingFields(html);

    expect(result.fields.salary_range).toBeUndefined();
    expect(result.found).toBe(true);
  });

  it('falls back to a dollar figure mentioned near a salary keyword in the description when baseSalary is absent', () => {
    // Mirrors real-world Lever postings (e.g. jobs.lever.co/teamsnap/...)
    // that only mention compensation as prose, never as structured data.
    const html = withLdJson({
      '@type': 'JobPosting',
      title: 'Engineering Manager',
      description:
        '<p>We are committed to equitable pay. The minimum starting point for this role is $200,000, inclusive of base and bonus.</p>',
    });

    const result = extractJobPostingFields(html);

    expect(result.fields.salary_range).toBe(
      '$200,000 (from description, please verify)'
    );
  });

  it('prefers a dollar range over a single figure when both appear in the description', () => {
    const html = withLdJson({
      '@type': 'JobPosting',
      title: 'Engineering Manager',
      description:
        '<p>Compensation for this role ranges from $120,000 - $150,000 depending on experience.</p>',
    });

    const result = extractJobPostingFields(html);

    expect(result.fields.salary_range).toBe(
      '$120,000 - $150,000 (from description, please verify)'
    );
  });

  it('does not guess a salary from unrelated dollar figures with no nearby salary keyword', () => {
    const html = withLdJson({
      '@type': 'JobPosting',
      title: 'Engineering Manager',
      description:
        '<p>Our platform processes over $2,000,000 in transactions daily.</p>',
    });

    const result = extractJobPostingFields(html);

    expect(result.fields.salary_range).toBeUndefined();
  });

  it('prefers structured baseSalary over a description-guessed figure when both are present', () => {
    const html = withLdJson({
      '@type': 'JobPosting',
      title: 'Engineering Manager',
      baseSalary: { '@type': 'MonetaryAmount', value: 180000 },
      description:
        '<p>The minimum starting salary for this role is $120,000.</p>',
    });

    const result = extractJobPostingFields(html);

    expect(result.fields.salary_range).toBe('$180,000');
  });

  it('handles minValue/maxValue sent as numeric strings instead of numbers', () => {
    // schema.org technically requires Number here, but real feeds (e.g.
    // Lever postings surfaced via Welcome to the Jungle) send strings.
    const html = withLdJson({
      '@type': 'JobPosting',
      title: 'Engineering Manager',
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: 'USD',
        minValue: '161000',
        maxValue: '221500',
      },
    });

    const result = extractJobPostingFields(html);

    expect(result.fields.salary_range).toBe('$161,000 - $221,500');
  });

  it('handles a single numeric baseSalary value', () => {
    const html = withLdJson({
      '@type': 'JobPosting',
      title: 'Contractor',
      baseSalary: { '@type': 'MonetaryAmount', value: 85 },
    });

    const result = extractJobPostingFields(html);

    expect(result.fields.salary_range).toBe('$85');
  });

  it('does not throw on malformed JSON inside a ld+json script', () => {
    const html = `<html><head><script type="application/ld+json">{ not valid json </script></head></html>`;

    expect(() => extractJobPostingFields(html)).not.toThrow();
    expect(extractJobPostingFields(html).found).toBe(false);
  });

  it('returns found: false when no JobPosting is present anywhere', () => {
    const html = withLdJson({ '@type': 'Organization', name: 'Not A Job' });

    const result = extractJobPostingFields(html);

    expect(result).toEqual({ found: false, fields: {} });
  });

  it('returns found: false when there is no ld+json at all', () => {
    const html =
      '<html><head><title>Careers</title></head><body>No structured data here</body></html>';

    const result = extractJobPostingFields(html);

    expect(result).toEqual({ found: false, fields: {} });
  });

  it("falls back to parsing LinkedIn's og:title template when no JSON-LD is present", () => {
    const html = `
      <html><head>
        <meta property="og:title" content="SeatGeek hiring Engineering Manager, Attendance in United States | LinkedIn">
        <meta property="og:description" content="Posted 9:32:40 AM. SeatGeek believes live events are powerful experiences…See this and similar jobs on LinkedIn.">
      </head><body></body></html>
    `;

    const result = extractJobPostingFields(html);

    expect(result.found).toBe(true);
    expect(result.fields).toEqual({
      company_name: 'SeatGeek',
      position_title: 'Engineering Manager, Attendance',
      location: 'United States',
      job_description:
        'Posted 9:32:40 AM. SeatGeek believes live events are powerful experiences…See this and similar jobs on LinkedIn.',
    });
  });

  it('falls back to og:description only when og:title does not match a recognizable pattern', () => {
    const html = `
      <html><head>
        <meta property="og:title" content="Careers at Acme">
        <meta property="og:description" content="We are hiring across the board.">
      </head><body></body></html>
    `;

    const result = extractJobPostingFields(html);

    expect(result.found).toBe(true);
    expect(result.fields).toEqual({
      job_description: 'We are hiring across the board.',
    });
  });

  it('falls back to Greenhouse\'s "Job Application for X at Y" document title when no JSON-LD or LinkedIn-style og:title is present', () => {
    // Mirrors real-world Greenhouse-hosted postings that render server-side
    // but never publish JobPosting JSON-LD (e.g. parachutehealth's listings).
    const html = `
      <html><head>
        <title>Job Application for Engineering Manager, AI Intake at Parachute Health</title>
        <meta property="og:title" content="Engineering Manager, AI Intake">
        <meta property="og:description" content="U.S. Remote">
      </head><body></body></html>
    `;

    const result = extractJobPostingFields(html);

    expect(result.found).toBe(true);
    expect(result.fields).toEqual({
      position_title: 'Engineering Manager, AI Intake',
      company_name: 'Parachute Health',
      job_description: 'U.S. Remote',
    });
  });

  it('returns found: false when there is neither JSON-LD nor usable Open Graph tags', () => {
    const html =
      '<html><head><title>Careers</title></head><body>No structured data here</body></html>';

    const result = extractJobPostingFields(html);

    expect(result).toEqual({ found: false, fields: {} });
  });
});
