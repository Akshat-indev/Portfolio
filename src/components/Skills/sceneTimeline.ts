/**
 * Centralized Staged Entrance Timeline for the Technical Skills Cosmic Scene.
 *
 * Strictly enforces the deliberate sequential choreography without scattered setTimeouts:
 *   1. Pre-stage: Black-hole background video is visible & subtly moving during window expansion.
 *   2. Stage A (`char_enter`):   Character rises smoothly from below the viewport with ease-out + subtle settle.
 *   3. Stage B (`orb_reveal`):   All 14 orbs appear ONE AT A TIME with pop overshoot + subtle blue light pulse;
 *                                all previously revealed orbs stay 100% stationary (no orbital motion yet).
 *   4. Stage C (`orbiting`):     Only after orb #14 has completely settled, continuous 3D orbital motion
 *                                begins once with a smooth zero-jump velocity ramp.
 *   5. Stage D (`panel_decrypt`): Left-side encryption/typewriter info panel begins decrypting after
 *                                orbital motion is visibly underway.
 *   6. Stage E (`complete`):     All ambient & interactive animations continue indefinitely.
 */

export type SceneEntranceStage =
  | 'idle'
  | 'char_enter'
  | 'orb_reveal'
  | 'orbiting'
  | 'panel_decrypt'
  | 'complete';

export interface SceneTransitionInput {
  /** Phase 2 window expansion progress [0..1] from scroll engine */
  expandProgress: number;
  /** Background black-hole reveal alpha [0..1] */
  bgAlpha: number;
  /** True once the window is fully expanded */
  isExpanded: boolean;
}

export interface SceneEntranceState {
  stage: SceneEntranceStage;
  /** Overall foreground visibility multiplier during smooth reverse scrolling [0..1] */
  exitAlpha: number;
  /** Stage A: Character entrance progress [0..1] */
  charProgress: number;
  /** Stage B: Per-orb entrance progress [0..1] for each orb index */
  orbProgress: number[];
  /** Stage C: True strictly after ALL orbs have settled and continuous orbital rotation has started */
  orbitStarted: boolean;
  /** Smooth ramp [0..1] easing angular velocity from 0 -> baseOmega without a jump */
  orbitRamp: number;
  /** Stage D: True strictly after orbital motion has started and the decryption panel is triggered */
  panelStarted: boolean;
  /** Seconds elapsed since Stage D panel decryption began */
  panelElapsed: number;
  /** Restrained character eyes + micro-electricity intensity [0..1] */
  energyLevel: number;
  /** Cached prefers-reduced-motion flag */
  reducedMotion: boolean;
}

export interface TimelineTiming {
  charDuration: number;
  postCharPause: number;
  orbStagger: number;
  orbPopDuration: number;
  postOrbsPause: number;
  orbitRampDuration: number;
  panelDelayAfterOrbit: number;
  panelDecryptDuration: number;
}

export function getTimelineTiming(isCompact: boolean): TimelineTiming {
  if (isCompact) {
    return {
      charDuration: 0.72,
      postCharPause: 0.1,
      orbStagger: 0.085,
      orbPopDuration: 0.3,
      postOrbsPause: 0.12,
      orbitRampDuration: 0.6,
      panelDelayAfterOrbit: 0.3,
      panelDecryptDuration: 3.6,
    };
  }
  return {
    charDuration: 0.85,
    postCharPause: 0.12,
    orbStagger: 0.105,
    orbPopDuration: 0.34,
    postOrbsPause: 0.14,
    orbitRampDuration: 0.65,
    panelDelayAfterOrbit: 0.35,
    panelDecryptDuration: 4.0,
  };
}

export function createInitialEntranceState(orbCount: number): SceneEntranceState {
  return {
    stage: 'idle',
    exitAlpha: 0,
    charProgress: 0,
    orbProgress: new Array<number>(orbCount).fill(0),
    orbitStarted: false,
    orbitRamp: 0,
    panelStarted: false,
    panelElapsed: 0,
    energyLevel: 0,
    reducedMotion: false,
  };
}

/**
 * Polished ease-out with subtle final micro-settle for Stage A character entrance.
 * Maps p in [0..1] -> vertical offset factor (1 = hidden below viewport, 0 = final resting position,
 * with a very gentle -0.012 overshoot settle near the end — zero distortion or bounce).
 */
export function evaluateCharacterRiseOffset(p: number): number {
  const t = Math.max(0, Math.min(1, p));
  if (t >= 1) return 0;
  if (t <= 0) return 1;
  // Quartic ease-out base
  const inv = 1 - t;
  const base = inv * inv * inv * inv;
  // Subtle micro-settle envelope peaking gently around t=0.82 and fading cleanly to 0 at t=1
  const settle = Math.sin(t * Math.PI) * t * t * (1 - t) * 0.16;
  return base - settle;
}

/**
 * Crisp pop-in curve with slight overshoot and smooth settle for Stage B individual orb appearance.
 * Returns { scaleFactor, opacity, arrivePulse } for a single orb's progress p in [0..1].
 */
export function evaluateOrbPop(p: number): {
  scaleFactor: number;
  opacity: number;
  arrivePulse: number;
} {
  const t = Math.max(0, Math.min(1, p));
  if (t <= 0) {
    return { scaleFactor: 0.36, opacity: 0, arrivePulse: 0 };
  }
  if (t >= 1) {
    return { scaleFactor: 1, opacity: 1, arrivePulse: 0 };
  }

  // Ease-out back curve (slight crisp overshoot to ~1.15 then smooth settle to 1.0)
  const c1 = 2.05;
  const c3 = c1 + 1;
  const u = t - 1;
  const back = 1 + c3 * u * u * u + c1 * u * u;
  const scaleFactor = 0.36 + 0.64 * back;

  // Fast clean fade-in during first 35% of pop
  const opacity = Math.min(1, t / 0.34);

  // Deep black eclipse arrival pulse peaking as the orb materializes, then fading cleanly to 0
  const pulseEnv = Math.sin(Math.pow(t, 0.72) * Math.PI);
  const arrivePulse = Math.max(0, pulseEnv * (1 - t * 0.32));

  return { scaleFactor, opacity, arrivePulse };
}
