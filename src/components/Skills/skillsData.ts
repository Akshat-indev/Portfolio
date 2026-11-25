export type SkillId =
  | 'html5'
  | 'css3'
  | 'javascript'
  | 'typescript'
  | 'react'
  | 'nextjs'
  | 'nodejs'
  | 'python'
  | 'cpp'
  | 'fastapi'
  | 'postgresql'
  | 'mongodb'
  | 'docker'
  | 'git';

export interface SkillDefinition {
  id: SkillId;
  name: string;
  /** Official logo brand colour (faint at rest, full vibrant colour when hovered/held) */
  brandColor: string;
  /** Subtle monochrome glass tone variation (pure pearl, crisp silver, frosted white) */
  monoTone: 'pearl' | 'silver' | 'frost';
  /** Subtle per-orb size variation for natural spatial rhythm */
  sizeFactor?: number;
}

export interface OrbitalConfig {
  /** Horizontal & vertical center of the circular orbit as fractions of container size */
  centerXFrac: number;
  centerYFrac: number;
  /** Orbit radius relative to container dimensions */
  radiusWidthFrac: number;
  radiusHeightFrac: number;
  /** 3D inclination around X axis (degrees) — creates perspective depth & foreground/background sweep */
  tiltXDeg: number;
  /** 3D yaw around Y axis (degrees) — angles the orbital plane diagonally around the character */
  tiltYDeg: number;
  /** Perspective camera focal length (px) */
  focalLength: number;
  /** Base glass sphere diameter (px) before perspective depth scaling */
  baseOrbSize: number;
  /** Starting angle on the circle (radians); -PI/2 starts first orb at upper apex */
  angleOffsetRad: number;
  /** Seconds per full 360° cruising orbital revolution */
  orbitPeriodSec: number;
}

/**
 * 14 core technical skills arranged evenly around one continuous 3D circular orbit.
 * Fully monochrome white/silver glowing 3D crystal glass spheres with luminous B&W symbols.
 */
export const TECHNICAL_SKILLS: SkillDefinition[] = [
  { id: 'react', name: 'React', brandColor: '#61DAFB', monoTone: 'frost', sizeFactor: 1.04 },
  { id: 'typescript', name: 'TypeScript', brandColor: '#3178C6', monoTone: 'pearl', sizeFactor: 1.0 },
  { id: 'python', name: 'Python', brandColor: '#3776AB', monoTone: 'silver', sizeFactor: 1.02 },
  { id: 'nextjs', name: 'Next.js', brandColor: '#FFFFFF', monoTone: 'frost', sizeFactor: 0.98 },
  { id: 'nodejs', name: 'Node.js', brandColor: '#68A063', monoTone: 'pearl', sizeFactor: 1.0 },
  { id: 'docker', name: 'Docker', brandColor: '#2496ED', monoTone: 'frost', sizeFactor: 1.0 },
  { id: 'postgresql', name: 'PostgreSQL', brandColor: '#4D86B5', monoTone: 'silver', sizeFactor: 0.96 },
  { id: 'mongodb', name: 'MongoDB', brandColor: '#47A248', monoTone: 'pearl', sizeFactor: 0.96 },
  { id: 'git', name: 'Git', brandColor: '#F05032', monoTone: 'silver', sizeFactor: 0.96 },
  { id: 'cpp', name: 'C++', brandColor: '#00599C', monoTone: 'pearl', sizeFactor: 0.98 },
  { id: 'css3', name: 'CSS3', brandColor: '#264DE4', monoTone: 'frost', sizeFactor: 0.98 },
  { id: 'html5', name: 'HTML5', brandColor: '#E34F26', monoTone: 'silver', sizeFactor: 1.0 },
  { id: 'javascript', name: 'JavaScript', brandColor: '#F7DF1E', monoTone: 'pearl', sizeFactor: 1.02 },
  { id: 'fastapi', name: 'FastAPI', brandColor: '#009688', monoTone: 'frost', sizeFactor: 1.02 },
];

export function getResponsiveOrbitalConfig(width: number, height: number): OrbitalConfig {
  // Mobile portrait: upper arc rises well above his head, back-left passes behind shoulder/arm,
  // front-bottom sweeps smoothly across his lower coat below his face
  if (width < 640) {
    return {
      centerXFrac: 0.5,
      centerYFrac: 0.67,
      radiusWidthFrac: 0.42,
      radiusHeightFrac: 0.34,
      tiltXDeg: 38,
      tiltYDeg: -22,
      focalLength: 820,
      baseOrbSize: Math.max(40, Math.min(48, Math.round(width * 0.122))),
      angleOffsetRad: -Math.PI / 2,
      orbitPeriodSec: 32,
    };
  }

  // Tablet / compact desktop
  if (width < 1024) {
    return {
      centerXFrac: 0.5,
      centerYFrac: 0.445,
      radiusWidthFrac: 0.4,
      radiusHeightFrac: 0.48,
      tiltXDeg: 45,
      tiltYDeg: -24,
      focalLength: 1260,
      baseOrbSize: Math.max(54, Math.min(68, Math.round(Math.min(width, height) * 0.084))),
      angleOffsetRad: -Math.PI / 2,
      orbitPeriodSec: 34,
    };
  }

  // Desktop: One sweeping continuous 3D circular orbit inclined behind & around the character.
  return {
    centerXFrac: 0.5,
    centerYFrac: 0.415,
    radiusWidthFrac: 0.355,
    radiusHeightFrac: 0.49,
    tiltXDeg: 47,
    tiltYDeg: -25,
    focalLength: 1480,
    baseOrbSize: Math.max(64, Math.min(76, Math.round(Math.min(width, height) * 0.08))),
    angleOffsetRad: -Math.PI / 2,
    orbitPeriodSec: 34,
  };
}
