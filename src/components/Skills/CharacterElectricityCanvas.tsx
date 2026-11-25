import { useEffect, useRef, type MutableRefObject, type RefObject } from 'react';
import type { OrbitalCameraState } from './SkillOrbitalSystem';

interface CharacterElectricityCanvasProps {
  /** Ref to the character stage element (kept for compatibility) */
  characterStageRef: RefObject<HTMLDivElement | null>;
  /** Shared entrance-driven energy intensity [0..1] (zero React re-renders) */
  energyLevelRef: MutableRefObject<number>;
  /** Shared 3D parallax camera state so projection never calls getBoundingClientRect() at 60fps */
  cameraRef: MutableRefObject<OrbitalCameraState>;
  className?: string;
}

const CHAR_NAT_W = 1672;
const CHAR_NAT_H = 941;

interface BodyAnchor {
  x: number;
  y: number;
  /** Preferred outward discharge direction pointing away from silhouette */
  nx: number;
  ny: number;
  zone: 'shoulder' | 'arm' | 'hand' | 'torso' | 'leg' | 'hair';
}

/**
 * Verified anatomical emitter nodes mapped directly to `assets/skills-character.png` (1672 x 941).
 * Face oval (cx=840, cy=114, rx=98, ry=78) is strictly excluded so lightning never obscures his face.
 */
const BODY_ANCHORS: BodyAnchor[] = [
  // 0..3: Shoulders & collar
  { x: 682, y: 222, nx: -0.65, ny: -0.76, zone: 'shoulder' },
  { x: 622, y: 278, nx: -0.74, ny: -0.67, zone: 'shoulder' },
  { x: 954, y: 226, nx: 0.65, ny: -0.76, zone: 'shoulder' },
  { x: 1020, y: 284, nx: 0.74, ny: -0.67, zone: 'shoulder' },
  // 4..7: Left upper arm & forearm
  { x: 556, y: 312, nx: -0.45, ny: -0.89, zone: 'arm' },
  { x: 486, y: 348, nx: -0.35, ny: -0.94, zone: 'arm' },
  { x: 416, y: 374, nx: -0.32, ny: 0.95, zone: 'arm' },
  { x: 342, y: 386, nx: -0.52, ny: -0.85, zone: 'arm' },
  // 8..10: Left outstretched gloved hand
  { x: 262, y: 376, nx: -0.85, ny: -0.52, zone: 'hand' },
  { x: 204, y: 342, nx: -0.78, ny: -0.62, zone: 'hand' },
  { x: 146, y: 368, nx: -0.96, ny: -0.25, zone: 'hand' },
  // 11..14: Right upper arm & forearm
  { x: 1094, y: 324, nx: 0.45, ny: -0.89, zone: 'arm' },
  { x: 1170, y: 356, nx: 0.35, ny: -0.94, zone: 'arm' },
  { x: 1246, y: 378, nx: 0.32, ny: 0.95, zone: 'arm' },
  { x: 1326, y: 392, nx: 0.52, ny: -0.85, zone: 'arm' },
  // 15..17: Right outstretched gloved hand
  { x: 1412, y: 382, nx: 0.85, ny: -0.52, zone: 'hand' },
  { x: 1472, y: 344, nx: 0.78, ny: -0.62, zone: 'hand' },
  { x: 1532, y: 374, nx: 0.96, ny: -0.25, zone: 'hand' },
  // 18..24: Torso, chest & belt core
  { x: 792, y: 288, nx: -0.45, ny: -0.45, zone: 'torso' },
  { x: 878, y: 306, nx: 0.45, ny: -0.45, zone: 'torso' },
  { x: 814, y: 412, nx: -0.65, ny: 0.08, zone: 'torso' },
  { x: 888, y: 454, nx: 0.65, ny: 0.08, zone: 'torso' },
  { x: 778, y: 562, nx: -0.72, ny: 0.18, zone: 'torso' },
  { x: 848, y: 558, nx: 0.18, ny: 0.3, zone: 'torso' },
  { x: 916, y: 582, nx: 0.72, ny: 0.18, zone: 'torso' },
  // 25..33: Thighs, lower legs & flowing coat hems
  { x: 734, y: 676, nx: -0.84, ny: 0.2, zone: 'leg' },
  { x: 808, y: 736, nx: -0.38, ny: 0.42, zone: 'leg' },
  { x: 896, y: 726, nx: 0.38, ny: 0.42, zone: 'leg' },
  { x: 966, y: 688, nx: 0.84, ny: 0.2, zone: 'leg' },
  { x: 718, y: 836, nx: -0.8, ny: 0.08, zone: 'leg' },
  { x: 832, y: 868, nx: -0.2, ny: 0.25, zone: 'leg' },
  { x: 954, y: 856, nx: 0.8, ny: 0.08, zone: 'leg' },
  { x: 564, y: 766, nx: -0.94, ny: -0.22, zone: 'leg' },
  { x: 1138, y: 748, nx: 0.94, ny: -0.22, zone: 'leg' },
  // 34..36: Outer hair perimeter (strictly outside face oval)
  { x: 752, y: 54, nx: -0.76, ny: -0.65, zone: 'hair' },
  { x: 834, y: 16, nx: 0.05, ny: -1.0, zone: 'hair' },
  { x: 914, y: 64, nx: 0.78, ny: -0.62, zone: 'hair' },
];

