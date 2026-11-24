import styles from './CraneWordmark.module.css';

interface CraneWordmarkProps {
  /**
   * - 'base': renders "Akshat" (with an invisible width-preserving period slot;
   *   the actual animated period + crane renders on the independent top overlay layer)
   * - 'maskedClone': renders the neon-highlighted "Akshat" inside masking apertures
   *   (its period stays hidden until the crane settles so no static dot appears early)
   * - 'craneOverlay': independent top-layer crane + actual '.' character aligned
   *   pixel-for-pixel via an invisible "Akshat" ghost span
   */
  mode?: 'base' | 'maskedClone' | 'craneOverlay';
}

export function CraneWordmark({ mode = 'base' }: CraneWordmarkProps) {
  if (mode === 'craneOverlay') {
    return (
      <div className={`${styles.heading} ${styles.overlayHeading}`} aria-hidden="true">
        <span className={styles.wordmarkRow}>
          <span className={styles.lettersGhost}>Akshat</span>
          <span className={styles.periodSlot}>
            <span className={styles.rideGroup}>
              {/* Actual full-stop punctuation character lowered & settled with two bounces */}
              <span className={styles.periodAnimated}>.</span>

              {/* Mechanical crane cable + pivot + two-prong claw */}
              <svg
                className={styles.armSvg}
                viewBox="-20 -110 40 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <line className={styles.cable} x1="0" y1="-22" x2="0" y2="-900" strokeWidth="1.6" />
                <circle className={styles.hub} cx="0" cy="-19" r="3.2" />
                <path
                  className={`${styles.claw} ${styles.clawLeft}`}
                  d="M -2.2 -17.5 L -9 -10.5 L -5.4 -3.2"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  className={`${styles.claw} ${styles.clawRight}`}
                  d="M 2.2 -17.5 L 9 -10.5 L 5.4 -3.2"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </span>
        </span>
      </div>
    );
  }

  const isClone = mode === 'maskedClone';
  const Tag = isClone ? 'div' : 'h1';

  return (
    <Tag
      className={`${styles.heading} ${isClone ? styles.maskedClone : ''}`}
      aria-hidden={isClone || undefined}
    >
      {!isClone && <span className="sr-only">Akshat.</span>}
      <span className={styles.wordmarkRow} aria-hidden={!isClone}>
        <span className={styles.letters}>Akshat</span>
        {/* Width-preserving slot: hidden during crane drop so no static '.' appears early */}
        <span className={styles.periodReserve} aria-hidden="true">
          .
        </span>
      </span>
    </Tag>
  );
}
