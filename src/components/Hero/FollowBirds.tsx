import { useEffect, useRef } from 'react';
import styles from './FollowBirds.module.css';

/**
 * Jhey Tompkins' FOLLOW birds with genuine independent per-bird behaviour:
 * - Each bird has its own resting spot, individual proximity radius, independent
 *   autonomous flight schedule (so one bird occasionally takes a short solo
 *   flight even without pointer hover), distinct Hermite flight paths, and
 *   independently staggered return timing.
 * - Uses secondary cyan accent (#00A0FC), zero audio, respects prefers-reduced-motion.
 */

interface BirdProfile {
  homeFrac: number;
  altHomeFrac: number;
  restFace: 1 | -1;
  scale: number;
  hueShift: number;
  flapHz: number;
  /** Individual proximity sensitivity in px (so birds react one by one, not in unison) */
  alertRadius: number;
  fleeRadius: number;
  fleeDur: number;
  returnDelayMs: number;
  returnDur: number;
  /** Distinct flight arc parameters */
  fleeEndX: number;
  fleeEndY: number;
  fleeG0X: number;
  fleeG0Y: number;
  fleeG1X: number;
  fleeG1Y: number;
  returnStartX: number;
  returnStartY: number;
  /** Independent autonomous solo flight schedule (ms) */
  firstAutoFlightMs: number;
  autoIntervalMs: number;
  autoAwayMs: number;
  idlePeriodSec: number;
  idlePhase: number;
}

const BIRD_PROFILES: BirdProfile[] = [
  {
    homeFrac: 0.12,
    altHomeFrac: 0.22,
    restFace: 1,
    scale: 0.95,
    hueShift: -2,
    flapHz: 8.4,
    alertRadius: 62,
    fleeRadius: 38,
    fleeDur: 0.62,
    returnDelayMs: 520,
    returnDur: 0.74,
    fleeEndX: -126,
    fleeEndY: -88,
    fleeG0X: -42,
    fleeG0Y: -116,
    fleeG1X: -172,
    fleeG1Y: -34,
    returnStartX: -134,
    returnStartY: -92,
    firstAutoFlightMs: 5200,
    autoIntervalMs: 11500,
    autoAwayMs: 1700,
    idlePeriodSec: 3.7,
    idlePhase: 0.2,
  },
  {
    homeFrac: 0.54,
    altHomeFrac: 0.44,
    restFace: -1,
    scale: 1.05,
    hueShift: 0,
    flapHz: 7.5,
    alertRadius: 74,
    fleeRadius: 48,
    fleeDur: 0.72,
    returnDelayMs: 980,
    returnDur: 0.84,
    fleeEndX: 88,
    fleeEndY: -128,
    fleeG0X: 22,
    fleeG0Y: -152,
    fleeG1X: 142,
    fleeG1Y: -56,
    returnStartX: 118,
    returnStartY: -118,
    firstAutoFlightMs: 9600,
    autoIntervalMs: 14800,
    autoAwayMs: 2100,
    idlePeriodSec: 4.9,
    idlePhase: 2.1,
  },
  {
    homeFrac: 0.9,
    altHomeFrac: 0.78,
    restFace: -1,
    scale: 0.91,
    hueShift: 2,
    flapHz: 9.0,
    alertRadius: 56,
    fleeRadius: 32,
    fleeDur: 0.58,
    returnDelayMs: 1380,
    returnDur: 0.76,
    fleeEndX: 158,
    fleeEndY: -78,
    fleeG0X: 68,
    fleeG0Y: -104,
    fleeG1X: 204,
    fleeG1Y: -22,
    returnStartX: 148,
    returnStartY: -82,
    firstAutoFlightMs: 14200,
    autoIntervalMs: 17300,
    autoAwayMs: 1850,
    idlePeriodSec: 4.1,
    idlePhase: 4.3,
  },
];