// Multi-hop anatomical crawl chains so lightning visibly races along limbs, torso & legs
const CRAWL_CHAINS: number[][] = [
  [18, 0, 4, 6, 8, 10], // chest -> left shoulder -> left sleeve -> left hand
  [1, 5, 7, 9], // left shoulder -> forearm -> fingers
  [19, 2, 11, 13, 15, 17], // chest -> right shoulder -> right sleeve -> right hand
  [3, 12, 14, 16], // right shoulder -> forearm -> fingers
  [0, 18, 20, 22, 25, 29], // left collar -> torso -> left thigh -> lower leg
  [2, 19, 21, 24, 28, 31], // right collar -> torso -> right thigh -> lower leg
  [18, 19, 21, 23, 22, 20], // chest-to-belt plasma loop
  [22, 25, 32], // belt -> left coat wing
  [24, 28, 33], // belt -> right coat wing
  [5, 1, 18, 23, 26, 30], // diagonal arm -> torso -> leg surge
  [12, 3, 19, 23, 27, 31], // diagonal right arm -> torso -> leg surge
  [34, 0, 1, 4], // outer hair spike -> left collar -> arm
  [36, 2, 3, 11], // outer hair spike -> right collar -> arm
];

interface Vec2 {
  x: number;
  y: number;
}

interface BoltBranch {
  /** Base points in 1672x941 character space */
  points: Vec2[];
  /** Live micro-jittered display points refreshed periodically for crackling plasma motion */
  livePoints: Vec2[];
  thickness: number;
  brightness: number;
  depth: number;
  /** Fraction along parent trunk where this branch spawns [0..1] */
  startFrac: number;
}

interface SurfaceGlow {
  x: number;
  y: number;
  radius: number;
  intensity: number;
}

interface LightningBolt {
  branches: BoltBranch[];
  flashes: SurfaceGlow[];
  surfaceGlows: SurfaceGlow[];
  age: number;
  life: number;
  afterglowLife: number;
  kind: 'crawl' | 'outward' | 'burst';
  flickerSeed: number;
  rejitterTimer: number;
  /** Propagation speed for crawling arcs (0..1 reaches full length quickly) */
  growDuration: number;
}

interface ElectricSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  length: number;
  jagged: number;
  brightness: number;
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function isInsideFaceZone(x: number, y: number): boolean {
  const dx = (x - 840) / 100;
  const dy = (y - 114) / 78;
  return dx * dx + dy * dy < 1.0;
}

