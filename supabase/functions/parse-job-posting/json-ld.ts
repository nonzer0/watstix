const LD_JSON_SCRIPT_RE =
  /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function nonEmptyString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function isJobPosting(node: Record<string, unknown>): boolean {
  const type = node['@type'];
  if (typeof type === 'string') return type === 'JobPosting';
  if (Array.isArray(type)) return type.includes('JobPosting');
  return false;
}

export function collectJsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  for (const [, raw] of html.matchAll(LD_JSON_SCRIPT_RE)) {
    if (!raw.trim()) continue;
    try {
      blocks.push(JSON.parse(raw));
    } catch {
      // Malformed JSON-LD block — skip it rather than fail the whole page.
    }
  }
  return blocks;
}

// Blocks may be a single node, an array of nodes, or a node wrapping an
// @graph array — possibly nested. Walk them uniformly into one flat list.
export function flattenCandidates(
  value: unknown,
  out: Record<string, unknown>[] = []
): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    for (const item of value) flattenCandidates(item, out);
  } else if (isObject(value)) {
    out.push(value);
    flattenCandidates(value['@graph'], out);
  }
  return out;
}

// JSON-LD nodes can reference each other by `@id` instead of inlining data —
// e.g. a JobPosting's hiringOrganization is often just `{"@id": "..."}`,
// with the actual Organization (and its `name`) defined in a sibling
// <script> block's @graph. Resolve those references before reading fields.
export function buildIdIndex(
  candidates: Record<string, unknown>[]
): Map<string, Record<string, unknown>> {
  const index = new Map<string, Record<string, unknown>>();
  for (const node of candidates) {
    const id = node['@id'];
    if (typeof id === 'string') index.set(id, node);
  }
  return index;
}

export function resolveNode(
  value: unknown,
  idIndex: Map<string, Record<string, unknown>>
): Record<string, unknown> | undefined {
  if (!isObject(value)) return undefined;
  const id = value['@id'];
  if (typeof id === 'string' && idIndex.has(id)) {
    return { ...idIndex.get(id), ...value };
  }
  return value;
}