interface BirdRuntime {
  profile: BirdProfile;
  el: HTMLSpanElement;
  poseEl: SVGGElement;
  upperEl: SVGGElement;
  headEl: SVGGElement;
  wingEl: SVGPathElement;
  tailEl: SVGPathElement;
  state: 'perched' | 'fleeing' | 'away' | 'returning';
  x: number;
  y: number;
  homeX: number;
  useAltPerch: boolean;
  face: number;
  alert: number;
  flightT: number;
  flightDur: number;
  returnAt: number;
  nextAutoAt: number;
  spookedByPointer: boolean;
  landingSquash: number;
}

function hermite(t: number, p0: number, g0: number, p1: number, g1: number) {
  const t2 = t * t;
  const t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * p0 + (t3 - 2 * t2 + t) * g0 + (-2 * t3 + 3 * t2) * p1 + (t3 - t2) * g1;
}

function buildBirdElement(scale: number, hueShift: number): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = styles.bird;
  span.style.setProperty('--scale', scale.toFixed(3));
  span.style.setProperty('--dh', `${hueShift.toFixed(1)}deg`);
  span.innerHTML = `
    <svg viewBox="-12 -18 24 24" aria-hidden="true">
      <g class="pose">
        <g transform="translate(-11 -17)">
          <g class="legs">
            <path d="M10.4 13.6 9.9 16.6M12.4 13.6 12.7 16.6"></path>
          </g>
          <path class="toes" d="M9.9 16.6h1.7M12.7 16.6h1.7"></path>
          <g class="upper">
            <path class="tail" d="M8.8 9.6 2.4 6.8 3.2 10.2 8.6 12.6Z"></path>
            <path class="body" d="M13.4 5.8C10.3 6.1 7.5 7.8 6.2 10.2 5.8 11 6.2 12 7.1 12.7 8.5 13.8 10.3 14.3 12.2 14.2 16 14 19 11.6 19 8.4 19 7.5 18.7 6.8 18.2 6.2Z"></path>
            <g class="head">
              <circle cx="16" cy="5.9" r="2.75"></circle>
              <path d="M18.4 5 21.3 5.9 18.4 6.9Z"></path>
              <circle class="eye" cx="17.1" cy="5.3" r="0.62"></circle>
            </g>
            <path class="wing" d="M14.4 7.6C12.2 6.7 8.4 7.4 5.6 9.7c3.2 1.6 7.1 1.3 8.8-2.1Z"></path>
          </g>
        </g>
      </g>
    </svg>
  `;
  return span;
}