function pushOutOfFace(pt: Vec2): Vec2 {
  if (!isInsideFaceZone(pt.x, pt.y)) return pt;
  const fx = pt.x - 840;
  const fy = pt.y - 114;
  const fl = Math.hypot(fx, fy) || 1;
  return {
    x: 840 + (fx / fl) * 106,
    y: 114 + (fy / fl) * 84,
  };
}

/**
 * Fractal midpoint-displacement polyline for sharp, irregular Killua-Godspeed lightning.
 */
function buildLightningPath(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  subdivisions: number,
  jaggedness: number
): Vec2[] {
  let pts: Vec2[] = [
    { x: x0, y: y0 },
    { x: x1, y: y1 },
  ];

  let disp = Math.hypot(x1 - x0, y1 - y0) * jaggedness;
  for (let s = 0; s < subdivisions; s++) {
    const next: Vec2[] = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const mx = (a.x + b.x) * 0.5;
      const my = (a.y + b.y) * 0.5;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const offset = (Math.random() - 0.5) * 2 * disp;
      const displaced = pushOutOfFace({
        x: mx + (-dy / len) * offset,
        y: my + (dx / len) * offset,
      });
      next.push(displaced, b);
    }
    pts = next;
    disp *= 0.54;
  }

  return pts;
}

function jitterPoints(base: Vec2[], amp: number): Vec2[] {
  return base.map((p, idx) => {
    if (idx === 0 || idx === base.length - 1) return p;
    return pushOutOfFace({
      x: p.x + (Math.random() - 0.5) * 2 * amp,
      y: p.y + (Math.random() - 0.5) * 2 * amp,
    });
  });
}

/**
 * Multi-segment electrical arc crawling directly across the character's shoulders,
 * sleeves, hands, torso, thighs, and legs — with localized monochrome clothing illumination.
 */
function spawnCrawlBolt(strong: boolean): LightningBolt {
  const chain = CRAWL_CHAINS[Math.floor(Math.random() * CRAWL_CHAINS.length)];
  const reverse = Math.random() < 0.5;
  const ordered = reverse ? [...chain].reverse() : chain;

  // Pick a compact 1-to-2-node contiguous sub-segment along the limb/body chain
  const hops = Math.min(ordered.length - 1, strong && Math.random() < 0.55 ? 2 : 1);
  const startIdx = Math.floor(rand(0, ordered.length - hops));
  const subNodes = ordered.slice(startIdx, startIdx + hops + 1);

  const trunk: Vec2[] = [];
  const flashes: SurfaceGlow[] = [];
  const surfaceGlows: SurfaceGlow[] = [];

  for (let i = 0; i < subNodes.length - 1; i++) {
    const a = BODY_ANCHORS[subNodes[i]];
    const b = BODY_ANCHORS[subNodes[i + 1]];
    const ax = a.x + rand(-10, 10);
    const ay = a.y + rand(-10, 10);
    const bx = b.x + rand(-10, 10);
    const by = b.y + rand(-10, 10);
    const seg = buildLightningPath(ax, ay, bx, by, 3, strong ? 0.2 : 0.17);
    if (i > 0) seg.shift();
    trunk.push(...seg);

    // Very restrained monochrome bounce hint on nearby fabric
    surfaceGlows.push({
      x: (ax + bx) * 0.5,
      y: (ay + by) * 0.5,
      radius: strong ? rand(38, 58) : rand(26, 44),
      intensity: strong ? 0.1 : 0.06,
    });
  }

  const first = trunk[0];
  const last = trunk[trunk.length - 1];
  flashes.push(
    { x: first.x, y: first.y, radius: strong ? rand(4, 7) : rand(2.5, 5), intensity: strong ? 0.58 : 0.4 },
    { x: last.x, y: last.y, radius: strong ? rand(3.5, 6) : rand(2.5, 4.5), intensity: strong ? 0.52 : 0.36 }
  );

  const branches: BoltBranch[] = [
    {
      points: trunk,
      livePoints: trunk,
      thickness: strong ? rand(1.3, 1.8) : rand(0.95, 1.35),
      brightness: strong ? rand(0.86, 0.98) : rand(0.74, 0.9),
      depth: 0,
      startFrac: 0,
    },
  ];

  // Add 1 small hairline tendril peeling off the crawling arc
  const forkCount = strong ? (Math.random() < 0.75 ? 2 : 1) : Math.random() < 0.55 ? 1 : 0;
  for (let f = 0; f < forkCount; f++) {
    const frac = rand(0.22, 0.78);
    const idx = Math.floor(frac * (trunk.length - 1));
    const origin = trunk[idx];
    const nextPt = trunk[Math.min(trunk.length - 1, idx + 1)];
    const dir = Math.atan2(nextPt.y - origin.y, nextPt.x - origin.x) + (Math.random() < 0.5 ? 1 : -1) * rand(0.45, 1.15);
    const len = rand(24, strong ? 64 : 42);
    const pts = buildLightningPath(
      origin.x,
      origin.y,
      origin.x + Math.cos(dir) * len,
      origin.y + Math.sin(dir) * len,
      2,
      0.24
    );
    branches.push({
      points: pts,
      livePoints: pts,
      thickness: rand(0.65, 1.05),
      brightness: rand(0.65, 0.85),
      depth: 1,
      startFrac: frac,
    });
    flashes.push({ x: origin.x, y: origin.y, radius: rand(3.2, 5.8), intensity: 0.62 });
  }

  const life = strong ? rand(0.2, 0.3) : rand(0.14, 0.23);
  return {
    branches,
    flashes,
    surfaceGlows,
    age: 0,
    life,
    afterglowLife: strong ? 0.12 : 0.07,
    kind: 'crawl',
    flickerSeed: Math.random() * 100,
    rejitterTimer: 0.045,
    growDuration: life * 0.24,
  };
}

