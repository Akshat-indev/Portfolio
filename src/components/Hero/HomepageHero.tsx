import { useEffect, useRef, useState } from 'react';
import { WavyWireframeGrid } from './WavyWireframeGrid';
import { HeroCharacterLayer } from './HeroCharacterLayer';
import { CraneWordmark } from './CraneWordmark';
import { FollowBirds } from './FollowBirds';
import {
  HERO_WORD_CHARACTER_MP4,
  HERO_WORD_CHARACTER_POSTER,
  HERO_WORD_CHARACTER_WEBM,
} from '../../config/heroMedia';
import styles from './HomepageHero.module.css';

interface ApertureConfig {
  id: string;
  title: string;
  xFrac: number;
  yFrac: number;
  wFrac: number;
  hFrac: number;
}

interface ApertureRuntime extends ApertureConfig {
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
  blinking: boolean;
}

const HEADER_HEIGHT = 28;

/**
 * Three independently draggable masking apertures:
 * 1. Central portrait: 33.9% left, 30% top,   25% width,   52% height (unchanged)
 * 2. Upper-right:      65% left,   31% top,   19.5% width, 27.5% height (upper torso & shoulder)
 * 3. Lower-right:      75.5% left, 55.5% top, 14.5% width, 25.5% height (thigh & lower leg)
 *
 * The right-side windows share ONE continuous, pixel-aligned animated
 * word-character video overlapping the original full-body character.
 */
const APERTURE_CONFIGS: ApertureConfig[] = [
  {
    id: 'aperture-central',
    title: 'akshat.webp',
    xFrac: 0.339,
    yFrac: 0.3,
    wFrac: 0.25,
    hFrac: 0.52,
  },
  {
    id: 'aperture-upper-right',
    title: 'akshat.webp',
    xFrac: 0.65,
    yFrac: 0.31,
    wFrac: 0.195,
    hFrac: 0.275,
  },
  {
    id: 'aperture-lower-right',
    title: 'akshat.webp',
    xFrac: 0.755,
    yFrac: 0.555,
    wFrac: 0.145,
    hFrac: 0.255,
  },
];

interface HomepageHeroProps {
  theme: 'dark' | 'light';
}

function IntroCopyBlock({
  mode = 'base',
}: {
  mode?: 'base' | 'craneOverlay';
}) {
  if (mode === 'craneOverlay') {
    return (
      <div className={styles.introInner} aria-hidden="true">
        <div className={styles.headerBlock}>
          <CraneWordmark mode="craneOverlay" />
          <p className={`${styles.role} ${styles.ghostBlock}`}>Software Developer</p>
        </div>
        <div className={`${styles.bioBlock} ${styles.ghostBlock}`}>
          <p>
            Hey, I&apos;m Akshat &mdash; a software developer building for the web, backend
            systems, and AI workflows. Here you&apos;ll find my projects, notes, and experiments.
          </p>
        </div>
        <div className={`${styles.actionsRow} ${styles.ghostBlock}`}>
          <ul className={styles.actionLinks}>
            <li><span>Blog</span><span className={styles.sep}>&middot;</span></li>
            <li><span>Shelves</span><span className={styles.sep}>&middot;</span></li>
            <li><span>Projects</span><span className={styles.sep}>&middot;</span></li>
            <li><span>About</span><span className={styles.sep}>&middot;</span></li>
            <li><span>Follow</span></li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.introInner}>
      {/* Reserved anchor position for future hanging decorative element (empty) */}
      <div className={styles.hangingAnchor} data-hanging-anchor aria-hidden="true" />

      <header className={styles.headerBlock}>
        <CraneWordmark mode="base" />
        <p className={styles.role}>Software Developer</p>
      </header>

      <div className={styles.bioBlock}>
        <p>
          Hey, I&apos;m Akshat &mdash; a software developer building for the web, backend
          systems, and AI workflows. Here you&apos;ll find my{' '}
          <a
            href="#projects"
            onClick={(e) => e.preventDefault()}
            className="link-prose"
            aria-disabled="true"
          >
            projects
          </a>
          , notes, and experiments.
        </p>
      </div>

      <div className={styles.actionsRow}>
        <ul className={styles.actionLinks}>
          <li>
            <a href="#latest" onClick={(e) => e.preventDefault()} className="link-ui" aria-disabled="true">
              Blog
            </a>
            <span className={styles.sep} aria-hidden="true">&middot;</span>
          </li>
          <li>
            <a href="#shelves" onClick={(e) => e.preventDefault()} className="link-ui" aria-disabled="true">
              Shelves
            </a>
            <span className={styles.sep} aria-hidden="true">&middot;</span>
          </li>
          <li>
            <a href="#projects" onClick={(e) => e.preventDefault()} className="link-ui" aria-disabled="true">
              Projects
            </a>
            <span className={styles.sep} aria-hidden="true">&middot;</span>
          </li>
          <li>
            <a href="#about" onClick={(e) => e.preventDefault()} className="link-ui" aria-disabled="true">
              About
            </a>
            <span className={styles.sep} aria-hidden="true">&middot;</span>
          </li>
          <li>
            <FollowBirds />
          </li>
        </ul>

        {/* Reserved empty slot for future handwritten SVG signature */}
        <div className={styles.signatureSlot} data-signature-slot aria-hidden="true" />
      </div>
    </div>
  );
}

