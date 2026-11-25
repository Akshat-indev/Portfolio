import { memo, useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { SkillLogo } from './SkillLogos';
import type { SkillDefinition, SkillId } from './skillsData';
import styles from './SkillOrb.module.css';

export interface OrbDomHandles {
  shell: HTMLDivElement | null;
  specularGroup: SVGGElement | null;
  causticGroup: SVGGElement | null;
  innerGlowCircle: SVGCircleElement | null;
  hoverHaloCircle: SVGCircleElement | null;
  brandTintCircle: SVGCircleElement | null;
  logoColorGroup: SVGGElement | null;
}

export interface SkillOrbProps {
  skill: SkillDefinition;
  /** Base optical diameter in px (real-time depth scale & position are applied imperatively in rAF) */
  baseDiameter: number;
  /** Ref callback so the 3D orbital rAF engine drives transforms & lighting with zero React re-renders */
  registerRef: (id: SkillId, nodes: OrbDomHandles | null) => void;
  onOrbPointerEnter: (id: SkillId) => void;
  onOrbPointerLeave: (id: SkillId) => void;
  onOrbPointerDown: (id: SkillId, event: ReactPointerEvent<HTMLDivElement>) => void;
  onOrbPointerMove: (id: SkillId, event: ReactPointerEvent<HTMLDivElement>) => void;
  onOrbPointerUp: (id: SkillId, event: ReactPointerEvent<HTMLDivElement>) => void;
}

const MONO_GLASS_PALETTE: Record<
  SkillDefinition['monoTone'],
  {
    bright: string;
    silver: string;
    mid: string;
    deep: string;
    spec: string;
  }
> = {
  frost: {
    bright: '#FFFFFF',
    silver: '#E5E5E5',
    mid: '#A3A3A3',
    deep: '#171717',
    spec: '#FFFFFF',
  },
  pearl: {
    bright: '#FAFAFA',
    silver: '#D4D4D4',
    mid: '#8A8A8A',
    deep: '#141414',
    spec: '#FFFFFF',
  },
  silver: {
    bright: '#F5F5F5',
    silver: '#D8D8D8',
    mid: '#7E7E7E',
    deep: '#121212',
    spec: '#FAFAFA',
  },
};

/**
 * Monochrome White-Tinted 3D Optical Glass Skill Sphere:
 * - Strictly black, white & silver crystal glass matching the high-contrast monochrome cosmos
 * - Translucent frosted-white glass body, curved specular reflection dome, internal silver caustics
 * - Glowing black-and-white official vector technology symbol suspended inside the glass
 * - Interactive: glows brighter on hover, pauses orbit on hold, and responds to drag-fling spin
 * - Zero text labels, zero cards, zero CSS gradients
 */
export const SkillOrb = memo(function SkillOrb({
  skill,
  baseDiameter,
  registerRef,
  onOrbPointerEnter,
  onOrbPointerLeave,
  onOrbPointerDown,
  onOrbPointerMove,
  onOrbPointerUp,
}: SkillOrbProps) {
  const uid = `orb-${skill.id}`;
  const palette = MONO_GLASS_PALETTE[skill.monoTone];

  const shellRef = useRef<HTMLDivElement | null>(null);
  const specularRef = useRef<SVGGElement | null>(null);
  const causticRef = useRef<SVGGElement | null>(null);
  const innerGlowRef = useRef<SVGCircleElement | null>(null);
  const hoverHaloRef = useRef<SVGCircleElement | null>(null);
  const brandTintRef = useRef<SVGCircleElement | null>(null);
  const logoColorGroupRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    registerRef(skill.id, {
      shell: shellRef.current,
      specularGroup: specularRef.current,
      causticGroup: causticRef.current,
      innerGlowCircle: innerGlowRef.current,
      hoverHaloCircle: hoverHaloRef.current,
      brandTintCircle: brandTintRef.current,
      logoColorGroup: logoColorGroupRef.current,
    });
    return () => {
      registerRef(skill.id, null);
    };
  }, [skill.id, registerRef]);

  return (
    <div
      ref={shellRef}
      className={styles.orbShell}
      data-skill-orb={skill.id}
      data-skill-name={skill.name}
      data-orb-depth-plane="back"
      data-orb-held="false"
      style={{
        width: `${baseDiameter.toFixed(1)}px`,
        height: `${baseDiameter.toFixed(1)}px`,
      }}
      onPointerEnter={() => onOrbPointerEnter(skill.id)}
      onPointerLeave={() => onOrbPointerLeave(skill.id)}
      onPointerDown={(e) => onOrbPointerDown(skill.id, e)}
      onPointerMove={(e) => onOrbPointerMove(skill.id, e)}
      onPointerUp={(e) => onOrbPointerUp(skill.id, e)}
      onPointerCancel={(e) => onOrbPointerUp(skill.id, e)}
      aria-label={skill.name}
      title={skill.name}
    >
      <svg
        className={styles.orbSvg}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Layer 1A: Restrained luminous white outer halo */}
          <radialGradient id={`${uid}-ambient`} cx="50%" cy="50%" r="50%">
            <stop offset="56%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="76%" stopColor="#FFFFFF" stopOpacity="0.34" />
            <stop offset="88%" stopColor={palette.silver} stopOpacity="0.16" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>

          {/* Layer 1B: Extra hover/hold white bloom (opacity driven smoothly 0..1 in rAF) */}
          <radialGradient id={`${uid}-hoverHalo`} cx="50%" cy="50%" r="50%">
            <stop offset="44%" stopColor="#FFFFFF" stopOpacity="0.56" />
            <stop offset="68%" stopColor="#FFFFFF" stopOpacity="0.32" />
            <stop offset="88%" stopColor={palette.silver} stopOpacity="0.12" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>

          {/* Layer 2: Translucent frosted-white & smoked-obsidian 3D crystal volume */}
          <radialGradient id={`${uid}-body`} cx="40%" cy="34%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
            <stop offset="36%" stopColor={palette.silver} stopOpacity="0.22" />
            <stop offset="70%" stopColor={palette.deep} stopOpacity="0.68" />
            <stop offset="91%" stopColor="#3F3F46" stopOpacity="0.82" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.9" />
          </radialGradient>

          {/* Layer 3A: Subtle internal white volumetric glow (modulated with depth & hover in rAF) */}
          <radialGradient id={`${uid}-innerWhiteLight`} cx="50%" cy="54%" r="48%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.34" />
            <stop offset="52%" stopColor={palette.silver} stopOpacity="0.18" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>

          {/* Layer 3B: Deep charcoal optical well directly behind the B&W logo so crisp white strokes pop */}
          <radialGradient id={`${uid}-logoWell`} cx="50%" cy="52%" r="40%">
            <stop offset="0%" stopColor="#050507" stopOpacity="0.64" />
            <stop offset="68%" stopColor="#0A0A0D" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#0A0A0D" stopOpacity="0" />
          </radialGradient>

          {/* Layer 4A: Primary lower-right internal white/silver caustic refraction */}
          <radialGradient id={`${uid}-causticPrimary`} cx="75%" cy="79%" r="44%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.72" />
            <stop offset="34%" stopColor={palette.silver} stopOpacity="0.46" />
            <stop offset="68%" stopColor={palette.mid} stopOpacity="0.14" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>

          {/* Layer 4B: Secondary opposite-rim soft silver refractive bounce */}
          <radialGradient id={`${uid}-causticSecondary`} cx="22%" cy="74%" r="36%">
            <stop offset="0%" stopColor={palette.silver} stopOpacity="0.42" />
            <stop offset="56%" stopColor={palette.mid} stopOpacity="0.12" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>

          {/* Layer 5: Curved glass dome specular reflection */}
          <linearGradient id={`${uid}-domeSpec`} x1="18%" y1="8%" x2="68%" y2="58%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.86" />
            <stop offset="36%" stopColor={palette.bright} stopOpacity="0.42" />
            <stop offset="72%" stopColor={palette.silver} stopOpacity="0.12" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Layer 6: Inner refractive white/silver bevel ring */}
          <linearGradient id={`${uid}-innerBevel`} x1="82%" y1="86%" x2="18%" y2="14%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.78" />
            <stop offset="46%" stopColor={palette.mid} stopOpacity="0.18" />
            <stop offset="78%" stopColor={palette.silver} stopOpacity="0.48" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.82" />
          </linearGradient>

          {/* Layer 7: Polished outer Fresnel white/silver glass rim */}
          <linearGradient id={`${uid}-rimStroke`} x1="14%" y1="10%" x2="88%" y2="90%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
            <stop offset="30%" stopColor={palette.silver} stopOpacity="0.86" />
            <stop offset="64%" stopColor={palette.mid} stopOpacity="0.56" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.92" />
          </linearGradient>

          {/* Layer 3C: Internal brand-colour tint (faint at rest, richer when hovered/held) */}
          <radialGradient id={`${uid}-brandTint`} cx="50%" cy="54%" r="48%">
            <stop offset="0%" stopColor={skill.brandColor} stopOpacity="0.46" />
            <stop offset="62%" stopColor={skill.brandColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={skill.brandColor} stopOpacity="0" />
          </radialGradient>

          {/* Subtle logo glow & contrast drop-shadow (live saturation is driven via GPU CSS filter on logoColorGroup) */}
          <filter id={`${uid}-logoGlow`} x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="softGlow" />
            <feColorMatrix
              in="softGlow"
              type="matrix"
              values="1 0 0 0 0.08  0 1 0 0 0.08  0 0 1 0 0.08  0 0 0 0.58 0"
              result="logoHalo"
            />
            <feDropShadow
              in="SourceGraphic"
              dx="0"
              dy="1.8"
              stdDeviation="2.0"
              floodColor="#000000"
              floodOpacity="0.85"
              result="logoDrop"
            />
            <feMerge>
              <feMergeNode in="logoHalo" />
              <feMergeNode in="logoDrop" />
            </feMerge>
          </filter>

          <clipPath id={`${uid}-sphereClip`}>
            <circle cx="60" cy="60" r="49.2" />
          </clipPath>
        </defs>

        {/* Layer 1: Restrained white outer aura + dynamic hover/hold extra white bloom */}
        <circle cx="60" cy="60" r="59" fill={`url(#${uid}-ambient)`} />
        <circle
          ref={hoverHaloRef}
          cx="60"
          cy="60"
          r="60"
          fill={`url(#${uid}-hoverHalo)`}
          opacity="0"
        />

        {/* Layers 2..5 clipped inside the crystal sphere */}
        <g clipPath={`url(#${uid}-sphereClip)`}>
          {/* Layer 2: Translucent monochrome white/obsidian crystal volume */}
          <circle cx="60" cy="60" r="49.5" fill={`url(#${uid}-body)`} />

          {/* Layer 3: Dynamic internal white illumination + faint-to-full brand colour tint */}
          <circle
            ref={innerGlowRef}
            cx="60"
            cy="60"
            r="49.5"
            fill={`url(#${uid}-innerWhiteLight)`}
            opacity="0.72"
          />
          <circle
            ref={brandTintRef}
            cx="60"
            cy="60"
            r="49.5"
            fill={`url(#${uid}-brandTint)`}
            opacity="0.14"
          />

          {/* Layer 4: Orientation-responsive internal white/silver caustics */}
          <g ref={causticRef} data-orb-caustic>
            <circle cx="60" cy="60" r="49.5" fill={`url(#${uid}-causticPrimary)`} />
            <circle cx="60" cy="60" r="49.5" fill={`url(#${uid}-causticSecondary)`} />
            <path
              d="M 42 103 C 66 108, 91 98, 102 76 C 94 92, 74 100, 52 100 Z"
              fill="#FFFFFF"
              fillOpacity="0.52"
            />
            <path
              d="M 55 104 C 73 105, 89 96, 98 81 C 88 94, 72 101, 55 104 Z"
              fill={palette.bright}
              fillOpacity="0.46"
            />
          </g>

          {/* Subtle dark optical well directly behind the glowing B&W symbol */}
          <circle cx="60" cy="60" r="35" fill={`url(#${uid}-logoWell)`} />

          {/* Layer 5: Glowing official logo (faint brand colour at rest, full vibrant colour when hovered) */}
          <g ref={logoColorGroupRef} style={{ filter: 'saturate(0.28) brightness(1.06)' }}>
            <g transform="translate(27, 27) scale(1.03)" filter={`url(#${uid}-logoGlow)`}>
              <SkillLogo id={skill.id} uid={uid} />
            </g>
          </g>

          {/* Layer 6: Orientation-responsive curved glass dome specular reflections & studio catchlights */}
          <g ref={specularRef} data-orb-specular>
            <path
              d="M 20 46 C 23 20, 46 11, 72 15 C 84 17, 94 23, 98 32 C 82 23, 62 23, 45 31 C 32 37, 24 43, 20 46 Z"
              fill={`url(#${uid}-domeSpec)`}
            />
            <ellipse
              cx="36.5"
              cy="28"
              rx="11"
              ry="4.8"
              transform="rotate(-32 36.5 28)"
              fill="#FFFFFF"
              fillOpacity="0.7"
            />
            <ellipse
              cx="38"
              cy="29.5"
              rx="15"
              ry="6.4"
              transform="rotate(-32 38 29.5)"
              fill="#FFFFFF"
              fillOpacity="0.2"
            />
            <circle cx="30.5" cy="35.5" r="2.3" fill="#FFFFFF" fillOpacity="0.86" />
            <circle cx="85" cy="84" r="1.8" fill="#FFFFFF" fillOpacity="0.56" />
          </g>
        </g>

        {/* Layer 7: Inner white/silver refractive bevel hairline */}
        <circle
          cx="60"
          cy="60"
          r="46.2"
          stroke={`url(#${uid}-innerBevel)`}
          strokeWidth="1.15"
        />

        {/* Layer 8: Polished outer Fresnel white glass edge */}
        <circle
          cx="60"
          cy="60"
          r="49.4"
          stroke={`url(#${uid}-rimStroke)`}
          strokeWidth="1.7"
        />
      </svg>
    </div>
  );
});
