import { useEffect, useRef, type MutableRefObject, type RefObject } from 'react';
import { SKILLS_BLACKHOLE_VIDEO, SKILLS_CHARACTER_SRC } from '../../config/heroMedia';
import { CharacterElectricityCanvas } from './CharacterElectricityCanvas';
import { EncryptedInfoPanel } from './EncryptedInfoPanel';
import { SkillOrbitalSystem, type OrbitalCameraState } from './SkillOrbitalSystem';
import { TECHNICAL_SKILLS } from './skillsData';
import {
  createInitialEntranceState,
  evaluateCharacterRiseOffset,
  getTimelineTiming,
  type SceneEntranceState,
  type SceneTransitionInput,
} from './sceneTimeline';
import styles from './CosmicSkillsScene.module.css';

export interface CosmicSceneRefs {
  /** Root container visibility */
  sceneRef?: RefObject<HTMLDivElement | null>;
  /** Background black-hole layer opacity for staggered scroll transition */
  bgLayerRef?: RefObject<HTMLDivElement | null>;
  /** Shared scroll transition progress driving the centralized staged entrance timeline */
  transitionInputRef: MutableRefObject<SceneTransitionInput>;
  /** Video ref so scroll engine ensures playback resumes immediately on reveal */
  videoRef?: RefObject<HTMLVideoElement | null>;
}

const BLACKHOLE_PLAYBACK_RATE = 1.85;
const ORB_COUNT = TECHNICAL_SKILLS.length;

