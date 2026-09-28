import { isObject, nonEmptyString, resolveNode } from './json-ld.ts';

export function extractCompanyName(
  node: Record<string, unknown>,
  idIndex: Map<string, Record<string, unknown>>
): string | undefined {
  return nonEmptyString(resolveNode(node['hiringOrganization'], idIndex)?.name);
}

function addressToLocation(
  address: Record<string, unknown>
): string | undefined {
  const parts = [
    nonEmptyString(address['addressLocality']),
    nonEmptyString(address['addressRegion']),
  ].filter(Boolean);
  if (parts.length) return parts.join(', ');

  const country = address['addressCountry'];
  return nonEmptyString(isObject(country) ? country['name'] : country);
}

export function extractLocation(
  node: Record<string, unknown>
): string | undefined {
  const rawLocation = node['jobLocation'];
  const locations = Array.isArray(rawLocation) ? rawLocation : [rawLocation];
  const first = locations.find(isObject);
  if (first) {
    const address = isObject(first['address']) ? first['address'] : first;
    const formatted = addressToLocation(address);
    if (formatted) return formatted;
  }

  const locationType = nonEmptyString(node['jobLocationType']);
  return locationType?.toUpperCase() === 'TELECOMMUTE' ? 'Remote' : undefined;
}