/**
 * Compact, subtle outward micro-discharges crackling just off shoulders, arms,
 * hands, torso, and legs — leaving surrounding space clean for the skill orbs.
 */
function spawnOutwardBolt(isBurst: boolean): LightningBolt {
  const anchor = BODY_ANCHORS[Math.floor(Math.random() * BODY_ANCHORS.length)];
  const x0 = anchor.x + rand(-10, 10);
  const y0 = anchor.y + rand(-10, 10);

  const baseAngle = Math.atan2(anchor.ny, anchor.nx) + rand(-0.65, 0.65);
  const dist = isBurst ? rand(95, 165) : rand(45, 105);
  const x1 = x0 + Math.cos(baseAngle) * dist;
  const y1 = y0 + Math.sin(baseAngle) * dist;

  const trunk = buildLightningPath(x0, y0, x1, y1, isBurst ? 4 : 3, isBurst ? 0.24 : 0.22);
  const branches: BoltBranch[] = [
    {
      points: trunk,
      livePoints: trunk,
      thickness: isBurst ? rand(1.35, 1.85) : rand(0.95, 1.4),
      brightness: isBurst ? rand(0.88, 1.0) : rand(0.75, 0.92),
      depth: 0,
      startFrac: 0,
    },
  ];

  const flashes: SurfaceGlow[] = [
    { x: x0, y: y0, radius: isBurst ? rand(6, 10) : rand(4, 7), intensity: isBurst ? 0.78 : 0.56 },
  ];

  const surfaceGlows: SurfaceGlow[] = [
    {
      x: x0,
      y: y0,
      radius: isBurst ? rand(48, 76) : rand(32, 52),
      intensity: isBurst ? 0.15 : 0.09,
    },
  ];

  const primaryForks = isBurst ? Math.floor(rand(1, 3)) : Math.random() < 0.65 ? 1 : 0;
  for (let f = 0; f < primaryForks; f++) {
    const frac = rand(0.22, 0.78);
    const idx = Math.floor(frac * (trunk.length - 1));
    const origin = trunk[idx];
    const forkAngle = baseAngle + (Math.random() < 0.5 ? 1 : -1) * rand(0.35, 0.9);
    const forkLen = dist * rand(0.3, 0.52);
    const forkPath = buildLightningPath(
      origin.x,
      origin.y,
      origin.x + Math.cos(forkAngle) * forkLen,
      origin.y + Math.sin(forkAngle) * forkLen,
      2,
      0.26
    );

    branches.push({
      points: forkPath,
      livePoints: forkPath,
      thickness: isBurst ? rand(0.75, 1.1) : rand(0.6, 0.92),
      brightness: rand(0.64, 0.86),
      depth: 1,
      startFrac: frac,
    });
    flashes.push({
      x: origin.x,
      y: origin.y,
      radius: isBurst ? rand(3.5, 6.5) : rand(2.5, 4.5),
      intensity: isBurst ? 0.66 : 0.5,
    });
  }

  const life = isBurst ? rand(0.19, 0.28) : rand(0.13, 0.22);
  return {
    branches,
    flashes,
    surfaceGlows,
    age: 0,
    life,
    afterglowLife: isBurst ? 0.11 : 0.06,
    kind: isBurst ? 'burst' : 'outward',
    flickerSeed: Math.random() * 100,
    rejitterTimer: 0.045,
    growDuration: life * 0.22,
  };
}