export function FollowBirds() {
  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const layerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const link = linkRef.current;
    const layer = layerRef.current;
    if (!link || !layer) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) return;

    const getWidth = () => link.getBoundingClientRect().width || 48;
    const startNow = performance.now();
    const initialW = getWidth();

    const birds: BirdRuntime[] = BIRD_PROFILES.map((profile) => {
      const el = buildBirdElement(profile.scale, profile.hueShift);
      layer.appendChild(el);
      const homeX = initialW * profile.homeFrac;
      return {
        profile,
        el,
        poseEl: el.querySelector('.pose') as SVGGElement,
        upperEl: el.querySelector('.upper') as SVGGElement,
        headEl: el.querySelector('.head') as SVGGElement,
        wingEl: el.querySelector('.wing') as SVGPathElement,
        tailEl: el.querySelector('.tail') as SVGPathElement,
        state: 'perched',
        x: homeX,
        y: 1,
        homeX,
        useAltPerch: false,
        face: profile.restFace,
        alert: 0,
        flightT: 0,
        flightDur: profile.fleeDur,
        returnAt: 0,
        nextAutoAt: startNow + profile.firstAutoFlightMs,
        spookedByPointer: false,
        landingSquash: 0,
      };
    });

    let pointerPos: { x: number; y: number } | null = null;
    let isFocused = false;
    let touchTimer: number | null = null;
    let rafId = 0;
    let lastTime = startNow;

    const launchBird = (b: BirdRuntime, byPointer: boolean, now: number) => {
      if (b.state !== 'perched') return;
      b.state = 'fleeing';
      b.spookedByPointer = byPointer;
      b.flightT = 0;
      b.flightDur = b.profile.fleeDur;
      b.face = b.profile.fleeEndX >= 0 ? 1 : -1;
      b.returnAt = byPointer ? 0 : now + b.profile.fleeDur * 1000 + b.profile.autoAwayMs;
      // Alternate slightly between primary and secondary perch spot on return
      b.useAltPerch = !b.useAltPerch;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      pointerPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerLeaveDoc = () => {
      pointerPos = null;
    };

    const onTouchDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return;
      if (touchTimer) window.clearTimeout(touchTimer);
      pointerPos = { x: e.clientX, y: e.clientY };
    };

    const onTouchUp = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return;
      if (touchTimer) window.clearTimeout(touchTimer);
      touchTimer = window.setTimeout(() => {
        pointerPos = null;
      }, 900);
    };

    const onFocus = () => {
      if (link.matches(':focus-visible')) isFocused = true;
    };

    const onBlur = () => {
      isFocused = false;
    };

    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - lastTime) / 1000);
      lastTime = now;
      const tSec = now / 1000;
      const box = link.getBoundingClientRect();
      const linkW = box.width || 48;

      for (const b of birds) {
        const targetFrac = b.useAltPerch ? b.profile.altHomeFrac : b.profile.homeFrac;
        b.homeX = linkW * targetFrac;

        // Per-bird distance check to its own perch coordinates (independent reactions!)
        const birdScreenX = box.left + b.homeX;
        const birdScreenY = box.top;
        const dist = pointerPos
          ? Math.hypot(pointerPos.x - birdScreenX, pointerPos.y - birdScreenY)
          : Number.POSITIVE_INFINITY;

        const threatened = isFocused || dist < b.profile.fleeRadius;
        const wary = !threatened && dist < b.profile.alertRadius;

        if (b.state === 'perched') {
          if (threatened) {
            launchBird(b, true, now);
          } else if (now >= b.nextAutoAt) {
            // Autonomous solo flight even without pointer hover
            launchBird(b, false, now);
            b.nextAutoAt = now + b.profile.autoIntervalMs;
          }
        } else if (b.state === 'away') {
          if (b.spookedByPointer) {
            if (!threatened && !wary) {
              if (b.returnAt === 0) {
                b.returnAt = now + b.profile.returnDelayMs;
              } else if (now >= b.returnAt) {
                b.returnAt = 0;
                b.spookedByPointer = false;
                b.state = 'returning';
                b.flightT = 0;
                b.flightDur = b.profile.returnDur;
                b.face = b.profile.returnStartX < 0 ? 1 : -1;
              }
            } else {
              b.returnAt = 0;
            }
          } else if (b.returnAt > 0 && now >= b.returnAt && !threatened) {
            b.returnAt = 0;
            b.state = 'returning';
            b.flightT = 0;
            b.flightDur = b.profile.returnDur;
            b.face = b.profile.returnStartX < 0 ? 1 : -1;
          }
        }

        if (b.state === 'fleeing') {
          b.flightT = Math.min(1, b.flightT + dt / b.flightDur);
          const t = b.flightT;
          b.x = hermite(t, b.homeX, b.profile.fleeG0X, b.homeX + b.profile.fleeEndX, b.profile.fleeG1X);
          b.y = hermite(t, 1, b.profile.fleeG0Y, b.profile.fleeEndY, b.profile.fleeG1Y);

          const opacity = Math.max(0, 1 - Math.max(0, (t - 0.65) / 0.35));
          const flap = Math.sin(tSec * Math.PI * 2 * b.profile.flapHz + b.profile.idlePhase) * 34;

          b.el.style.opacity = opacity.toFixed(3);
          b.el.style.transform = `translate3d(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px, 0)`;
          b.poseEl.setAttribute('transform', `scale(${b.face}, 1) rotate(-14)`);
          b.wingEl.setAttribute('transform', `rotate(${flap.toFixed(1)} 14.4 7.6)`);
          b.upperEl.setAttribute('transform', '');
          b.headEl.setAttribute('transform', '');
          b.tailEl.setAttribute('transform', '');

          if (b.flightT >= 1) {
            b.state = 'away';
            b.el.style.opacity = '0';
          }
        } else if (b.state === 'returning') {
          b.flightT = Math.min(1, b.flightT + dt / b.flightDur);
          const t = b.flightT;
          const dir = b.profile.returnStartX < 0 ? 1 : -1;
          b.x = hermite(t, b.homeX + b.profile.returnStartX, dir * 92, b.homeX, dir * 24);
          b.y = hermite(t, b.profile.returnStartY, 18, 1, 52);

          const opacity = Math.min(1, t / 0.25);
          const flap = Math.sin(tSec * Math.PI * 2 * b.profile.flapHz + b.profile.idlePhase) * 32;

          b.el.style.opacity = opacity.toFixed(3);
          b.el.style.transform = `translate3d(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px, 0)`;
          b.poseEl.setAttribute('transform', `scale(${b.face}, 1) rotate(10)`);
          b.wingEl.setAttribute('transform', `rotate(${flap.toFixed(1)} 14.4 7.6)`);
          b.upperEl.setAttribute('transform', '');
          b.headEl.setAttribute('transform', '');
          b.tailEl.setAttribute('transform', '');

          if (b.flightT >= 1) {
            b.state = 'perched';
            b.x = b.homeX;
            b.y = 1;
            b.face = b.profile.restFace;
            b.landingSquash = 1;
          }
        } else if (b.state === 'perched') {
          b.landingSquash = Math.max(0, b.landingSquash - dt * 5.2);
          b.alert += ((wary ? 1 : 0) - b.alert) * (1 - Math.exp(-dt * 12));

          const cycle = (tSec / b.profile.idlePeriodSec) * Math.PI * 2 + b.profile.idlePhase;
          const headTilt = Math.sin(cycle) * 7 - b.alert * 8;
          const hunker = Math.max(0, Math.sin(cycle * 0.5)) * 0.5 + b.landingSquash * 0.9 - b.alert * 0.6;
          const tailWag = Math.cos(cycle * 1.4) * 4.5 - b.alert * 5;
          const lookFace =
            wary && pointerPos ? (pointerPos.x >= birdScreenX ? 1 : -1) : b.profile.restFace;

          b.el.style.opacity = '1';
          b.el.style.transform = `translate3d(${b.homeX.toFixed(1)}px, ${(1 + hunker * 0.85).toFixed(1)}px, 0)`;
          b.poseEl.setAttribute('transform', `scale(${lookFace}, ${(1 - hunker * 0.08).toFixed(3)})`);
          b.upperEl.setAttribute('transform', `translate(0 ${(hunker * 0.65).toFixed(2)})`);
          b.headEl.setAttribute('transform', `rotate(${headTilt.toFixed(1)} 16 5.9)`);
          b.tailEl.setAttribute('transform', `rotate(${tailWag.toFixed(1)} 8.6 11)`);
          b.wingEl.setAttribute('transform', '');
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeaveDoc);
    window.addEventListener('pointerdown', onTouchDown, { passive: true });
    window.addEventListener('pointerup', onTouchUp, { passive: true });
    window.addEventListener('pointercancel', onTouchUp, { passive: true });
    link.addEventListener('focus', onFocus);
    link.addEventListener('blur', onBlur);

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      if (touchTimer) window.clearTimeout(touchTimer);
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeaveDoc);
      window.removeEventListener('pointerdown', onTouchDown);
      window.removeEventListener('pointerup', onTouchUp);
      window.removeEventListener('pointercancel', onTouchUp);
      link.removeEventListener('focus', onFocus);
      link.removeEventListener('blur', onBlur);
      layer.innerHTML = '';
    };
  }, []);

  return (
    <span className={styles.stage} data-flock>
      <a
        ref={linkRef}
        href="#follow"
        onClick={(e) => e.preventDefault()}
        className={`link-ui ${styles.followLink}`}
        aria-label="Follow"
      >
        Follow
      </a>
      <span ref={layerRef} className={styles.layer} aria-hidden="true" />
    </span>
  );
}
