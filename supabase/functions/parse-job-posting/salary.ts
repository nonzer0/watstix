import { isObject } from './json-ld.ts';

function formatMoney(value: number): string {
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

// Sites are inconsistent about whether MonetaryAmount values are numbers or
// numeric strings (schema.org technically requires Number, but real-world
// feeds — e.g. Lever via Welcome to the Jungle — send "161000" as a string).
function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (
    typeof value === 'string' &&
    value.trim() !== '' &&
    Number.isFinite(Number(value))
  ) {
    return Number(value);
  }
  return undefined;
}

export function extractSalary(
  node: Record<string, unknown>
): string | undefined {
  const base = node['baseSalary'];
  if (!isObject(base)) return undefined;
  const valueNode = base['value'];

  const rawUnit =
    (isObject(valueNode) &&
      typeof valueNode['unitText'] === 'string' &&
      valueNode['unitText']) ||
    (typeof base['unitText'] === 'string' && base['unitText']) ||
    undefined;
  const unitSuffix = rawUnit ? ` / ${rawUnit.toLowerCase()}` : '';

  const direct = toNumber(valueNode);
  if (direct !== undefined) {
    return `${formatMoney(direct)}${unitSuffix}`;
  }

  // Per spec, min/max/single amounts live in a nested QuantitativeValue at
  // baseSalary.value — but some feeds (e.g. Lever via Welcome to the Jungle)
  // put minValue/maxValue directly on baseSalary itself. Check both shapes.
  const amounts = isObject(valueNode) ? valueNode : base;
  const min = toNumber(amounts['minValue']);
  const max = toNumber(amounts['maxValue']);
  const single = toNumber(amounts['value']);

  if (min !== undefined && max !== undefined && min !== max) {
    return `${formatMoney(min)} - ${formatMoney(max)}${unitSuffix}`;
  }
  if (min !== undefined) return `${formatMoney(min)}${unitSuffix}`;
  if (single !== undefined) return `${formatMoney(single)}${unitSuffix}`;

  return undefined;
}

const MONEY_TOKEN_RE =
  /\$\s?\d{1,3}(?:,\d{3})+(?:\.\d+)?|\$\s?\d+(?:\.\d+)?\s?[kK]\b/g;
const SALARY_KEYWORD_RE =
  /salary|compensation|\bcomp\b|pay range|base pay|starting (?:point|salary)/i;

function normalizeMoneyToken(token: string): string {
  const compact = token.replace(/\s+/g, '');
  const shorthand = compact.match(/^\$([\d.]+)[kK]$/);
  if (shorthand)
    return formatMoney(Math.round(parseFloat(shorthand[1]) * 1000));
  const plain = compact.match(/^\$([\d,]+)/);
  if (plain) return formatMoney(Number(plain[1].replace(/,/g, '')));
  return compact;
}

// Best-effort fallback for when a site publishes a number in the job
// description prose but doesn't populate structured baseSalary at all
// (common on Lever postings). Necessarily a guess — flagged as such in the
// returned string so it's easy to spot-check rather than trust blindly.
export function extractSalaryFromDescription(
  description: string
): string | undefined {
  const tokens: { text: string; index: number }[] = [];
  const re = new RegExp(MONEY_TOKEN_RE);
  let match: RegExpExecArray | null;
  while ((match = re.exec(description)) !== null) {
    tokens.push({ text: match[0], index: match.index });
  }
  if (tokens.length === 0) return undefined;

  for (let i = 0; i < tokens.length - 1; i++) {
    const between = description.slice(
      tokens[i].index + tokens[i].text.length,
      tokens[i + 1].index
    );
    if (between.length <= 15 && /^\s*(-|–|—|to)\s*$/i.test(between)) {
      return `${normalizeMoneyToken(tokens[i].text)} - ${normalizeMoneyToken(tokens[i + 1].text)} (from description, please verify)`;
    }
  }

  for (const token of tokens) {
    const windowStart = Math.max(0, token.index - 60);
    const windowEnd = Math.min(
      description.length,
      token.index + token.text.length + 60
    );
    if (SALARY_KEYWORD_RE.test(description.slice(windowStart, windowEnd))) {
      return `${normalizeMoneyToken(token.text)} (from description, please verify)`;
    }
  }

  return undefined;
}