export function HomepageHero({ theme }: HomepageHeroProps) {
  const heroRef = useRef<HTMLElement | null>(null);
  const wordVideoRef = useRef<HTMLVideoElement | null>(null);
  const [heroSize, setHeroSize] = useState({ width: 1500, height: 916 });
  const [hasMovedWindow, setHasMovedWindow] = useState(false);
  const zCounterRef = useRef(23);

  // Cache-bust in dev mode so regenerated media never collides with stale 206 byte-range caches
  const webmSrc = import.meta.env.DEV
    ? `${HERO_WORD_CHARACTER_WEBM}?v=1280`
    : HERO_WORD_CHARACTER_WEBM;
  const mp4Src = import.meta.env.DEV
    ? `${HERO_WORD_CHARACTER_MP4}?v=1280`
    : HERO_WORD_CHARACTER_MP4;

  // Enforce DOM muted/playsinline attributes + reliable autoplay/loop recovery across all browsers
  useEffect(() => {
    const video = wordVideoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');

    const attemptPlay = () => {
      if (!video.paused) return;
      video.muted = true;
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {
          // Will retry on canplay, visibilitychange, or first user interaction
        });
      }
    };

    const handleEnded = () => {
      video.currentTime = 0;
      attemptPlay();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        attemptPlay();
      }
    };

    video.addEventListener('loadedmetadata', attemptPlay);
    video.addEventListener('loadeddata', attemptPlay);
    video.addEventListener('canplay', attemptPlay);
    video.addEventListener('ended', handleEnded);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pointerdown', attemptPlay, { passive: true, once: true });
    window.addEventListener('keydown', attemptPlay, { passive: true, once: true });

    if (video.readyState >= 2) {
      attemptPlay();
    } else {
      video.load();
    }

    return () => {
      video.removeEventListener('loadedmetadata', attemptPlay);
      video.removeEventListener('loadeddata', attemptPlay);
      video.removeEventListener('canplay', attemptPlay);
      video.removeEventListener('ended', handleEnded);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pointerdown', attemptPlay);
      window.removeEventListener('keydown', attemptPlay);
    };
  }, [webmSrc]);

  // Stacking order: lower-right overlaps upper-right intentionally; central portrait independent
  const initialZOrder = [21, 20, 22];

  const [windows, setWindows] = useState<ApertureRuntime[]>(() =>
    APERTURE_CONFIGS.map((cfg, i) => ({
      ...cfg,
      x: Math.round(cfg.xFrac * 1500),
      y: Math.round(cfg.yFrac * 916),
      w: Math.round(cfg.wFrac * 1500),
      h: Math.round(cfg.hFrac * 916),
      zIndex: initialZOrder[i] ?? 20 + i,
      blinking: false,
    }))
  );

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const syncSize = () => {
      const rect = hero.getBoundingClientRect();
      const width = Math.max(300, Math.round(rect.width));
      const height = Math.max(540, Math.round(rect.height));
      setHeroSize({ width, height });

      const isCompact = width < 860;

      setWindows((prev) =>
        prev.map((win, idx) => {
          const cfg = APERTURE_CONFIGS[idx];
          if (isCompact) {
            const compactLayout = [
              { x: 0.08, y: 0.48, w: 0.5, h: 0.36 },
              { x: 0.54, y: 0.57, w: 0.36, h: 0.19 },
              { x: 0.64, y: 0.74, w: 0.28, h: 0.17 },
            ][idx];
            return {
              ...win,
              x: Math.round(compactLayout.x * width),
              y: Math.round(compactLayout.y * height),
              w: Math.max(105, Math.round(compactLayout.w * width)),
              h: Math.max(88, Math.round(compactLayout.h * height)),
            };
          }

          return {
            ...win,
            x: Math.round(cfg.xFrac * width),
            y: Math.round(cfg.yFrac * height),
            w: Math.max(140, Math.round(cfg.wFrac * width)),
            h: Math.max(130, Math.round(cfg.hFrac * height)),
          };
        })
      );
    };

    const ro = new ResizeObserver(syncSize);
    ro.observe(hero);
    syncSize();
    return () => ro.disconnect();
  }, []);

  const bringToFront = (id: string) => {
    zCounterRef.current = Math.min(39, zCounterRef.current + 1);
    const nextZ = zCounterRef.current;
    setWindows((prev) => {
      if (zCounterRef.current >= 39) {
        const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);
        const rank = new Map(sorted.map((item, idx) => [item.id, 20 + idx]));
        zCounterRef.current = 24;
        return prev.map((w) => ({ ...w, zIndex: w.id === id ? 24 : (rank.get(w.id) ?? 20) }));
      }
      return prev.map((w) => (w.id === id ? { ...w, zIndex: nextZ } : w));
    });
  };

  const handleCloseBlink = (id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, blinking: true } : w)));
    window.setTimeout(() => {
      setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, blinking: false } : w)));
    }, 500);
  };

  const handleDragStart = (e: React.PointerEvent<HTMLDivElement>, win: ApertureRuntime) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    bringToFront(win.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const origX = win.x;
    const origY = win.y;
    const maxX = Math.max(0, heroSize.width - win.w);
    const maxY = Math.max(0, heroSize.height - win.h);

    const prevUserSelect = document.body.style.userSelect;
    const prevCursor = document.body.style.cursor;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const nx = Math.max(0, Math.min(maxX, origX + dx));
      const ny = Math.max(0, Math.min(maxY, origY + dy));
      if (nx !== origX || ny !== origY) {
        setHasMovedWindow(true);
      }
      setWindows((prev) => prev.map((item) => (item.id === win.id ? { ...item, x: nx, y: ny } : item)));
    };

    const onUp = () => {
      document.body.style.userSelect = prevUserSelect;
      document.body.style.cursor = prevCursor;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  return (
    <section ref={heroRef} id="top" className={styles.hero} aria-label="Homepage Hero">
      {/* Shared SVG clipPath & inverse cutout mask for all 4 window apertures */}
      <svg className={styles.clipSvgDefs} width="0" height="0" aria-hidden="true">
        <defs>
          <clipPath id="hero-mask-apertures" clipPathUnits="userSpaceOnUse">
            {windows.map((win) => (
              <rect
                key={win.id}
                x={win.x + 1}
                y={win.y + HEADER_HEIGHT}
                width={Math.max(0, win.w - 2)}
                height={Math.max(0, win.h - HEADER_HEIGHT - 1)}
              />
            ))}
          </clipPath>
          <mask
            id="hero-character-cutout"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={heroSize.width}
            height={heroSize.height}
          >
            <rect x="0" y="0" width={heroSize.width} height={heroSize.height} fill="white" />
            {windows.map((win) => (
              <rect
                key={win.id}
                x={win.x + 1}
                y={win.y + HEADER_HEIGHT}
                width={Math.max(0, win.w - 2)}
                height={Math.max(0, win.h - HEADER_HEIGHT - 1)}
                fill="black"
              />
            ))}
          </mask>
        </defs>
      </svg>

      {/* Layer 1: Static/non-interactive centered wireframe grid */}
      <div className={styles.wireframeWrapper}>
        <WavyWireframeGrid theme={theme} />
      </div>

      {/* Layer 2: Original full-body character visible everywhere OUTSIDE the window masks */}
      <div className={styles.baseCharacterMaskLayer}>
        <div className={styles.characterBaseSlot}>
          <HeroCharacterLayer variant="base" />
        </div>
      </div>

      {/* Layer 3: ONE shared masked layer clipped by ALL 4 window apertures:
          - Shared portrait layer (central window)
          - ONE single animated word-character video pixel-aligned directly over
            the original full-body character, revealed ONLY through the window masks */}
      <div className={styles.sharedMaskedLayer} aria-hidden="true">
        <div className={styles.masterCharacterSlot}>
          <HeroCharacterLayer variant="masterMask" />
        </div>
        <div className={styles.wordCharacterOverlaySlot}>
          <video
            ref={wordVideoRef}
            className={styles.wordVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={HERO_WORD_CHARACTER_POSTER}
            disablePictureInPicture
            aria-label="Animated word-filled character"
          >
            <source src={webmSrc} type="video/webm" />
            <source src={mp4Src} type="video/mp4" />
          </video>
        </div>
      </div>

      {/* Layer 4: Main hero introduction text (remains readable and never turns neon) */}
      <div className={styles.introSlot}>
        <IntroCopyBlock mode="base" />
      </div>

      {/* Layer 5: 3 freely-draggable thin-bordered window chrome frames (pure viewing masks) */}
      <div className={styles.windowsLayer}>
        {windows.map((win, idx) => (
          <div
            key={win.id}
            className={styles.dialogOuter}
            data-dialog-box
            data-blink={win.blinking ? 'true' : 'false'}
            style={{
              width: `${win.w}px`,
              height: `${win.h}px`,
              transform: `translate3d(${win.x}px, ${win.y}px, 0)`,
              zIndex: win.zIndex,
              ['--stagger' as string]: `${idx * 0.04}s`,
            }}
          >
            <div className={styles.dialogInner}>
              <div
                className={styles.dialogHeader}
                onPointerDown={(e) => handleDragStart(e, win)}
              >
                <span className={styles.dialogTitle}>{win.title}</span>
                <button
                  type="button"
                  className={styles.dialogClose}
                  aria-label={`Blink ${win.title}`}
                  onClick={() => handleCloseBlink(win.id)}
                >
                  <span className={styles.closeIcon} aria-hidden="true" />
                </button>
              </div>
              <div className={styles.dialogAperture} />
            </div>
          </div>
        ))}
      </div>

      {/* Subtle handwritten "move this" & curved arrow — removed only once a window is actually moved */}
      <div
        className={styles.moveHint}
        data-hidden={hasMovedWindow ? 'true' : 'false'}
        aria-hidden="true"
      >
        <span className={styles.moveHintText}>move this</span>
        <svg
          className={styles.moveHintArrow}
          viewBox="0 0 66 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 6 10 C 26 4, 46 16, 55 40"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          <path
            d="M 48.5 35.5 L 55.4 41.2 L 58.2 33"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Layer 6: Independent top-level crane & punctuation animation layer */}
      <div className={styles.craneOverlayLayer} aria-hidden="true">
        <div className={styles.craneOverlaySlot}>
          <IntroCopyBlock mode="craneOverlay" />
        </div>
      </div>

      {/* Layer 7: 109ichiki bottom-left metadata & barcode */}
      <div className={styles.bottomLeftMeta}>
        <p className={styles.metaLabel}>
          Akshat
          <br />
          software
          <br />
          portfolio
        </p>
        <span className={styles.barcode} aria-hidden="true" translate="no">
          portfolio
        </span>
      </div>
    </section>
  );
}
