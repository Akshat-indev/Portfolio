import { useEffect, useRef, type MutableRefObject } from 'react';
import type { SceneEntranceState } from './sceneTimeline';
import styles from './EncryptedInfoPanel.module.css';

export const PROFILE_PANEL_CONTENT = {
  heading: 'PROFILE',
  name: 'Akshat',
  descriptor: 'Developer · Student · Independent Builder',
  introLead: 'I like understanding how things work.',
  introBody:
    'From software architecture and artificial intelligence to low-level systems, I enjoy exploring ideas, building things from scratch, and learning through experimentation.',
} as const;

/** Crisp architectural monochrome barcode bars (x, width) in a 124 x 16 viewBox */
const BARCODE_BARS: ReadonlyArray<readonly [number, number]> = [
  [0, 2.2],
  [4.2, 1.1],
  [7.0, 3.0],
  [12.0, 1.0],
  [14.8, 1.8],
  [18.6, 1.0],
  [21.4, 2.8],
  [26.2, 1.1],
  [29.6, 1.1],
  [32.4, 2.4],
  [37.0, 1.0],
  [39.8, 3.2],
  [45.0, 1.2],
  [48.2, 1.6],
  [52.0, 1.0],
  [55.0, 2.6],
  [59.8, 1.2],
  [63.2, 1.0],
  [66.0, 3.1],
  [71.2, 1.4],
  [74.6, 1.0],
  [77.8, 2.4],
  [82.4, 1.0],
  [85.4, 1.8],
  [89.4, 2.9],
  [94.4, 1.0],
  [97.4, 1.6],
  [101.2, 1.1],
  [104.2, 2.8],
  [109.2, 1.2],
  [112.4, 1.8],
  [116.4, 1.0],
  [119.4, 2.6],
];

function easeOutCubic(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  const inv = 1 - x;
  return 1 - inv * inv * inv;
}

