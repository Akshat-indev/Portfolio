import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import { SkillOrb, type OrbDomHandles } from './SkillOrb';
import { evaluateOrbPop, type SceneEntranceState } from './sceneTimeline';
import {
  getResponsiveOrbitalConfig,
  TECHNICAL_SKILLS,
  type OrbitalConfig,
  type SkillDefinition,
  type SkillId,
} from './skillsData';
import styles from './SkillOrbitalSystem.module.css';

export interface OrbitalCameraState {
  camX: number;
  camY: number;
  compactScale: number;
}

export interface SkillOrbitalSystemProps {
  /** Optional custom skills list (defaults to the 14 configured core technologies) */
  skills?: SkillDefinition[];
  /** Optional partial overrides for orbital geometry */
  configOverride?: Partial<OrbitalConfig>;
  /** Scene root ref so animation automatically pauses when off-screen */
  sceneRef?: RefObject<HTMLDivElement | null>;
  /** Centralized staged entrance timeline state owned by CosmicSkillsScene (zero React re-renders) */
  entranceStateRef: MutableRefObject<SceneEntranceState>;
  /** Shared 3D camera parallax state driven by CosmicSkillsScene */
  cameraRef: MutableRefObject<OrbitalCameraState>;
}

interface ProjectedPoint {
  x: number;
  y: number;
  z: number;
  depthNorm: number;
  persp: number;
}

interface OrbitProjectionParams {
  radius: number;
  cx: number;
  cy: number;
  cosX: number;
  sinX: number;
  cosY: number;
  sinY: number;
  focalLength: number;
  camX: number;
  camY: number;
  compactScale: number;
}

