const LD_JSON_SCRIPT_RE =
  /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isJobPosting(node: Record<string, unknown>): boolean {
  const type = node['@type'];
  if (typeof type === 'string') return type === 'JobPosting';
  if (Array.isArray(type)) return type.includes('JobPosting');
  return false;
}

export function collectJsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  const re = new RegExp(LD_JSON_SCRIPT_RE);
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const raw = match[1].trim();
    if (!raw) continue;
    try {
      blocks.push(JSON.parse(raw));
    } catch {
      // Malformed JSON-LD block — skip it rather than fail the whole page.
    }
  }
  return blocks;
}

export function flattenCandidates(
  blocks: unknown[]
): Record<string, unknown>[] {
  const candidates: Record<string, unknown>[] = [];
  for (const block of blocks) {
    if (Array.isArray(block)) {
      for (const item of block) {
        if (isObject(item)) candidates.push(item);
      }
    } else if (isObject(block)) {
      candidates.push(block);
      const graph = block['@graph'];
      if (Array.isArray(graph)) {
        for (const item of graph) {
          if (isObject(item)) candidates.push(item);
        }
      }
    }
  }
  return candidates;
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
