export function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

export function stripHtml(html: string): string {
  const withBreaks = html
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ');
  const withoutTags = withBreaks.replace(/<[^>]+>/g, '');
  return decodeEntities(withoutTags)
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Locates the whole <meta> tag by its property attribute first (order of
// attributes within the tag doesn't matter), then pulls content out of just
// that tag — avoids needing a second regex to handle content-before-property
// markup.
export function extractOgTag(
  html: string,
  property: string
): string | undefined {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tagRe = new RegExp(
    `<meta[^>]*\\bproperty=["']${escaped}["'][^>]*>`,
    'i'
  );
  const tag = html.match(tagRe)?.[0];
  if (!tag) return undefined;

  const contentMatch = tag.match(/content=["']([^"']*)["']/i);
  if (!contentMatch) return undefined;

  const value = decodeEntities(contentMatch[1]).trim();
  return value || undefined;
}
