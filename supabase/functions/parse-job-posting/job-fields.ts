import { isObject, resolveNode } from './json-ld.ts';

export function extractCompanyName(
  node: Record<string, unknown>,
  idIndex: Map<string, Record<string, unknown>>
): string | undefined {
  const org = resolveNode(node['hiringOrganization'], idIndex);
  if (org && typeof org['name'] === 'string' && org['name'].trim()) {
    return org['name'].trim();
  }
  return undefined;
}

function addressToLocation(
  address: Record<string, unknown>
): string | undefined {
  const locality =
    typeof address['addressLocality'] === 'string'
      ? address['addressLocality']
      : undefined;
  const region =
    typeof address['addressRegion'] === 'string'
      ? address['addressRegion']
      : undefined;
  const rawCountry = address['addressCountry'];
  const country =
    typeof rawCountry === 'string'
      ? rawCountry
      : isObject(rawCountry) && typeof rawCountry['name'] === 'string'
        ? rawCountry['name']
        : undefined;

  const parts = [locality, region].filter((part): part is string =>
    Boolean(part)
  );
  if (parts.length) return parts.join(', ');
  return country;
}

export function extractLocation(
  node: Record<string, unknown>
): string | undefined {
  const rawLocation = node['jobLocation'];
  const locations = Array.isArray(rawLocation) ? rawLocation : [rawLocation];
  const first = locations.find(isObject);
  if (first) {
    const address = isObject(first['address'])
      ? (first['address'] as Record<string, unknown>)
      : first;
    const formatted = addressToLocation(address);
    if (formatted) return formatted;
  }

  const locationType = node['jobLocationType'];
  if (
    typeof locationType === 'string' &&
    locationType.toUpperCase() === 'TELECOMMUTE'
  ) {
    return 'Remote';
  }

  return undefined;
}