function spawnSpark(burst: boolean): ElectricSpark {
  const anchor = BODY_ANCHORS[Math.floor(Math.random() * BODY_ANCHORS.length)];
  const alongBody = Math.random() < 0.55;
  const speed = burst ? rand(240, 460) : rand(160, 340);
  const angle = alongBody
    ? Math.atan2(anchor.ny, anchor.nx) + (Math.random() < 0.5 ? Math.PI * 0.5 : -Math.PI * 0.5) + rand(-0.35, 0.35)
    : Math.atan2(anchor.ny, anchor.nx) + rand(-0.7, 0.7);

  return {
    x: anchor.x + rand(-16, 16),
    y: anchor.y + rand(-14, 14),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    age: 0,
    life: rand(0.12, 0.24),
    length: rand(7, burst ? 16 : 12),
    jagged: rand(-5, 5),
    brightness: rand(0.55, 0.8),
  };
}

/**
 * High-energy procedural Canvas 2D Godspeed electrical discharge layer:
 * - Continuously active (never blank), with dynamic calm-simmer <-> high-voltage burst waves
 * - Crawling multi-node body arcs + far-reaching outward branching discharges + fast electric sparks
 * - Live plasma micro-jitter, tip break-apart dissipation, and subtle local monochrome clothing flashes
 * - Strictly monochrome white cores & silver-grey glow; zero React re-renders per frame
 */
