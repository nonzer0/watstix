interface LogoProps {
  size?: number;
}

/** Monogram: a ledger of three rules. */
export default function Logo({ size = 18 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden="true">
      <rect width="18" height="18" rx="4.5" fill="var(--text)" />
      <path
        d="M5 6h8M5 9h6M5 12h3.5"
        stroke="var(--bg)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
