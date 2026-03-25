import styles from './Loading.module.css';

export function Loading() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <div
          className="spinner"
          style={{ margin: '0 auto var(--space-md)' }}
        ></div>
        <p>Loading...</p>
      </div>
    </div>
  );
}