export function CharacterElectricityCanvas({
  characterStageRef,
  energyLevelRef,
  cameraRef,
  className,
}: CharacterElectricityCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let rafId: number | null = null;
    let lastTime = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const bolts: LightningBolt[] = [];
    const sparks: ElectricSpark[] = [];

    let elapsed = 0;
    let burstTimer = rand(1.1, 2.4);
    let burstRemaining = 0;
    let crawlAccum = 0;
    let outwardAccum = 0;
    let sparkAccum = 0;

    const syncCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextW = Math.max(1, Math.round(rect.width));
      const nextH = Math.max(1, Math.round(rect.height));
      if (nextW !== width || nextH !== height) {
        width = nextW;
        height = nextH;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
    };

    const ro = new ResizeObserver(syncCanvasSize);
    ro.observe(canvas);
    syncCanvasSize();

    // Zero-reflow mathematical projection mapping 1672x941 character space onto canvas coordinates
    // using cached canvas size + live cameraRef offset (ZERO getBoundingClientRect() at 60fps!)
    const getCharacterProjection = () => {
      if (width < 10 || height < 10) return null;

      // Matches .characterParallax CSS breakpoints in CosmicSkillsScene.module.css
      const vw = window.innerWidth;
      const wFrac = vw <= 640 ? 0.94 : vw <= 960 ? 0.92 : 0.9;
      const hFrac = vw <= 640 ? 0.8 : vw <= 960 ? 0.82 : 0.85;
      const marginBottom = vw <= 640 ? -12 : vw <= 960 ? -14 : -18;

      const stageW = width * wFrac;
      const stageH = height * hFrac;

      const natAspect = CHAR_NAT_W / CHAR_NAT_H;
      const boxAspect = stageW / stageH;
      let paintedW: number;
      let paintedH: number;
      if (boxAspect > natAspect) {
        paintedH = stageH;
        paintedW = paintedH * natAspect;
      } else {
        paintedW = stageW;
        paintedH = paintedW / natAspect;
      }

      const { camX, camY, compactScale } = cameraRef.current;
      const fx = camX * 24 * compactScale;
      const fy = camY * 10 * compactScale;

      const originX = (width - paintedW) * 0.5 + fx;
      const originY = height - marginBottom - paintedH + fy;
      const scale = paintedW / CHAR_NAT_W;
      return { originX, originY, scale };
    };

    const drawPolyline = (
      pts: Vec2[],
      originX: number,
      originY: number,
      scale: number,
      maxFrac: number,
      fractureRatio: number,
      seed: number
    ) => {
      const limitIdx = Math.max(1, Math.floor((pts.length - 1) * Math.min(1, maxFrac)));
      ctx.beginPath();
      let penDown = false;
      for (let i = 0; i <= limitIdx; i++) {
        const progressAlong = i / Math.max(1, pts.length - 1);
        const dropSegment =
          fractureRatio > 0 &&
          progressAlong > 1 - fractureRatio * 0.85 &&
          Math.sin(i * 19.37 + seed) > 0.1 - fractureRatio * 0.65;

        const px = originX + pts[i].x * scale;
        const py = originY + pts[i].y * scale;
        if (dropSegment) {
          penDown = false;
        } else if (!penDown) {
          ctx.moveTo(px, py);
          penDown = true;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
    };

    const tick = (now: number) => {
      rafId = window.requestAnimationFrame(tick);

      if (document.hidden) {
        lastTime = now;
        return;
      }

      const dt = lastTime ? Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000)) : 1 / 60;
      lastTime = now;

      const energy = energyLevelRef.current;
      if (energy <= 0.015) {
        if (bolts.length > 0 || sparks.length > 0) {
          bolts.length = 0;
          sparks.length = 0;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, width, height);
        }
        return;
      }

      if (width < 2 || height < 2) {
        syncCanvasSize();
        if (width < 2 || height < 2) return;
      }

      const proj = getCharacterProjection();
      if (!proj) return;

      elapsed += dt;

      // Subtle calm-simmer <-> restrained pulse cadence (keeps focus firmly on the skill orbs)
      if (reducedMotion) {
        burstRemaining = 0;
      } else {
        if (burstRemaining > 0) {
          burstRemaining -= dt;
        } else {
          burstTimer -= dt;
          if (burstTimer <= 0) {
            burstRemaining = rand(0.35, 0.65);
            burstTimer = rand(3.5, 6.5);
            bolts.push(spawnOutwardBolt(true));
            bolts.push(spawnCrawlBolt(true));
            for (let k = 0; k < 3; k++) sparks.push(spawnSpark(true));
          }
        }
      }

      const isBursting = burstRemaining > 0;
      const organicWave = 0.55 + 0.18 * Math.sin(elapsed * 1.35) + 0.12 * Math.sin(elapsed * 2.9);
      const activity = (reducedMotion ? 0.22 : isBursting ? 0.95 : organicWave) * energy;

      // Subtle active floor (3-6 crisp fine arcs, keeping focus on the skill orbs)
      const minActiveBolts = reducedMotion ? 1 : isBursting ? 6 : 3;
      while (bolts.length < minActiveBolts && energy > 0.25) {
        bolts.push(Math.random() < 0.62 ? spawnCrawlBolt(isBursting) : spawnOutwardBolt(isBursting));
      }

      crawlAccum += dt * (isBursting ? 14 : 9) * activity;
      while (crawlAccum >= 1) {
        crawlAccum -= 1;
        if (bolts.length < 14) {
          bolts.push(spawnCrawlBolt(isBursting && Math.random() < 0.5));
        }
      }

      outwardAccum += dt * (isBursting ? 10 : 6.2) * activity;
      while (outwardAccum >= 1) {
        outwardAccum -= 1;
        if (bolts.length < 14) {
          bolts.push(spawnOutwardBolt(isBursting && Math.random() < 0.55));
        }
      }

      sparkAccum += dt * (isBursting ? 24 : 13) * activity;
      while (sparkAccum >= 1) {
        sparkAccum -= 1;
        if (sparks.length < 24) {
          sparks.push(spawnSpark(isBursting));
        }
      }

      // Render strictly monochrome white-hot cores + silver-grey glows (0 colour cast!)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'miter';

      const { originX, originY, scale } = proj;

      // Pass 0: Subtle localized monochrome bounce illumination on nearby clothing & surroundings
      ctx.globalCompositeOperation = 'lighter';
      for (const bolt of bolts) {
        if (bolt.age >= bolt.life) continue;
        const p = bolt.age / bolt.life;
        const env = Math.min(1, p * 6) * (1 - p * 0.8);
        for (const sg of bolt.surfaceGlows) {
          if (isInsideFaceZone(sg.x, sg.y)) continue;
          const gx = originX + sg.x * scale;
          const gy = originY + sg.y * scale;
          const gr = Math.max(20, sg.radius * scale);
          const ga = sg.intensity * env * energy;
          if (ga < 0.01) continue;
          const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
          grad.addColorStop(0, `rgba(245, 245, 245, ${ga.toFixed(3)})`);
          grad.addColorStop(0.45, `rgba(195, 195, 195, ${(ga * 0.42).toFixed(3)})`);
          grad.addColorStop(1, 'rgba(150, 150, 150, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(gx, gy, gr, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Pass 1: Update & render crawling + branching outward lightning bolts
      for (let i = bolts.length - 1; i >= 0; i--) {
        const bolt = bolts[i];
        bolt.age += dt;
        const totalLife = bolt.life + bolt.afterglowLife;
        if (bolt.age >= totalLife) {
          bolts.splice(i, 1);
          continue;
        }

        // Live high-voltage plasma micro-jitter every ~40ms so bolts actively writhe/crackle
        if (!reducedMotion && bolt.age < bolt.life) {
          bolt.rejitterTimer -= dt;
          if (bolt.rejitterTimer <= 0) {
            bolt.rejitterTimer = rand(0.032, 0.055);
            for (const br of bolt.branches) {
              br.livePoints = jitterPoints(br.points, br.depth === 0 ? 5.5 : 4.0);
            }
          }
        }

        const inAfterglow = bolt.age > bolt.life;
        const growFrac = Math.min(1, bolt.age / Math.max(0.01, bolt.growDuration));
        let masterAlpha: number;
        let fractureRatio = 0;

        if (!inAfterglow) {
          const p = bolt.age / bolt.life;
          const attack = Math.min(1, p * 9);
          const decay = p > 0.6 ? 1 - (p - 0.6) / 0.4 : 1;
          const flicker =
            reducedMotion
              ? 0.92
              : 0.64 + 0.36 * Math.sin(bolt.age * 132 + bolt.flickerSeed) * Math.cos(bolt.age * 59 + bolt.flickerSeed * 0.6);
          masterAlpha = attack * decay * Math.max(0.32, flicker) * energy;
          if (p > 0.64) {
            fractureRatio = (p - 0.64) / 0.36;
          }
        } else {
          const ap = (bolt.age - bolt.life) / Math.max(0.01, bolt.afterglowLife);
          masterAlpha = (1 - ap) * (1 - ap) * 0.26 * energy;
          fractureRatio = 0.6 + ap * 0.4;
        }

        if (masterAlpha < 0.015) continue;

        for (const br of bolt.branches) {
          if (growFrac < br.startFrac) continue;
          const branchGrow = Math.min(1, (growFrac - br.startFrac) / Math.max(0.15, 1 - br.startFrac));
          const a = masterAlpha * br.brightness;
          const baseW = Math.max(0.55, br.thickness * scale);
          const pts = br.livePoints;

          // Tier 1: Tight restrained silver-grey outer halo
          ctx.strokeStyle = `rgba(185, 185, 185, ${(a * (bolt.kind === 'burst' ? 0.2 : 0.15)).toFixed(3)})`;
          ctx.lineWidth = baseW * 3.4;
          drawPolyline(pts, originX, originY, scale, branchGrow, fractureRatio, bolt.flickerSeed + br.depth * 13);

          // Tier 2: Crisp fine silver sheath
          ctx.strokeStyle = `rgba(232, 232, 232, ${(a * 0.46).toFixed(3)})`;
          ctx.lineWidth = baseW * 1.85;
          drawPolyline(pts, originX, originY, scale, branchGrow, fractureRatio, bolt.flickerSeed + br.depth * 13);

          // Tier 3: Razor-fine bright white core
          if (!inAfterglow) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(0.96, a * 0.98).toFixed(3)})`;
            ctx.lineWidth = Math.max(0.75, baseW * 0.88);
            drawPolyline(pts, originX, originY, scale, branchGrow, fractureRatio, bolt.flickerSeed + br.depth * 13);
          }
        }

        // Bright pinpoint junction & emitter flashes where branches split/connect
        if (!inAfterglow && bolt.age < bolt.life * 0.72) {
          const flashFade = 1 - bolt.age / (bolt.life * 0.72);
          for (const fl of bolt.flashes) {
            const fx = originX + fl.x * scale;
            const fy = originY + fl.y * scale;
            const fr = Math.max(3, fl.radius * scale * (0.78 + 0.45 * flashFade));
            const fa = masterAlpha * fl.intensity * flashFade;
            const grad = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
            grad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, fa).toFixed(3)})`);
            grad.addColorStop(0.38, `rgba(225, 225, 225, ${(fa * 0.5).toFixed(3)})`);
            grad.addColorStop(1, 'rgba(180, 180, 180, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(fx, fy, fr, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Pass 2: Fast-moving jagged electric sparks travelling along the body & breaking away
      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        sp.age += dt;
        if (sp.age >= sp.life) {
          sparks.splice(i, 1);
          continue;
        }

        sp.vx += rand(-780, 780) * dt;
        sp.vy += rand(-780, 780) * dt;
        sp.x += sp.vx * dt;
        sp.y += sp.vy * dt;

        if (isInsideFaceZone(sp.x, sp.y)) continue;

        const p = sp.age / sp.life;
        const sa = (1 - p) * sp.brightness * energy;
        const speed = Math.hypot(sp.vx, sp.vy) || 1;
        const ux = sp.vx / speed;
        const uy = sp.vy / speed;

        const hx = originX + sp.x * scale;
        const hy = originY + sp.y * scale;
        const lenPx = Math.max(5, sp.length * scale * (1 - p * 0.4));
        const tx = hx - ux * lenPx;
        const ty = hy - uy * lenPx;
        const mx = (hx + tx) * 0.5 + -uy * sp.jagged * scale * 0.42;
        const my = (hy + ty) * 0.5 + ux * sp.jagged * scale * 0.42;

        ctx.strokeStyle = `rgba(205, 205, 205, ${(sa * 0.22).toFixed(3)})`;
        ctx.lineWidth = Math.max(1.2, 1.8 * scale);
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(mx, my);
        ctx.lineTo(hx, hy);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(0.82, sa * 0.78).toFixed(3)})`;
        ctx.lineWidth = Math.max(0.55, 0.85 * scale);
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(mx, my);
        ctx.lineTo(hx, hy);
        ctx.stroke();
      }

      ctx.globalCompositeOperation = 'source-over';
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      ro.disconnect();
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [characterStageRef, energyLevelRef, cameraRef]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      data-cosmic-electricity-canvas
      aria-hidden="true"
    />
  );
}