function easeInOutQuad(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

interface EncryptedInfoPanelProps {
  entranceStateRef: MutableRefObject<SceneEntranceState>;
}

/**
 * Stage D: Minimal Monochrome Editorial Profile Panel.
 *
 * Composition:
 *   1. Large, refined lightweight `PROFILE` display heading
 *   2. Crisp small monochrome barcode directly beneath with short horizontal scanning reveal
 *   3. Generous vertical whitespace
 *   4. Name (`Akshat`), quiet descriptor, and short editorial introduction
 *
 * Driven strictly by the existing centralized `entranceStateRef` timeline (zero React re-renders).
 */
export function EncryptedInfoPanel({ entranceStateRef }: EncryptedInfoPanelProps) {
  const panelRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const barcodeWrapRef = useRef<HTMLDivElement | null>(null);
  const barcodeClipRef = useRef<HTMLDivElement | null>(null);
  const scanLineRef = useRef<HTMLSpanElement | null>(null);
  const nameRef = useRef<HTMLParagraphElement | null>(null);
  const descriptorRef = useRef<HTMLParagraphElement | null>(null);
  const introLeadRef = useRef<HTMLParagraphElement | null>(null);
  const introBodyRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    let rafId: number | null = null;
    let lastShown = false;
    let lockedComplete = false;

    const applyBlock = (
      el: HTMLElement | null,
      progress: number,
      shiftPx: number
    ) => {
      if (!el) return;
      const e = easeOutCubic(progress);
      el.style.opacity = e.toFixed(3);
      el.style.transform = `translate3d(0, ${((1 - e) * shiftPx).toFixed(2)}px, 0)`;
    };

    const resetPanel = () => {
      const panel = panelRef.current;
      if (panel) {
        panel.style.opacity = '0';
        panel.style.visibility = 'hidden';
        panel.dataset.panelState = 'idle';
      }
      applyBlock(headingRef.current, 0, 12);
      if (barcodeWrapRef.current) {
        barcodeWrapRef.current.style.opacity = '0';
      }
      if (barcodeClipRef.current) {
        barcodeClipRef.current.style.clipPath = 'inset(0 100% 0 0)';
      }
      if (scanLineRef.current) {
        scanLineRef.current.style.opacity = '0';
        scanLineRef.current.style.transform = 'translate3d(0%, 0, 0)';
      }
      applyBlock(nameRef.current, 0, 10);
      applyBlock(descriptorRef.current, 0, 9);
      applyBlock(introLeadRef.current, 0, 9);
      applyBlock(introBodyRef.current, 0, 9);
      lastShown = false;
      lockedComplete = false;
    };

    const tick = () => {
      rafId = window.requestAnimationFrame(tick);
      if (document.hidden) return;

      const st = entranceStateRef.current;
      const panel = panelRef.current;
      if (!panel) return;

      if (!st.panelStarted || st.exitAlpha <= 0.005) {
        if (lastShown) {
          resetPanel();
        }
        return;
      }

      lastShown = true;
      const elapsed = st.panelElapsed;
      const instant = st.reducedMotion;

      panel.style.visibility = 'visible';
      panel.style.opacity = st.exitAlpha.toFixed(3);

      if (lockedComplete && !instant) {
        return;
      }

      // 1. PROFILE heading (0.00s .. 0.56s)
      const pHeading = instant ? 1 : elapsed / 0.56;
      applyBlock(headingRef.current, pHeading, 12);

      // 2. Barcode horizontal scanning reveal (0.34s .. 0.96s)
      const pScanRaw = instant ? 1 : (elapsed - 0.34) / 0.62;
      const pScan = easeInOutQuad(pScanRaw);
      if (barcodeWrapRef.current) {
        const wrapOpacity = instant ? 1 : Math.min(1, Math.max(0, (elapsed - 0.3) / 0.14));
        barcodeWrapRef.current.style.opacity = wrapOpacity.toFixed(3);
      }
      if (barcodeClipRef.current) {
        const rightInset = Math.max(0, (1 - pScan) * 100);
        barcodeClipRef.current.style.clipPath = `inset(0 ${rightInset.toFixed(2)}% 0 0)`;
      }
      if (scanLineRef.current) {
        if (instant || pScanRaw <= 0 || pScanRaw >= 1.08) {
          scanLineRef.current.style.opacity = '0';
        } else {
          // Soft fade in at left edge, crisp glide across bars, clean fade out at right edge
          const edgeIn = Math.min(1, pScanRaw / 0.14);
          const edgeOut = Math.min(1, (1.08 - pScanRaw) / 0.18);
          scanLineRef.current.style.opacity = Math.max(0, edgeIn * edgeOut * 0.9).toFixed(3);
          scanLineRef.current.style.left = `${(Math.min(1, pScan) * 100).toFixed(2)}%`;
        }
      }

      // 3. Staggered editorial bio reveal (name -> descriptor -> intro lead -> intro body)
      const pName = instant ? 1 : (elapsed - 0.92) / 0.52;
      const pDesc = instant ? 1 : (elapsed - 1.1) / 0.52;
      const pLead = instant ? 1 : (elapsed - 1.32) / 0.54;
      const pBody = instant ? 1 : (elapsed - 1.52) / 0.6;

      applyBlock(nameRef.current, pName, 10);
      applyBlock(descriptorRef.current, pDesc, 9);
      applyBlock(introLeadRef.current, pLead, 9);
      applyBlock(introBodyRef.current, pBody, 9);

      const allDone = instant || elapsed >= 2.2;
      panel.dataset.panelState = allDone ? 'complete' : 'revealing';
      if (allDone) {
        lockedComplete = true;
      }
    };

    resetPanel();
    rafId = window.requestAnimationFrame(tick);
    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [entranceStateRef]);

  return (
    <aside
      ref={panelRef}
      className={styles.panel}
      data-profile-panel
      data-encrypted-panel
      data-panel-state="idle"
      aria-label="Profile introduction"
    >
      {/* Top editorial heading + barcode */}
      <header className={styles.headerBlock}>
        <h2 ref={headingRef} className={styles.profileHeading} data-profile-heading>
          {PROFILE_PANEL_CONTENT.heading}
        </h2>

        <div
          ref={barcodeWrapRef}
          className={styles.barcodeWrap}
          data-profile-barcode
          aria-hidden="true"
        >
          <div ref={barcodeClipRef} className={styles.barcodeClip}>
            <svg
              className={styles.barcodeSvg}
              viewBox="0 0 124 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {BARCODE_BARS.map(([x, w], i) => (
                <rect key={i} x={x} y={0} width={w} height={16} fill="currentColor" />
              ))}
            </svg>
          </div>
          <span ref={scanLineRef} className={styles.scanLine} />
        </div>
      </header>

      {/* Generous negative space -> Name, descriptor & editorial bio */}
      <div className={styles.bioBlock}>
        <p ref={nameRef} className={styles.name} data-profile-name>
          {PROFILE_PANEL_CONTENT.name}
        </p>

        <p ref={descriptorRef} className={styles.descriptor} data-profile-descriptor>
          {PROFILE_PANEL_CONTENT.descriptor}
        </p>

        <div className={styles.introCopy}>
          <p ref={introLeadRef} className={styles.introLead} data-profile-intro-lead>
            {PROFILE_PANEL_CONTENT.introLead}
          </p>
          <p ref={introBodyRef} className={styles.introBody} data-profile-intro-body>
            {PROFILE_PANEL_CONTENT.introBody}
          </p>
        </div>
      </div>
    </aside>
  );
}