interface DragPhysicsState {
  active: boolean;
  orbId: SkillId | null;
  orbIndex: number;
  pointerId: number | null;
  lastX: number;
  lastY: number;
  lastTimeMs: number;
  releaseOmega: number;
  hasMoved: boolean;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  if (Number.isNaN(num)) return [255, 255, 255];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function projectOrbitPoint(theta: number, p: OrbitProjectionParams): ProjectedPoint {
  const px = p.radius * Math.cos(theta);
  const py = p.radius * Math.sin(theta);

  const y1 = py * p.cosX;
  const z1 = py * p.sinX;

  const x2 = px * p.cosY + z1 * p.sinY;
  const z2 = -px * p.sinY + z1 * p.cosY;
  const y2 = y1;

  const persp = p.focalLength / Math.max(320, p.focalLength - z2);
  const depthNorm = Math.max(-1, Math.min(1, z2 / Math.max(1, p.radius)));

  const parX = p.camX * (9 + depthNorm * 13) * p.compactScale;
  const parY = p.camY * (4.5 + depthNorm * 6) * p.compactScale;

  return {
    x: p.cx + x2 * persp + parX,
    y: p.cy + y2 * persp + parY,
    z: z2,
    depthNorm,
    persp,
  };
}

/**
 * Interactive Monochrome White-Tinted 3D Skill Orbital System (with Staged Entrance):
 *
 * Strictly synchronized with `entranceStateRef`:
 *   - Stage A (`char_enter`): Orbs stay completely hidden & stationary.
 *   - Stage B (`orb_reveal`): Orbs pop in ONE AT A TIME with crisp overshoot, subtle blue appearance pulse,
 *                             and settle. Previously revealed orbs stay 100% stationary (zero rotation).
 *   - Stage C (`orbiting`):   Strictly after orb #14 finishes settling, continuous 3D orbital motion
 *                             starts once with a smooth zero-jump velocity ramp + full hover/hold/fling physics.
 */
export function SkillOrbitalSystem({
  skills = TECHNICAL_SKILLS,
  configOverride,
  sceneRef,
  entranceStateRef,
  cameraRef,
}: SkillOrbitalSystemProps) {
  const measureRef = useRef<HTMLDivElement | null>(null);
  const backGlowRef = useRef<HTMLCanvasElement | null>(null);
  const frontGlowRef = useRef<HTMLCanvasElement | null>(null);
  const orbHandlesRef = useRef<Map<SkillId, OrbDomHandles>>(new Map());
  const sizeRef = useRef({ width: 1447, height: 886 });
  const baseOrbSizeRef = useRef(72);
  const [baseOrbSize, setBaseOrbSize] = useState(72);

  // Mutable interactive orbital physics state (never resets on React re-renders)
  const orbitAngleRef = useRef(0);
  const angularVelocityRef = useRef(0);
  const cruiseDirRef = useRef(1);
  const hoveredOrbIdRef = useRef<SkillId | null>(null);
  const hoverAmountsRef = useRef<Map<SkillId, number>>(new Map());
  const lastProjRef = useRef<OrbitProjectionParams | null>(null);
  const lastCfgRef = useRef<OrbitalConfig | null>(null);
  const dragRef = useRef<DragPhysicsState>({
    active: false,
    orbId: null,
    orbIndex: -1,
    pointerId: null,
    lastX: 0,
    lastY: 0,
    lastTimeMs: 0,
    releaseOmega: 0,
    hasMoved: false,
  });

  const registerOrbRef = useCallback((id: SkillId, nodes: OrbDomHandles | null) => {
    if (nodes) {
      orbHandlesRef.current.set(id, nodes);
    } else {
      orbHandlesRef.current.delete(id);
    }
  }, []);

  const handleOrbPointerEnter = useCallback((id: SkillId) => {
    hoveredOrbIdRef.current = id;
  }, []);

  const handleOrbPointerLeave = useCallback((id: SkillId) => {
    if (hoveredOrbIdRef.current === id) {
      hoveredOrbIdRef.current = null;
    }
  }, []);

  const handleOrbPointerDown = useCallback(
    (id: SkillId, event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      const ent = entranceStateRef.current;
      // Only allow grabbing/flinging once Stage C orbital motion is active
      if (!ent.orbitStarted || ent.exitAlpha <= 0.5) return;

      const idx = skills.findIndex((s) => s.id === id);
      if (idx < 0) return;

      event.preventDefault();
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Ignore synthetic event capture errors
      }

      angularVelocityRef.current = 0;
      hoveredOrbIdRef.current = id;
      dragRef.current = {
        active: true,
        orbId: id,
        orbIndex: idx,
        pointerId: event.pointerId,
        lastX: event.clientX,
        lastY: event.clientY,
        lastTimeMs: performance.now(),
        releaseOmega: 0,
        hasMoved: false,
      };

      const handle = orbHandlesRef.current.get(id);
      if (handle?.shell) {
        handle.shell.dataset.orbHeld = 'true';
      }
    },
    [skills, entranceStateRef]
  );

