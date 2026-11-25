import { useEffect, useRef, useState } from 'react';
import { WavyWireframeGrid } from './WavyWireframeGrid';
import { HeroCharacterLayer } from './HeroCharacterLayer';
import { CraneWordmark } from './CraneWordmark';
import { FollowBirds } from './FollowBirds';
import { CosmicSkillsScene } from '../Skills/CosmicSkillsScene';
import type { SceneTransitionInput } from '../Skills/sceneTimeline';
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
const CENTRAL_WINDOW_ID = 'aperture-central';
const TITLE_TYPEWRITER_STEPS = [
  'akshat.webp',
  'akshat.web',
  'akshat.we',
  'akshat.w',
  'akshat.',
  'akshat.t',
  'akshat.te',
  'akshat.tec',
  'akshat.tech',
] as const;

interface RectBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ScrollMetrics {
  heroLeft: number;
  heroTop: number;
  heroW: number;
  heroH: number;
  frameLeft: number;
  frameTop: number;
  frameW: number;
  frameH: number;
  homeRect: RectBox;
  masterStartX: number;
  masterStartY: number;
  masterStartW: number;
  masterStartH: number;
  frameRadius: number;
  dialogRadius: number;
}

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothstep(t: number): number {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

/**
 * Responsive yet silky expansion curve: responds immediately to initial scroll
 * while decelerating gently into the exact viewport lock at 100%.
 */
function expandEase(t: number): number {
  const x = clamp(t, 0, 1);
  return 0.14 * x + 0.86 * (x * x * (3 - 2 * x));
}

function computeHomeLayouts(width: number, height: number): RectBox[] {
  const isCompact = width < 860;
  const compactSpecs = [
    { x: 0.08, y: 0.48, w: 0.5, h: 0.36 },
    { x: 0.54, y: 0.57, w: 0.36, h: 0.19 },
    { x: 0.64, y: 0.74, w: 0.28, h: 0.17 },
  ];

  return APERTURE_CONFIGS.map((cfg, idx) => {
    if (isCompact) {
      const spec = compactSpecs[idx];
      return {
        x: Math.round(spec.x * width),
        y: Math.round(spec.y * height),
        w: Math.max(105, Math.round(spec.w * width)),
        h: Math.max(88, Math.round(spec.h * height)),
      };
    }
    return {
      x: Math.round(cfg.xFrac * width),
      y: Math.round(cfg.yFrac * height),
      w: Math.max(140, Math.round(cfg.wFrac * width)),
      h: Math.max(130, Math.round(cfg.hFrac * height)),
    };
  });
}

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
  const trackRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const masterSlotRef = useRef<HTMLDivElement | null>(null);
  const wordVideoRef = useRef<HTMLVideoElement | null>(null);

  // Direct DOM refs for zero-React-rerender scroll choreography
  const centralDialogRef = useRef<HTMLDivElement | null>(null);
  const centralClipRectRef = useRef<SVGRectElement | null>(null);
  const centralMaskRectRef = useRef<SVGRectElement | null>(null);
  const expandStageRef = useRef<HTMLDivElement | null>(null);
  const expandClipRef = useRef<HTMLDivElement | null>(null);
  const expandWindowRef = useRef<HTMLDivElement | null>(null);
  const expandInnerRef = useRef<HTMLDivElement | null>(null);
  const expandBackdropRef = useRef<HTMLDivElement | null>(null);
  const expandPortraitRef = useRef<HTMLDivElement | null>(null);
  const expandTitleTextRef = useRef<HTMLSpanElement | null>(null);
  const expandCaretRef = useRef<HTMLSpanElement | null>(null);
  const cosmicSceneRef = useRef<HTMLDivElement | null>(null);
  const cosmicBgRef = useRef<HTMLDivElement | null>(null);
  const cosmicTransitionRef = useRef<SceneTransitionInput>({
    expandProgress: 0,
    bgAlpha: 0,
    isExpanded: false,
  });
  const cosmicVideoRef = useRef<HTMLVideoElement | null>(null);
  const heroBgPausedRef = useRef(false);
  const phase2ClipCollapsedRef = useRef(false);
  const reducedMotionRef = useRef(false);

  const [heroSize, setHeroSize] = useState({ width: 1500, height: 916 });
  const [hasMovedWindow, setHasMovedWindow] = useState(false);
  const zCounterRef = useRef(23);
  const activeDragCleanupRef = useRef<(() => void) | null>(null);

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

  // Live refs mirrored from React state so the scroll rAF loop never triggers React re-renders
  const windowsRef = useRef<ApertureRuntime[]>(windows);
  windowsRef.current = windows;

  const metricsRef = useRef<ScrollMetrics>({
    heroLeft: 18,
    heroTop: 26,
    heroW: 1500,
    heroH: 916,
    frameLeft: 18,
    frameTop: 26,
    frameW: 1500,
    frameH: 916,
    homeRect: { x: 509, y: 275, w: 375, h: 476 },
    masterStartX: 345,
    masterStartY: 270,
    masterStartW: 635,
    masterStartH: 953,
    frameRadius: 10,
    dialogRadius: 3,
  });

  const scrollStateRef = useRef({
    active: false,
    targetP: 0,
    smoothP: 0,
    capturedX: 509,
    capturedY: 275,
    p1End: 0,
    lastTime: 0,
    rafId: null as number | null,
  });

  const applyScrollFrameRef = useRef<(s: number) => void>(() => {});
  const syncMetricsRef = useRef<() => void>(() => {});

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const getMaxScroll = () =>
      Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

    const syncMetrics = () => {
      const heroRect = hero.getBoundingClientRect();
      const stage = expandStageRef.current;
      const stageRect = stage ? stage.getBoundingClientRect() : heroRect;
      const masterSlot = masterSlotRef.current;
      const masterRect = masterSlot ? masterSlot.getBoundingClientRect() : null;

      const heroW = Math.max(300, Math.round(heroRect.width));
      const heroH = Math.max(400, Math.round(heroRect.height));
      const homeLayouts = computeHomeLayouts(heroW, heroH);
      const frameRadius = stage
        ? parseFloat(getComputedStyle(stage).borderTopLeftRadius) || 10
        : 10;

      metricsRef.current = {
        heroLeft: heroRect.left,
        heroTop: heroRect.top,
        heroW,
        heroH,
        frameLeft: stageRect.left,
        frameTop: stageRect.top,
        frameW: Math.max(300, stageRect.width),
        frameH: Math.max(400, stageRect.height),
        homeRect: homeLayouts[0],
        masterStartX: masterRect ? masterRect.left - stageRect.left : heroW * 0.23,
        masterStartY: masterRect ? masterRect.top - stageRect.top : heroH * 0.295,
        masterStartW: masterRect ? masterRect.width : (heroH * 1.04 * 2) / 3,
        masterStartH: masterRect ? masterRect.height : heroH * 1.04,
        frameRadius,
        dialogRadius: 3,
      };

      // Set portrait slot dimensions ONCE on metric sync instead of mutating width/height every scroll frame
      if (expandPortraitRef.current) {
        expandPortraitRef.current.style.width = `${metricsRef.current.masterStartW}px`;
        expandPortraitRef.current.style.height = `${metricsRef.current.masterStartH}px`;
      }
    };

    const setSvgRect = (
      rectEl: SVGRectElement | null,
      x: number,
      y: number,
      w: number,
      h: number
    ) => {
      if (!rectEl) return;
      rectEl.setAttribute('x', String(x));
      rectEl.setAttribute('y', String(y));
      rectEl.setAttribute('width', String(Math.max(0, w)));
      rectEl.setAttribute('height', String(Math.max(0, h)));
    };

    const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mqReduced.matches;
    const onReducedMotionChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mqReduced.addEventListener?.('change', onReducedMotionChange);

    const applyScrollFrame = (s: number) => {
      const st = scrollStateRef.current;
      const m = metricsRef.current;
      const centralWin = windowsRef.current[0];
      const dialogEl = centralDialogRef.current;
      const stageEl = expandStageRef.current;
      const expClipEl = expandClipRef.current;
      const expWinEl = expandWindowRef.current;
      const expInnerEl = expandInnerRef.current;
      const expBackdropEl = expandBackdropRef.current;
      const expPortraitEl = expandPortraitRef.current;
      const reducedMotion = reducedMotionRef.current;

      // Fully restored hero state (s === 0 && target === 0)
      if (s <= 0.0002 && st.targetP <= 0.0002) {
        st.active = false;
        heroBgPausedRef.current = false;
        phase2ClipCollapsedRef.current = false;
        hero.dataset.scrollActive = 'false';
        hero.dataset.scrollStage = 'hero';

        const wordVid = wordVideoRef.current;
        if (wordVid && wordVid.paused) {
          wordVid.muted = true;
          wordVid.play().catch(() => {});
        }
        const cosmicVid = cosmicVideoRef.current;
        if (cosmicVid && !cosmicVid.paused) {
          cosmicVid.pause();
        }

        if (dialogEl && centralWin) {
          dialogEl.style.transform = `translate3d(${centralWin.x}px, ${centralWin.y}px, 0)`;
          dialogEl.style.zIndex = String(centralWin.zIndex);
          dialogEl.style.visibility = '';
          dialogEl.style.opacity = '';
        }

        if (centralWin) {
          setSvgRect(
            centralClipRectRef.current,
            centralWin.x + 1,
            centralWin.y + HEADER_HEIGHT,
            centralWin.w - 2,
            centralWin.h - HEADER_HEIGHT - 1
          );
          setSvgRect(
            centralMaskRectRef.current,
            centralWin.x + 1,
            centralWin.y + HEADER_HEIGHT,
            centralWin.w - 2,
            centralWin.h - HEADER_HEIGHT - 1
          );
        }

        if (stageEl) {
          stageEl.style.visibility = 'hidden';
          stageEl.style.opacity = '0';
        }
        if (expandTitleTextRef.current && expandTitleTextRef.current.textContent !== 'akshat.webp') {
          expandTitleTextRef.current.textContent = 'akshat.webp';
        }
        if (expandCaretRef.current) {
          expandCaretRef.current.style.opacity = '0';
        }
        if (cosmicSceneRef.current) {
          cosmicSceneRef.current.style.visibility = 'hidden';
        }
        if (cosmicBgRef.current) {
          cosmicBgRef.current.style.opacity = '0';
        }
        cosmicTransitionRef.current.expandProgress = 0;
        cosmicTransitionRef.current.bgAlpha = 0;
        cosmicTransitionRef.current.isExpanded = false;
        if (expandPortraitRef.current) {
          expandPortraitRef.current.style.opacity = '1';
          expandPortraitRef.current.style.visibility = 'visible';
        }
        return;
      }

      hero.dataset.scrollActive = 'true';

      // Phase 1: Smoothly return dragged central window to its predefined original position
      if (st.p1End > 0 && s <= st.p1End) {
        heroBgPausedRef.current = false;
        phase2ClipCollapsedRef.current = false;
        const t1 = clamp(s / st.p1End, 0, 1);
        const e1 = reducedMotion ? t1 : smoothstep(t1);
        const curX = lerp(st.capturedX, m.homeRect.x, e1);
        const curY = lerp(st.capturedY, m.homeRect.y, e1);

        if (dialogEl) {
          dialogEl.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
          dialogEl.style.zIndex = '38';
          dialogEl.style.visibility = 'visible';
          dialogEl.style.opacity = '1';
        }

        setSvgRect(
          centralClipRectRef.current,
          curX + 1,
          curY + HEADER_HEIGHT,
          m.homeRect.w - 2,
          m.homeRect.h - HEADER_HEIGHT - 1
        );
        setSvgRect(
          centralMaskRectRef.current,
          curX + 1,
          curY + HEADER_HEIGHT,
          m.homeRect.w - 2,
          m.homeRect.h - HEADER_HEIGHT - 1
        );

        if (stageEl) {
          stageEl.style.visibility = 'hidden';
          stageEl.style.opacity = '0';
        }
        if (cosmicSceneRef.current) {
          cosmicSceneRef.current.style.visibility = 'hidden';
        }
        if (cosmicBgRef.current) {
          cosmicBgRef.current.style.opacity = '0';
        }
        cosmicTransitionRef.current.expandProgress = 0;
        cosmicTransitionRef.current.bgAlpha = 0;
        cosmicTransitionRef.current.isExpanded = false;

        hero.dataset.scrollStage = 'returning';
        return;
      }

      // Phase 2: Smoothly expand central window using GPU-composited clip-path (zero cosmic reflow!)
      const t2 = clamp((s - st.p1End) / Math.max(0.0001, 1 - st.p1End), 0, 1);
      const e2 = reducedMotion ? t2 : expandEase(t2);

      // Hide the in-hero central window & collapse its portrait clip ONCE on entering Phase 2
      // (avoids mutating 8 SVG mask/clip attributes on every single scroll frame)
      if (!phase2ClipCollapsedRef.current) {
        phase2ClipCollapsedRef.current = true;
        if (dialogEl) {
          dialogEl.style.transform = `translate3d(${m.homeRect.x}px, ${m.homeRect.y}px, 0)`;
          dialogEl.style.visibility = 'hidden';
        }
        setSvgRect(centralClipRectRef.current, 0, 0, 0, 0);
        setSvgRect(
          centralMaskRectRef.current,
          m.homeRect.x + 1,
          m.homeRect.y + HEADER_HEIGHT,
          m.homeRect.w - 2,
          m.homeRect.h - HEADER_HEIGHT - 1
        );
      }

      // Pause hidden hero canvas grid & VP9 word-character video once the expanding window covers them
      // so the browser never decodes two heavy videos simultaneously during transition
      const pauseHeroBg = t2 > 0.28;
      heroBgPausedRef.current = pauseHeroBg;
      const wordVid = wordVideoRef.current;
      if (wordVid) {
        if (pauseHeroBg && !wordVid.paused) {
          wordVid.pause();
        } else if (!pauseHeroBg && wordVid.paused) {
          wordVid.muted = true;
          wordVid.play().catch(() => {});
        }
      }

      const startX = m.heroLeft - m.frameLeft + m.homeRect.x;
      const startY = m.heroTop - m.frameTop + m.homeRect.y;
      const curX = lerp(startX, 0, e2);
      const curY = lerp(startY, 0, e2);
      const curW = lerp(m.homeRect.w, m.frameW, e2);
      const curH = lerp(m.homeRect.h, m.frameH, e2);
      const curRadius = lerp(m.dialogRadius, m.frameRadius, e2);

      if (stageEl) {
        stageEl.style.visibility = 'visible';
        stageEl.style.opacity = '1';
      }

      // GPU-composited viewport clip keeps 4K video, canvases & orbs at 100% constant size during scroll!
      if (expClipEl) {
        if (e2 >= 0.999) {
          expClipEl.style.clipPath = `inset(0px 0px 0px 0px round ${m.frameRadius.toFixed(1)}px)`;
        } else {
          const clipTop = Math.max(0, curY);
          const clipRight = Math.max(0, m.frameW - (curX + curW));
          const clipBottom = Math.max(0, m.frameH - (curY + curH));
          const clipLeft = Math.max(0, curX);
          expClipEl.style.clipPath = `inset(${clipTop.toFixed(2)}px ${clipRight.toFixed(2)}px ${clipBottom.toFixed(2)}px ${clipLeft.toFixed(2)}px round ${curRadius.toFixed(2)}px)`;
        }
      }

      // Lightweight border + 28px header chrome box (no heavy children)
      if (expWinEl) {
        expWinEl.style.transform = `translate3d(${curX.toFixed(2)}px, ${curY.toFixed(2)}px, 0)`;
        expWinEl.style.width = `${curW.toFixed(2)}px`;
        expWinEl.style.height = `${curH.toFixed(2)}px`;
      }

      if (expInnerEl) {
        expInnerEl.style.borderRadius = `${curRadius.toFixed(2)}px`;
      }

      // Smoothly bring in solid monochrome window backdrop before expanding over neighbors
      if (expBackdropEl) {
        const backdropAlpha = clamp(e2 / 0.16, 0, 1);
        expBackdropEl.style.opacity = String(backdropAlpha);
      }

      // Scroll-synchronized typewriter transition: delete "webp" and type "tech" (fully reversible)
      const titleEl = expandTitleTextRef.current;
      const caretEl = expandCaretRef.current;
      if (titleEl) {
        let nextTitle: string;
        let showCaret = false;
        if (reducedMotion) {
          nextTitle = t2 >= 0.5 ? 'akshat.tech' : 'akshat.webp';
        } else if (t2 <= 0.18) {
          nextTitle = TITLE_TYPEWRITER_STEPS[0];
        } else if (t2 >= 0.86) {
          nextTitle = TITLE_TYPEWRITER_STEPS[TITLE_TYPEWRITER_STEPS.length - 1];
        } else {
          const typeP = (t2 - 0.18) / (0.86 - 0.18);
          const stepIdx = clamp(
            Math.round(typeP * (TITLE_TYPEWRITER_STEPS.length - 1)),
            0,
            TITLE_TYPEWRITER_STEPS.length - 1
          );
          nextTitle = TITLE_TYPEWRITER_STEPS[stepIdx];
          showCaret = true;
        }
        if (titleEl.textContent !== nextTitle) {
          titleEl.textContent = nextTitle;
        }
        if (caretEl) {
          caretEl.style.opacity = showCaret ? '1' : '0';
        }
      }

      // Preserve exact 2:3 hero portrait during early expansion, then dissolve cleanly to 0
      const portraitFadeOut = reducedMotion
        ? t2 >= 0.5
          ? 1
          : 0
        : smoothstep((t2 - 0.34) / 0.22);

      if (expPortraitEl) {
        const fullApertureW = Math.max(100, m.frameW - 2);
        const fullApertureH = Math.max(100, m.frameH - HEADER_HEIGHT - 1);
        const endH = Math.min(m.masterStartH, fullApertureH * 0.94, fullApertureW * 0.88 * 1.5);
        const endW = endH * (2 / 3);
        const endX = (m.frameW - endW) / 2;
        const endY = Math.max(HEADER_HEIGHT + 10, m.frameH - endH);

        const pX = lerp(m.masterStartX, endX, e2);
        const pY = lerp(m.masterStartY, endY, e2) + (reducedMotion ? 0 : portraitFadeOut * 14);
        const baseScale = lerp(1, m.masterStartH > 0 ? endH / m.masterStartH : 1, e2);
        const pScale = baseScale * (reducedMotion ? 1 : 1 - portraitFadeOut * 0.035);
        const portraitAlpha = 1 - portraitFadeOut;

        expPortraitEl.style.transform = `translate3d(${pX.toFixed(2)}px, ${pY.toFixed(2)}px, 0) scale(${pScale.toFixed(4)})`;
        expPortraitEl.style.opacity = portraitAlpha.toFixed(3);
        expPortraitEl.style.visibility = portraitAlpha > 0.002 ? 'visible' : 'hidden';
      }

      // Reveal monochrome black-hole cosmic backdrop behind departing hero portrait;
      // staged character -> orb -> orbital motion -> panel choreography is owned centrally by CosmicSkillsScene
      const cosmicEl = cosmicSceneRef.current;
      const bgAlpha = reducedMotion
        ? t2 >= 0.5
          ? 1
          : 0
        : smoothstep((t2 - 0.28) / 0.32);

      if (cosmicEl) {
        cosmicEl.style.visibility = bgAlpha > 0.002 ? 'visible' : 'hidden';
      }
      if (cosmicBgRef.current) {
        cosmicBgRef.current.style.opacity = bgAlpha.toFixed(3);
      }

      cosmicTransitionRef.current.expandProgress = t2;
      cosmicTransitionRef.current.bgAlpha = bgAlpha;
      cosmicTransitionRef.current.isExpanded = t2 >= 0.94;

      if (bgAlpha > 0.01) {
        const cosmicVid = cosmicVideoRef.current;
        if (cosmicVid && cosmicVid.paused) {
          cosmicVid.muted = true;
          cosmicVid.play().catch(() => {});
        }
      }

      hero.dataset.scrollStage = t2 >= 0.999 ? 'expanded' : 'expanding';
    };

    applyScrollFrameRef.current = applyScrollFrame;
    syncMetricsRef.current = syncMetrics;

    const tick = (now: number) => {
      const st = scrollStateRef.current;
      const reducedMotion = reducedMotionRef.current;
      const dt = st.lastTime ? Math.min(0.05, Math.max(0.001, (now - st.lastTime) / 1000)) : 1 / 60;
      st.lastTime = now;

      if (reducedMotion) {
        st.smoothP = st.targetP;
      } else {
        // Frame-rate independent smooth damping (~80ms constant: smooths discrete wheel ticks cleanly)
        const alpha = 1 - Math.exp(-12 * dt);
        st.smoothP += (st.targetP - st.smoothP) * alpha;
        if (Math.abs(st.targetP - st.smoothP) < 0.00025) {
          st.smoothP = st.targetP;
        }
      }

      applyScrollFrame(st.smoothP);

      if (Math.abs(st.targetP - st.smoothP) >= 0.00025) {
        st.rafId = window.requestAnimationFrame(tick);
      } else {
        st.rafId = null;
        st.lastTime = 0;
      }
    };

    const scheduleTick = () => {
      const st = scrollStateRef.current;
      if (st.rafId === null) {
        st.lastTime = 0;
        st.rafId = window.requestAnimationFrame(tick);
      }
    };

    const handleScroll = () => {
      const st = scrollStateRef.current;
      const maxScroll = getMaxScroll();
      const targetP = clamp(window.scrollY / maxScroll, 0, 1);

      if (!st.active && targetP > 0.0005) {
        // Cancel any active pointer drag before taking scroll control
        activeDragCleanupRef.current?.();
        syncMetrics();
        const central = windowsRef.current[0];
        const home = metricsRef.current.homeRect;
        st.capturedX = central ? central.x : home.x;
        st.capturedY = central ? central.y : home.y;

        const dragDist = Math.hypot(st.capturedX - home.x, st.capturedY - home.y);
        st.p1End = dragDist < 2 ? 0 : clamp(0.16 + (dragDist / 1500) * 0.16, 0.16, 0.32);
        st.active = true;
      }

      st.targetP = targetP;
      scheduleTick();
    };

    const syncSize = () => {
      const rect = hero.getBoundingClientRect();
      const width = Math.max(300, Math.round(rect.width));
      const height = Math.max(400, Math.round(rect.height));
      setHeroSize({ width, height });

      const layouts = computeHomeLayouts(width, height);
      setWindows((prev) =>
        prev.map((win, idx) => ({
          ...win,
          x: layouts[idx].x,
          y: layouts[idx].y,
          w: layouts[idx].w,
          h: layouts[idx].h,
        }))
      );

      // Re-measure after layout settles and re-sync active scroll state cleanly
      window.requestAnimationFrame(() => {
        syncMetrics();
        const st = scrollStateRef.current;
        const maxScroll = getMaxScroll();
        const nextP = clamp(window.scrollY / maxScroll, 0, 1);
        st.targetP = nextP;
        if (st.active || nextP > 0.0005) {
          const home = metricsRef.current.homeRect;
          st.capturedX = clamp(st.capturedX, 0, Math.max(0, width - home.w));
          st.capturedY = clamp(st.capturedY, 0, Math.max(0, height - home.h));
          st.smoothP = nextP;
          st.active = nextP > 0.0005;
          applyScrollFrame(st.smoothP);
        }
      });
    };

    const ro = new ResizeObserver(syncSize);
    ro.observe(hero);
    syncSize();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', syncSize, { passive: true });

    // Handle reload when page is already scrolled
    if (window.scrollY > 1) {
      window.requestAnimationFrame(() => {
        syncMetrics();
        handleScroll();
      });
    }

    return () => {
      mqReduced.removeEventListener?.('change', onReducedMotionChange);
      ro.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', syncSize);
      const st = scrollStateRef.current;
      if (st.rafId !== null) {
        window.cancelAnimationFrame(st.rafId);
        st.rafId = null;
      }
    };
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
    // Temporarily disable dragging whenever scroll transition is active
    if (scrollStateRef.current.active || window.scrollY > 1) return;

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
      if (scrollStateRef.current.active || window.scrollY > 1) {
        onUp();
        return;
      }
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const nx = Math.max(0, Math.min(maxX, origX + dx));
      const ny = Math.max(0, Math.min(maxY, origY + dy));
      if (nx !== origX || ny !== origY) {
        setHasMovedWindow(true);
      }
      // Keep live ref updated synchronously in case user scrolls immediately after dragging
      windowsRef.current = windowsRef.current.map((item) =>
        item.id === win.id ? { ...item, x: nx, y: ny } : item
      );
      setWindows((prev) => prev.map((item) => (item.id === win.id ? { ...item, x: nx, y: ny } : item)));
    };

    const onUp = () => {
      document.body.style.userSelect = prevUserSelect;
      document.body.style.cursor = prevCursor;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      if (activeDragCleanupRef.current === onUp) {
        activeDragCleanupRef.current = null;
      }
    };

    activeDragCleanupRef.current = onUp;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  const centralWindow = windows[0];

  return (
    <div ref={trackRef} id="top" className={styles.heroScrollTrack}>
      <section
        ref={heroRef}
        className={styles.hero}
        data-scroll-active="false"
        data-scroll-stage="hero"
        aria-label="Homepage Hero"
      >
        {/* Shared SVG clipPath & inverse cutout mask for all 3 window apertures */}
        <svg className={styles.clipSvgDefs} width="0" height="0" aria-hidden="true">
          <defs>
            <clipPath id="hero-mask-apertures" clipPathUnits="userSpaceOnUse">
              {windows.map((win) => (
                <rect
                  key={win.id}
                  ref={win.id === CENTRAL_WINDOW_ID ? centralClipRectRef : undefined}
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
                  ref={win.id === CENTRAL_WINDOW_ID ? centralMaskRectRef : undefined}
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
          <WavyWireframeGrid theme={theme} pausedRef={heroBgPausedRef} />
        </div>

        {/* Layer 2: Original full-body character visible everywhere OUTSIDE the window masks */}
        <div className={styles.baseCharacterMaskLayer}>
          <div className={styles.characterBaseSlot}>
            <HeroCharacterLayer variant="base" />
          </div>
        </div>

        {/* Layer 3: ONE shared masked layer clipped by ALL window apertures:
            - Shared portrait layer (central window)
            - ONE single animated word-character video pixel-aligned directly over
              the original full-body character, revealed ONLY through the window masks */}
        <div className={styles.sharedMaskedLayer} aria-hidden="true">
          <div ref={masterSlotRef} className={styles.masterCharacterSlot}>
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
              ref={win.id === CENTRAL_WINDOW_ID ? centralDialogRef : undefined}
              className={styles.dialogOuter}
              data-dialog-box
              data-window-id={win.id}
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

      {/* Phase 2 Full-Viewport Window Expansion Stage (sits cleanly inside outerFrame z:50) */}
      <div
        ref={expandStageRef}
        className={styles.expandStage}
        data-expand-stage
        aria-hidden="true"
      >
        {/* GPU-clipped constant-size viewport: eliminates ResizeObserver storms & canvas/video reflows during scroll */}
        <div ref={expandClipRef} className={styles.expandViewportClip}>
          <div ref={expandBackdropRef} className={styles.expandBackdrop} />
          <div ref={expandPortraitRef} className={styles.expandPortraitSlot}>
            <HeroCharacterLayer variant="masterMask" />
          </div>
          <div className={styles.cosmicApertureMount}>
            <CosmicSkillsScene
              sceneRef={cosmicSceneRef}
              bgLayerRef={cosmicBgRef}
              transitionInputRef={cosmicTransitionRef}
              videoRef={cosmicVideoRef}
            />
          </div>
        </div>

        {/* Lightweight window border & 28px titlebar chrome overlay */}
        <div
          ref={expandWindowRef}
          className={styles.expandWindow}
          data-expand-window
          data-blink={centralWindow?.blinking ? 'true' : 'false'}
        >
          <div ref={expandInnerRef} className={styles.expandWindowInner}>
            <div className={styles.expandWindowHeader}>
              <span className={styles.expandTitleWrap}>
                <span ref={expandTitleTextRef} className={styles.dialogTitle}>
                  {centralWindow?.title ?? 'akshat.webp'}
                </span>
                <span ref={expandCaretRef} className={styles.titleCaret} aria-hidden="true" />
              </span>
              <button
                type="button"
                className={styles.dialogClose}
                aria-label="Blink window"
                onClick={() => handleCloseBlink(CENTRAL_WINDOW_ID)}
              >
                <span className={styles.closeIcon} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