function smoothstep(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

/**
 * Technical Skills Cosmic Scene with Centralized Staged Entrance Choreography:
 *
 *   1. Pre-stage: Monochrome 1.45x black-hole video is visible & moving subtly during expansion.
 *   2. Stage A:   Character rises smoothly from below the viewport with ease-out + subtle settle.
 *   3. Stage B:   All 14 orbs appear ONE AT A TIME with pop overshoot + subtle blue appearance pulse,
 *                 staying 100% stationary until orb #14 has settled.
 *   4. Stage C:   Continuous 3D orbital rotation starts once smoothly (zero jump) + interactive spin unlocks.
 *   5. Stage D:   Left-side encryption/typewriter technical introduction panel decrypts progressively.
 */
export function CosmicSkillsScene({
  sceneRef,
  bgLayerRef,
  transitionInputRef,
  videoRef,
}: CosmicSceneRefs) {
  const internalVideoRef = useRef<HTMLVideoElement | null>(null);
  const resolvedVideoRef = videoRef ?? internalVideoRef;

  const charRevealRef = useRef<HTMLDivElement | null>(null);
  const characterStageRef = useRef<HTMLDivElement | null>(null);
  const bgParallaxRef = useRef<HTMLDivElement | null>(null);
  const fgParallaxRef = useRef<HTMLDivElement | null>(null);
  const shadowParallaxRef = useRef<HTMLDivElement | null>(null);

  const orbitalCameraRef = useRef<OrbitalCameraState>({ camX: 0, camY: 0, compactScale: 1 });
  const energyLevelRef = useRef(0);
  const entranceStateRef = useRef<SceneEntranceState>(createInitialEntranceState(ORB_COUNT));

  // Enforce reliable muted autoplay/loop playback at 1.45x speed on the black-hole background video
  useEffect(() => {
    const video = resolvedVideoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.defaultPlaybackRate = BLACKHOLE_PLAYBACK_RATE;
    video.playbackRate = BLACKHOLE_PLAYBACK_RATE;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');

    const syncPlaybackRate = () => {
      if (Math.abs(video.playbackRate - BLACKHOLE_PLAYBACK_RATE) > 0.01) {
        video.playbackRate = BLACKHOLE_PLAYBACK_RATE;
      }
    };

    const attemptPlay = () => {
      syncPlaybackRate();
      if (!video.paused) return;
      video.muted = true;
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {
          // Will retry on canplay, visibilitychange, or interaction
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
    video.addEventListener('play', syncPlaybackRate);
    video.addEventListener('ended', handleEnded);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pointerdown', attemptPlay, { passive: true, once: true });

    if (video.readyState >= 2) {
      attemptPlay();
    } else {
      video.load();
    }

    return () => {
      video.removeEventListener('loadedmetadata', attemptPlay);
      video.removeEventListener('loadeddata', attemptPlay);
      video.removeEventListener('canplay', attemptPlay);
      video.removeEventListener('play', syncPlaybackRate);
      video.removeEventListener('ended', handleEnded);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pointerdown', attemptPlay);
    };
  }, [resolvedVideoRef]);

  // Unified Master Clock: Centralized Staged Entrance Timeline + 3D Cinematic Camera Parallax (zero React re-renders)
  useEffect(() => {
    const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = mqReduced.matches;
    const onReducedChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
      entranceStateRef.current.reducedMotion = reducedMotion;
    };
    mqReduced.addEventListener?.('change', onReducedChange);

    const finePointer = window.matchMedia('(pointer: fine)').matches;

    let pointerTargetX = 0;
    let pointerTargetY = 0;
    let pointerCurX = 0;
    let pointerCurY = 0;
    let ambientElapsed = 0;
    let lastTime = 0;
    let rafId: number | null = null;

    // Centralized entrance sequence state (never resets on React re-renders or resizes!)
    let sequenceActive = false;
    let seqTime = 0;
    let lastStageAttr = '';

    const resetSequenceToIdle = () => {
      sequenceActive = false;
      seqTime = 0;
      const ent = entranceStateRef.current;
      ent.stage = 'idle';
      ent.exitAlpha = 0;
      ent.charProgress = 0;
      for (let i = 0; i < ent.orbProgress.length; i++) {
        ent.orbProgress[i] = 0;
      }
      ent.orbitStarted = false;
      ent.orbitRamp = 0;
      ent.panelStarted = false;
      ent.panelElapsed = 0;
      ent.energyLevel = 0;
      ent.reducedMotion = reducedMotion;
      energyLevelRef.current = 0;

      if (charRevealRef.current) {
        charRevealRef.current.style.opacity = '0';
        charRevealRef.current.style.transform = 'translate3d(0, 108%, 0)';
      }
      if (characterStageRef.current) {
        characterStageRef.current.style.setProperty('--energy-level', '0');
      }
      if (sceneRef?.current && lastStageAttr !== 'idle') {
        sceneRef.current.dataset.entranceStage = 'idle';
        lastStageAttr = 'idle';
      }
    };

    const tick = (now: number) => {
      rafId = window.requestAnimationFrame(tick);

      if (document.hidden) {
        lastTime = now;
        return;
      }

      const dt = lastTime ? Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000)) : 1 / 60;
      lastTime = now;

      const root = sceneRef?.current;
      const trans = transitionInputRef.current;
      const sceneVisible = !root || root.style.visibility === 'visible';

      if (!sceneVisible || trans.expandProgress <= 0.01) {
        if (sequenceActive || lastStageAttr !== 'idle') {
          resetSequenceToIdle();
        }
        return;
      }

      const ent = entranceStateRef.current;
      ent.reducedMotion = reducedMotion;

      // 1. Trigger staged entrance ONCE when the expanding window settles into full-screen
      if (!sequenceActive && trans.expandProgress >= 0.92) {
        sequenceActive = true;
        seqTime = 0;
      }

      // 2. Handle smooth reverse scroll out of the section (reset sequence once back in early hero)
      if (sequenceActive && trans.expandProgress < 0.34) {
        resetSequenceToIdle();
        return;
      }

      const isCompact = window.innerWidth < 768;
      const compactScale = isCompact ? 0.55 : 1;

      if (sequenceActive) {
        const timing = getTimelineTiming(isCompact);
        const exitAlpha =
          trans.expandProgress >= 0.88
            ? 1
            : smoothstep((trans.expandProgress - 0.36) / 0.52);
        ent.exitAlpha = exitAlpha;

        if (reducedMotion) {
          ent.stage = 'complete';
          ent.charProgress = 1;
          for (let i = 0; i < ent.orbProgress.length; i++) {
            ent.orbProgress[i] = 1;
          }
          ent.orbitStarted = true;
          ent.orbitRamp = 1;
          ent.panelStarted = true;
          ent.panelElapsed = timing.panelDecryptDuration + 1;
          ent.energyLevel = exitAlpha;
        } else {
          // Advance master sequence clock ONLY while fully in the section (pause progression if reversing out)
          if (trans.expandProgress >= 0.88) {
            seqTime += dt;
          }

          const stageAEnd = timing.charDuration;
          const stageBStart = stageAEnd + timing.postCharPause;
          const stageBEnd =
            stageBStart + (ORB_COUNT - 1) * timing.orbStagger + timing.orbPopDuration;
          const stageCStart = stageBEnd + timing.postOrbsPause;
          const stageDStart = stageCStart + timing.panelDelayAfterOrbit;
          const stageEEnd = stageDStart + timing.panelDecryptDuration;

          // Stage A: Character rises smoothly from below the viewport
          ent.charProgress = Math.max(0, Math.min(1, seqTime / timing.charDuration));

          // Eyes & subtle electricity ignite smoothly as character settles into final position
          const energyRamp = smoothstep((ent.charProgress - 0.72) / 0.28);
          ent.energyLevel = energyRamp * exitAlpha;

          // Stage B: Individual orbs pop in ONE AT A TIME strictly after Stage A finishes
          for (let i = 0; i < ORB_COUNT; i++) {
            const orbStart = stageBStart + i * timing.orbStagger;
            ent.orbProgress[i] = Math.max(
              0,
              Math.min(1, (seqTime - orbStart) / timing.orbPopDuration)
            );
          }

          // Stage C: Begin continuous 3D orbital motion strictly after orb #14 has settled
          if (seqTime >= stageCStart) {
            ent.orbitStarted = true;
            ent.orbitRamp = smoothstep((seqTime - stageCStart) / timing.orbitRampDuration);
          } else {
            ent.orbitStarted = false;
            ent.orbitRamp = 0;
          }

          // Stage D: Trigger left-side encryption/typewriter panel strictly after orbital motion has started
          if (seqTime >= stageDStart) {
            ent.panelStarted = true;
            ent.panelElapsed = seqTime - stageDStart;
          } else {
            ent.panelStarted = false;
            ent.panelElapsed = 0;
          }

          // Track deterministic sequence stage
          if (seqTime < stageBStart) {
            ent.stage = 'char_enter';
          } else if (seqTime < stageCStart) {
            ent.stage = 'orb_reveal';
          } else if (seqTime < stageDStart) {
            ent.stage = 'orbiting';
          } else if (seqTime < stageEEnd) {
            ent.stage = 'panel_decrypt';
          } else {
            ent.stage = 'complete';
          }
        }

        // Apply Stage A character transform & opacity (pure GPU transform + opacity, zero rotation/distortion)
        if (charRevealRef.current) {
          const offsetFrac = reducedMotion ? 0 : evaluateCharacterRiseOffset(ent.charProgress);
          const charAlpha = reducedMotion
            ? exitAlpha
            : Math.min(1, ent.charProgress / 0.26) * exitAlpha;
          charRevealRef.current.style.opacity = charAlpha.toFixed(3);
          charRevealRef.current.style.transform = `translate3d(0, ${(offsetFrac * 104).toFixed(2)}%, 0)`;
        }

        if (characterStageRef.current) {
          characterStageRef.current.style.setProperty('--energy-level', ent.energyLevel.toFixed(3));
        }
        energyLevelRef.current = ent.energyLevel;

        if (root && lastStageAttr !== ent.stage) {
          root.dataset.entranceStage = ent.stage;
          lastStageAttr = ent.stage;
        }
      } else {
        // Pre-stage during window expansion: background is alive, foreground remains cleanly hidden
        if (charRevealRef.current) {
          charRevealRef.current.style.opacity = '0';
          charRevealRef.current.style.transform = 'translate3d(0, 108%, 0)';
        }
        energyLevelRef.current = 0;
      }

      // 3. Unified 3D cinematic camera & multi-plane spatial parallax
      // Hold off heavy 3D rotateX/Y re-rasterization on the 4K video during active scroll expansion
      // so the expanding clip transition stays GPU-fast, then ease parallax in smoothly once settled
      if (!reducedMotion && trans.expandProgress >= 0.94) {
        ambientElapsed += dt;
        const alpha = 1 - Math.exp(-4.6 * dt);
        pointerCurX += (pointerTargetX - pointerCurX) * alpha;
        pointerCurY += (pointerTargetY - pointerCurY) * alpha;

        const ambientX =
          Math.sin(ambientElapsed * 0.42) * 0.34 + Math.sin(ambientElapsed * 0.19 + 1.1) * 0.16;
        const ambientY =
          Math.cos(ambientElapsed * 0.33) * 0.26 + Math.sin(ambientElapsed * 0.16 + 2.3) * 0.12;

        const camX = Math.max(-1.15, Math.min(1.15, ambientX + pointerCurX * 0.85));
        const camY = Math.max(-1.05, Math.min(1.05, ambientY + pointerCurY * 0.8));

        if (bgParallaxRef.current) {
          const accretionDriftX = Math.sin(ambientElapsed * 0.27) * 7 * compactScale;
          const accretionDriftY = Math.cos(ambientElapsed * 0.21) * 4 * compactScale;
          const bx = -camX * 28 * compactScale + accretionDriftX;
          const by = -camY * 16 * compactScale + accretionDriftY;
          const bRotY = camX * 2.2 * compactScale;
          const bRotX = -camY * 1.4 * compactScale;
          bgParallaxRef.current.style.transform = `translate3d(${bx.toFixed(2)}px, ${by.toFixed(2)}px, -80px) rotateY(${bRotY.toFixed(2)}deg) rotateX(${bRotX.toFixed(2)}deg) scale(1.14)`;
        }

        orbitalCameraRef.current.camX = camX;
        orbitalCameraRef.current.camY = camY;
        orbitalCameraRef.current.compactScale = compactScale;

        // Only update foreground character parallax when character is actually entering/visible
        if (sequenceActive) {
          if (fgParallaxRef.current) {
            const fx = camX * 24 * compactScale;
            const fy = camY * 10 * compactScale;
            const fRotY = camX * 3.6 * compactScale;
            const fRotX = -camY * 2.0 * compactScale;
            fgParallaxRef.current.style.transform = `translate3d(${fx.toFixed(2)}px, ${fy.toFixed(2)}px, 34px) rotateY(${fRotY.toFixed(2)}deg) rotateX(${fRotX.toFixed(2)}deg)`;
          }

          if (shadowParallaxRef.current) {
            const sx = -camX * 13 * compactScale;
            const sy = -camY * 5 * compactScale;
            shadowParallaxRef.current.style.transform = `translate3d(${sx.toFixed(2)}px, ${sy.toFixed(2)}px, 0)`;
          }
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!finePointer) return;
      const root = sceneRef?.current;
      if (root && root.style.visibility !== 'visible') return;
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      pointerTargetX = Math.max(-1, Math.min(1, (e.clientX / w - 0.5) * 2));
      pointerTargetY = Math.max(-1, Math.min(1, (e.clientY / h - 0.5) * 2));
    };

    const onPointerLeave = () => {
      pointerTargetX = 0;
      pointerTargetY = 0;
    };

    resetSequenceToIdle();
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);
    rafId = window.requestAnimationFrame(tick);

    return () => {
      mqReduced.removeEventListener?.('change', onReducedChange);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [sceneRef, transitionInputRef]);

  return (
    <div
      ref={sceneRef}
      className={styles.cosmicScene}
      data-cosmic-scene
      data-entrance-stage="idle"
      aria-label="Technical skills cosmic scene"
    >
      {/* Plane 1: Deep Background — monochrome 1.45x black-hole video */}
      <div
        ref={bgLayerRef}
        className={styles.backgroundLayer}
        data-cosmic-layer="background"
      >
        <div ref={bgParallaxRef} className={styles.backgroundParallax} data-parallax-bg>
          <video
            ref={resolvedVideoRef}
            className={styles.blackHoleVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            aria-hidden="true"
          >
            <source src={SKILLS_BLACKHOLE_VIDEO} type="video/mp4" />
          </video>
        </div>
        <div className={styles.atmosphereVeil} aria-hidden="true" />
      </div>

      {/* Unified 3D Skill Orbital System (Stage B one-by-one pop -> Stage C continuous 3D orbit) */}
      <SkillOrbitalSystem
        sceneRef={sceneRef}
        entranceStateRef={entranceStateRef}
        cameraRef={orbitalCameraRef}
      />

      {/* Plane 3: Foreground Character (Stage A rise from below -> glowing eyes & micro-electricity) */}
      <div className={styles.foregroundLayer} data-cosmic-layer="foreground">
        <div ref={charRevealRef} className={styles.characterReveal} data-cosmic-character-reveal>
          <div ref={fgParallaxRef} className={styles.characterParallax} data-parallax-fg>
            <div ref={characterStageRef} className={styles.characterStage} data-cosmic-character>
              <div ref={shadowParallaxRef} className={styles.shadowParallaxWrap} aria-hidden="true">
                <img
                  src={SKILLS_CHARACTER_SRC}
                  alt=""
                  className={`${styles.characterLayerImg} ${styles.characterDepthShadow}`}
                  draggable={false}
                />
              </div>

              <img
                src={SKILLS_CHARACTER_SRC}
                alt="Akshat monochrome character"
                className={`${styles.characterLayerImg} ${styles.characterImage}`}
                draggable={false}
              />

              <img
                src={SKILLS_CHARACTER_SRC}
                alt=""
                aria-hidden="true"
                className={`${styles.characterLayerImg} ${styles.characterDarkVeil}`}
                draggable={false}
              />

              <div className={styles.characterEnergyOverlay} data-cosmic-lighting aria-hidden="true">
                <svg
                  className={styles.characterEnergySvg}
                  viewBox="0 0 1672 941"
                  preserveAspectRatio="xMidYMax meet"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  data-cosmic-energy-svg
                >
                  <defs>
                    <filter id="eye-white-glow" x="-80%" y="-80%" width="260%" height="260%">
                      <feGaussianBlur stdDeviation="2.6" result="blurSoft" />
                      <feGaussianBlur stdDeviation="6.5" result="blurWide" />
                      <feMerge>
                        <feMergeNode in="blurWide" />
                        <feMergeNode in="blurSoft" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <g className={styles.eyesGlowGroup} filter="url(#eye-white-glow)" data-cosmic-eyes>
                    <path
                      d="M 803.5 96.8 Q 814.5 92.2 825.5 95.6 Q 814.5 99.0 803.5 96.8 Z"
                      fill="#FFFFFF"
                      fillOpacity="0.88"
                    />
                    <ellipse cx="814.5" cy="95.8" rx="5.2" ry="2.1" fill="#FFFFFF" />

                    <path
                      d="M 863.5 102.4 Q 875.0 101.6 884.5 108.4 Q 873.5 109.2 863.5 102.4 Z"
                      fill="#FFFFFF"
                      fillOpacity="0.86"
                    />
                    <ellipse
                      cx="874.2"
                      cy="105.6"
                      rx="4.8"
                      ry="1.9"
                      transform="rotate(15 874.2 105.6)"
                      fill="#FFFFFF"
                    />
                  </g>
                </svg>
              </div>
            </div>
          </div>

          <CharacterElectricityCanvas
            characterStageRef={characterStageRef}
            energyLevelRef={energyLevelRef}
            cameraRef={orbitalCameraRef}
            className={styles.electricityCanvas}
          />
        </div>
      </div>

      {/* Stage D: Left-side Monochrome Encryption/Typewriter Technical Information Panel */}
      <EncryptedInfoPanel entranceStateRef={entranceStateRef} />
    </div>
  );
}