  const handleOrbPointerMove = useCallback(
    (id: SkillId, event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag.active || drag.orbId !== id) return;
      if (drag.pointerId !== null && event.pointerId !== drag.pointerId) return;

      const proj = lastProjRef.current;
      const cfg = lastCfgRef.current;
      if (!proj || !cfg) return;

      const now = performance.now();
      const dx = event.clientX - drag.lastX;
      const dy = event.clientY - drag.lastY;
      const dt = Math.max(0.004, Math.min(0.1, (now - drag.lastTimeMs) / 1000));

      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
      drag.lastTimeMs = now;

      if (Math.hypot(dx, dy) < 0.25) return;
      drag.hasMoved = true;

      const count = Math.max(1, skills.length);
      const theta = cfg.angleOffsetRad + (drag.orbIndex / count) * Math.PI * 2 + orbitAngleRef.current;
      const eps = 0.015;
      const pPlus = projectOrbitPoint(theta + eps, proj);
      const pMinus = projectOrbitPoint(theta - eps, proj);
      const dxdt = (pPlus.x - pMinus.x) / (2 * eps);
      const dydt = (pPlus.y - pMinus.y) / (2 * eps);
      const tangentLenSq = Math.max(400, dxdt * dxdt + dydt * dydt);

      const dTheta = (dx * dxdt + dy * dydt) / tangentLenSq;
      orbitAngleRef.current = (orbitAngleRef.current + dTheta + Math.PI * 200) % (Math.PI * 2);

      const instOmega = Math.max(-4.2, Math.min(4.2, dTheta / dt));
      drag.releaseOmega = drag.releaseOmega * 0.45 + instOmega * 0.55;
    },
    [skills.length]
  );

  const handleOrbPointerUp = useCallback((id: SkillId, event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active || drag.orbId !== id) return;

    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Ignore synthetic pointer release errors
    }

    const handle = orbHandlesRef.current.get(id);
    if (handle?.shell) {
      handle.shell.dataset.orbHeld = 'false';
    }

    const idleSinceMoveMs = performance.now() - drag.lastTimeMs;
    const staleDecay = idleSinceMoveMs > 140 ? 0 : Math.max(0, 1 - idleSinceMoveMs / 160);
    const boostedFling = drag.hasMoved ? drag.releaseOmega * 1.45 * staleDecay : 0;
    const clampedFling = Math.max(-3.6, Math.min(3.6, boostedFling));

    if (Math.abs(clampedFling) > 0.24) {
      angularVelocityRef.current = clampedFling;
      cruiseDirRef.current = clampedFling >= 0 ? 1 : -1;
    } else {
      angularVelocityRef.current = 0;
    }

    dragRef.current = {
      active: false,
      orbId: null,
      orbIndex: -1,
      pointerId: null,
      lastX: 0,
      lastY: 0,
      lastTimeMs: 0,
      releaseOmega: 0,
      hasMoved: false,
    };
  }, []);

  // Measure constant-size cosmic aperture (fires ONLY on real viewport resizes — NEVER during scroll!)
  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const syncSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 10 || rect.height <= 10) return;

      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      sizeRef.current = { width: w, height: h };

      const cfg = { ...getResponsiveOrbitalConfig(w, h), ...configOverride };
      baseOrbSizeRef.current = cfg.baseOrbSize;
      setBaseOrbSize((prev) => (prev === cfg.baseOrbSize ? prev : cfg.baseOrbSize));

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (const canvas of [backGlowRef.current, frontGlowRef.current]) {
        if (!canvas) continue;
        const targetW = Math.max(1, Math.round(w * dpr));
        const targetH = Math.max(1, Math.round(h * dpr));
        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW;
          canvas.height = targetH;
        }
      }
    };

    const ro = new ResizeObserver(syncSize);
    ro.observe(el);
    syncSize();
    return () => ro.disconnect();
  }, [configOverride]);

  // Continuous 3D orbital rendering & staged entrance loop (zero React re-renders)
  useEffect(() => {
    let lastTime = 0;
    let rafId: number | null = null;
    let hadVisibleFrame = true;
    let wasOrbitActive = false;

    const clearCanvases = () => {
      for (const canvas of [backGlowRef.current, frontGlowRef.current]) {
        if (!canvas) continue;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    };

    const resetOrbsHidden = () => {
      for (const skill of skills) {
        const handle = orbHandlesRef.current.get(skill.id);
        if (handle?.shell) {
          handle.shell.style.opacity = '0';
          handle.shell.style.visibility = 'hidden';
          handle.shell.style.pointerEvents = 'none';
          handle.shell.dataset.orbHeld = 'false';
          handle.shell.dataset.orbRevealed = 'false';
        }
      }
      orbitAngleRef.current = 0;
      angularVelocityRef.current = 0;
      cruiseDirRef.current = 1;
      hoveredOrbIdRef.current = null;
      hoverAmountsRef.current.clear();
      dragRef.current.active = false;
      wasOrbitActive = false;
      if (measureRef.current) {
        measureRef.current.dataset.orbitVelocity = '0.000';
        measureRef.current.dataset.orbitHeld = 'false';
        measureRef.current.dataset.orbitHovered = '';
        measureRef.current.dataset.orbitStarted = 'false';
      }
    };

    const renderFrame = (now: number) => {
      rafId = window.requestAnimationFrame(renderFrame);

      if (document.hidden) {
        lastTime = now;
        return;
      }

      const root = sceneRef?.current;
      const ent = entranceStateRef.current;
      const sceneVisible = !root || root.style.visibility === 'visible';
      const anyOrbActive =
        ent.stage === 'orb_reveal' ||
        ent.stage === 'orbiting' ||
        ent.stage === 'panel_decrypt' ||
        ent.stage === 'complete';

      if (!sceneVisible || ent.stage === 'idle' || ent.exitAlpha <= 0.002 || !anyOrbActive) {
        if (hadVisibleFrame || ent.stage === 'idle') {
          clearCanvases();
          resetOrbsHidden();
          hadVisibleFrame = false;
        }
        lastTime = now;
        return;
      }

      hadVisibleFrame = true;

      const dt = lastTime ? Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000)) : 1 / 60;
      lastTime = now;

      const { width, height } = sizeRef.current;
      const cfg: OrbitalConfig = { ...getResponsiveOrbitalConfig(width, height), ...configOverride };
      lastCfgRef.current = cfg;

      const baseOmega = (Math.PI * 2) / Math.max(10, cfg.orbitPeriodSec);
      const drag = dragRef.current;

      // Stage B vs Stage C: Strictly stationary during orb reveal; smooth zero-jump start in Stage C
      if (!ent.orbitStarted || ent.reducedMotion) {
        angularVelocityRef.current = 0;
        if (!wasOrbitActive) {
          orbitAngleRef.current = 0;
        }
      } else {
        if (!wasOrbitActive) {
          // Exact first frame of Stage C: start cleanly from 0 velocity so there is zero jump
          wasOrbitActive = true;
          angularVelocityRef.current = 0;
        }

        if (drag.active) {
          angularVelocityRef.current = 0;
          if (now - drag.lastTimeMs > 60) {
            drag.releaseOmega *= Math.exp(-9 * dt);
          }
        } else {
          const rampedTarget = baseOmega * ent.orbitRamp * cruiseDirRef.current;
          const curOmega = angularVelocityRef.current;
          const decayRate = Math.abs(curOmega) > baseOmega * 1.15 ? 0.58 : 3.2;
          const nextOmega = rampedTarget + (curOmega - rampedTarget) * Math.exp(-decayRate * dt);
          angularVelocityRef.current = nextOmega;
          orbitAngleRef.current =
            (orbitAngleRef.current + nextOmega * dt + Math.PI * 200) % (Math.PI * 2);
        }
      }

      if (measureRef.current) {
        measureRef.current.dataset.orbitVelocity = angularVelocityRef.current.toFixed(3);
        measureRef.current.dataset.orbitHeld = drag.active ? 'true' : 'false';
        measureRef.current.dataset.orbitHovered = hoveredOrbIdRef.current ?? '';
        measureRef.current.dataset.orbitStarted = ent.orbitStarted ? 'true' : 'false';
      }

      const { camX, camY, compactScale } = cameraRef.current;

      const cx = width * cfg.centerXFrac;
      const cy = height * cfg.centerYFrac;
      const radiusX = width * cfg.radiusWidthFrac;
      const radiusY = height * cfg.radiusHeightFrac;
      const radius = Math.min(radiusX, radiusY * 1.12);

      const tiltX = ((cfg.tiltXDeg - camY * 2.2 * compactScale) * Math.PI) / 180;
      const tiltY = ((cfg.tiltYDeg + camX * 3.0 * compactScale) * Math.PI) / 180;

      const proj: OrbitProjectionParams = {
        radius,
        cx,
        cy,
        cosX: Math.cos(tiltX),
        sinX: Math.sin(tiltX),
        cosY: Math.cos(tiltY),
        sinY: Math.sin(tiltY),
        focalLength: cfg.focalLength,
        camX,
        camY,
        compactScale,
      };
      lastProjRef.current = proj;

      const lightX = width * 0.72;
      const lightY = height * 0.24;

      const count = Math.max(1, skills.length);
      const isCompact = width < 640;
      const curBaseSize = baseOrbSizeRef.current;

      const speedRatio = Math.max(0, Math.abs(angularVelocityRef.current) / baseOmega - 1);
      const speedEnergy = Math.min(1, speedRatio / 6.5);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const backCanvas = backGlowRef.current;
      const frontCanvas = frontGlowRef.current;
      const backCtx = backCanvas?.getContext('2d') ?? null;
      const frontCtx = frontCanvas?.getContext('2d') ?? null;

      if (backCanvas && backCtx) {
        const tw = Math.max(1, Math.round(width * dpr));
        const th = Math.max(1, Math.round(height * dpr));
        if (backCanvas.width !== tw || backCanvas.height !== th) {
          backCanvas.width = tw;
          backCanvas.height = th;
        }
        backCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        backCtx.clearRect(0, 0, width, height);
      }

      if (frontCanvas && frontCtx) {
        const tw = Math.max(1, Math.round(width * dpr));
        const th = Math.max(1, Math.round(height * dpr));
        if (frontCanvas.width !== tw || frontCanvas.height !== th) {
          frontCanvas.width = tw;
          frontCanvas.height = th;
        }
        frontCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        frontCtx.clearRect(0, 0, width, height);
      }

      const hoverAlpha = 1 - Math.exp(-16 * dt);
      const canInteract = ent.orbitStarted && ent.exitAlpha > 0.65;

      for (let idx = 0; idx < count; idx++) {
        const skill = skills[idx];
        const orbP = ent.orbProgress[idx] ?? 0;
        const handle = orbHandlesRef.current.get(skill.id);

        if (orbP <= 0.001) {
          if (handle?.shell) {
            handle.shell.style.opacity = '0';
            handle.shell.style.visibility = 'hidden';
            handle.shell.style.pointerEvents = 'none';
            handle.shell.dataset.orbRevealed = 'false';
          }
          continue;
        }

        const pop = ent.reducedMotion
          ? { scaleFactor: 1, opacity: 1, arrivePulse: 0 }
          : evaluateOrbPop(orbP);

        const theta = cfg.angleOffsetRad + (idx / count) * Math.PI * 2 + orbitAngleRef.current;
        const pt = projectOrbitPoint(theta, proj);

        const isHeld = drag.active && drag.orbId === skill.id;
        const isHovered = canInteract && (hoveredOrbIdRef.current === skill.id || isHeld);
        const prevHover = hoverAmountsRef.current.get(skill.id) ?? 0;
        const nextHover = prevHover + ((isHovered ? 1 : 0) - prevHover) * hoverAlpha;
        hoverAmountsRef.current.set(
          skill.id,
          nextHover < 0.002 ? 0 : nextHover > 0.998 ? 1 : nextHover
        );

        const depth01 = (pt.depthNorm + 1) * 0.5;
        const minScale = isCompact ? 0.78 : 0.74;
        const maxScale = isCompact ? 1.2 : 1.24;
        const hoverScaleLift = 1 + nextHover * (isHeld ? 0.14 : 0.11);
        const depthScale =
          (minScale + depth01 * (maxScale - minScale)) *
          (skill.sizeFactor ?? 1) *
          pop.scaleFactor *
          hoverScaleLift;

        const orbOpacity = Math.min(
          1,
          (0.72 + depth01 * 0.28 + nextHover * 0.2) * pop.opacity * ent.exitAlpha
        );

        const isFront = pt.z > 0;
        const zIndex = isFront
          ? 30 + Math.round(pt.depthNorm * 15) + (isHovered ? 4 : 0)
          : 6 + Math.round((pt.depthNorm + 1) * 10) + (isHovered ? 2 : 0);

        if (handle?.shell) {
          const halfBase = curBaseSize * 0.5;
          const tx = pt.x - halfBase;
          const ty = pt.y - halfBase;

          handle.shell.style.visibility = 'visible';
          handle.shell.style.pointerEvents = canInteract ? 'auto' : 'none';
          handle.shell.style.opacity = orbOpacity.toFixed(3);
          handle.shell.style.zIndex = String(zIndex);
          handle.shell.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${depthScale.toFixed(4)})`;

          // Deep black eclipse arrival glow during Stage B pop-in (NO blue!), then white + brand glow on hover
          const glowStrength = nextHover + speedEnergy * 0.35;
          const [br, bg, bb] = hexToRgb(skill.brandColor);
          if (pop.arrivePulse > 0.03) {
            const pBlur1 = (12 + pop.arrivePulse * 20).toFixed(1);
            const pBlur2 = (22 + pop.arrivePulse * 28).toFixed(1);
            const pA1 = Math.min(0.98, 0.55 + pop.arrivePulse * 0.43).toFixed(2);
            const pA2 = Math.min(0.92, 0.35 + pop.arrivePulse * 0.55).toFixed(2);
            handle.shell.style.filter = `drop-shadow(0 0 ${pBlur1}px rgba(0, 0, 0, ${pA1})) drop-shadow(0 0 ${pBlur2}px rgba(0, 0, 0, ${pA2}))`;
          } else if (glowStrength > 0.02) {
            const blur1 = (8 + glowStrength * 12).toFixed(1);
            const blur2 = (16 + glowStrength * 24).toFixed(1);
            const a1 = Math.min(0.88, 0.34 + glowStrength * 0.45).toFixed(2);
            const a2 = Math.min(0.85, 0.24 + nextHover * 0.6 + speedEnergy * 0.18).toFixed(2);
            const bright = (1 + nextHover * 0.1 + speedEnergy * 0.08).toFixed(3);
            handle.shell.style.filter = `drop-shadow(0 0 ${blur1}px rgba(255, 255, 255, ${a1})) drop-shadow(0 0 ${blur2}px rgba(${br}, ${bg}, ${bb}, ${a2})) brightness(${bright})`;
          } else {
            handle.shell.style.filter = 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.22))';
          }

          // Smoothly transition logo colour saturation via GPU CSS filter: faint at rest (0.28) -> full vibrant colour on hover (1.22)
          const colorSat = 0.28 + nextHover * 0.94;
          const logoBright = 1.06 + nextHover * 0.06;
          if (handle.logoColorGroup) {
            handle.logoColorGroup.style.filter = `saturate(${colorSat.toFixed(3)}) brightness(${logoBright.toFixed(3)})`;
          }
          if (handle.brandTintCircle) {
            handle.brandTintCircle.setAttribute('opacity', (0.14 + nextHover * 0.56).toFixed(3));
          }

          handle.shell.dataset.orbDepthPlane = isFront ? 'front' : 'back';
          handle.shell.dataset.orbScale = depthScale.toFixed(3);
          handle.shell.dataset.orbZ = pt.z.toFixed(1);
          handle.shell.dataset.orbHoverGlow = nextHover.toFixed(2);
          handle.shell.dataset.orbColorSat = colorSat.toFixed(2);
          handle.shell.dataset.orbRevealed = orbP >= 0.99 ? 'true' : 'entering';

          const lightDirDeg = (Math.atan2(lightY - pt.y, lightX - pt.x) * 180) / Math.PI;
          const highlightRot = ((lightDirDeg + 135) * 0.55 + Math.cos(theta) * 14).toFixed(1);

          if (handle.specularGroup) {
            handle.specularGroup.setAttribute('transform', `rotate(${highlightRot} 60 60)`);
            handle.specularGroup.setAttribute(
              'opacity',
              Math.min(1, 0.8 + depth01 * 0.2 + nextHover * 0.15).toFixed(2)
            );
          }
          if (handle.causticGroup) {
            handle.causticGroup.setAttribute('transform', `rotate(${highlightRot} 60 60)`);
          }
          if (handle.innerGlowCircle) {
            handle.innerGlowCircle.setAttribute(
              'opacity',
              Math.min(0.82, 0.52 + depth01 * 0.22 + speedEnergy * 0.14).toFixed(2)
            );
          }
          if (handle.hoverHaloCircle) {
            handle.hoverHaloCircle.setAttribute(
              'opacity',
              Math.min(0.65, nextHover * 0.55 + speedEnergy * 0.22).toFixed(2)
            );
          }
        }

        // Soft floating ambient glow around each individual sphere
        // Stage B arrival uses a deep black eclipse aura (source-over), settling cleanly into subtle white + faint brand glow
        const ctx = isFront ? frontCtx : backCtx;
        if (ctx) {
          const visualRadius = curBaseSize * depthScale * 0.5;
          const [br, bg, bb] = hexToRgb(skill.brandColor);

          if (pop.arrivePulse > 0.02) {
            // Deep black shadow eclipse pulse during orb arrival (visible over accretion disk & grey coat)
            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
            const darkR = visualRadius * (1.55 + (1 - pop.arrivePulse * 0.3) * 1.4);
            const darkA = Math.min(0.95, pop.arrivePulse * 0.92 * ent.exitAlpha);
            const dGrad = ctx.createRadialGradient(pt.x, pt.y, visualRadius * 0.3, pt.x, pt.y, darkR);
            dGrad.addColorStop(0, `rgba(0, 0, 0, ${darkA.toFixed(3)})`);
            dGrad.addColorStop(0.52, `rgba(4, 4, 6, ${(darkA * 0.68).toFixed(3)})`);
            dGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = dGrad;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, darkR, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';

            const glowRadius = visualRadius * (2.05 + nextHover * 0.95 + speedEnergy * 0.3);
            const baseGlowAlpha = (isFront ? 0.2 : 0.14) * (0.65 + depth01 * 0.35);
            const glowAlpha = Math.min(
              0.72,
              (baseGlowAlpha + nextHover * 0.32 + speedEnergy * 0.12) * pop.opacity * ent.exitAlpha
            );

            // Subtle white halo blended gently with faint logo brand colour (blooms richer on hover)
            const tintMix = 0.22 + nextHover * 0.62;
            const mr = Math.round(255 * (1 - tintMix) + br * tintMix);
            const mg = Math.round(255 * (1 - tintMix) + bg * tintMix);
            const mb = Math.round(255 * (1 - tintMix) + bb * tintMix);

            const grad = ctx.createRadialGradient(
              pt.x,
              pt.y,
              visualRadius * 0.22,
              pt.x,
              pt.y,
              glowRadius
            );
            grad.addColorStop(0, `rgba(${mr}, ${mg}, ${mb}, ${(glowAlpha * 0.88).toFixed(3)})`);
            grad.addColorStop(0.45, `rgba(${mr}, ${mg}, ${mb}, ${(glowAlpha * 0.42).toFixed(3)})`);
            grad.addColorStop(1, `rgba(${mr}, ${mg}, ${mb}, 0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, glowRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
          }
        }
      }
    };

    rafId = window.requestAnimationFrame(renderFrame);
    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [skills, configOverride, sceneRef, entranceStateRef, cameraRef]);

  return (
    <>
      <div
        ref={measureRef}
        className={styles.measureLayer}
        data-skill-orbit-system
        aria-label="Technical skills 3D orbital formation"
      />
      <canvas
        ref={backGlowRef}
        className={styles.glowCanvasBack}
        data-orbital-glow="back"
        aria-hidden="true"
      />
      {skills.map((skill) => (
        <SkillOrb
          key={skill.id}
          skill={skill}
          baseDiameter={baseOrbSize}
          registerRef={registerOrbRef}
          onOrbPointerEnter={handleOrbPointerEnter}
          onOrbPointerLeave={handleOrbPointerLeave}
          onOrbPointerDown={handleOrbPointerDown}
          onOrbPointerMove={handleOrbPointerMove}
          onOrbPointerUp={handleOrbPointerUp}
        />
      ))}
      <canvas
        ref={frontGlowRef}
        className={styles.glowCanvasFront}
        data-orbital-glow="front"
        aria-hidden="true"
      />
    </>
  );
}
