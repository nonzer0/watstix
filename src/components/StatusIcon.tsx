import type { Status } from '../types/types';
import styles from './StatusIcon.module.css';

interface StatusIconProps {
  status: Status;
  size?: number;
  className?: string;
}

/**
 * Glyph per status: ring fill grows through the open pipeline
 * (applied → interviewing → offered); closed outcomes are solid or dashed.
 */
export default function StatusIcon({
  status,
  size = 14,
  className,
}: StatusIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      aria-hidden="true"
      data-status={status}
      className={`${styles.icon} ${className ?? ''}`}
    >
      {status === 'applied' && (
        <circle className={styles.ring} cx="7" cy="7" r="5.5" />
      )}
      {status === 'interviewing' && (
        <>
          <circle className={styles.ring} cx="7" cy="7" r="5.5" />
          <path className={styles.fill} d="M7 7 L7 4 A3 3 0 0 1 7 10 Z" />
        </>
      )}
      {status === 'offered' && (
        <>
          <circle className={styles.ring} cx="7" cy="7" r="5.5" />
          <path className={styles.fill} d="M7 7 L7 4 A3 3 0 1 1 4 7 Z" />
        </>
      )}
      {status === 'accepted' && (
        <>
          <circle className={styles.fill} cx="7" cy="7" r="6.25" />
          <path className={styles.mark} d="M4.4 7.2 L6.2 8.9 L9.6 5.3" />
        </>
      )}
      {status === 'rejected' && (
        <>
          <circle className={styles.fill} cx="7" cy="7" r="6.25" />
          <path className={styles.mark} d="M5 5 L9 9 M9 5 L5 9" />
        </>
      )}
      {status === 'withdrawn' && (
        <>
          <circle
            className={`${styles.ring} ${styles.dashed}`}
            cx="7"
            cy="7"
            r="5.5"
          />
          <path className={styles.minus} d="M4.75 7 L9.25 7" />
        </>
      )}
    </svg>
  );
}
