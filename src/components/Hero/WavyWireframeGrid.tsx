import { useEffect, useRef, type MutableRefObject } from 'react';
import styles from './WavyWireframeGrid.module.css';

interface WavyWireframeGridProps {
  theme: 'dark' | 'light';
  /** Pauses the 60fps canvas grid while the expanded technical skills window covers the hero */
  pausedRef?: MutableRefObject<boolean>;
}

/**
 * Faithfully recreates 109ichiki's undulating Canvas 2D wireframe grid
 * ([data-js="grid"][data-outline="true"]) behind the hero masking composition.
 */
export function WavyWireframeGrid({ theme, pausedRef }: WavyWireframeGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let rafId = 0;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let wireColor = 'rgba(164, 164, 164, 0.32)';

    const readColor = () => {
      const cs = getComputedStyle(document.documentElement);
      wireColor = cs.getPropertyValue('--color-grid-wire').trim() || 'rgba(164, 164, 164, 0.32)';
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      readColor();
    };

    const draw = (timeSec: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const cols = 14;
      const rows = 10;
      const pad = 12;
      const innerW = width - pad * 2;
      const innerH = height - pad * 2;
      const amp = reducedMotion.matches ? 0 : 7.5;

      const pt = (u: number, v: number): [number, number] => {
        const bx = pad + u * innerW;
        const by = pad + v * innerH;
        const dx = Math.sin(v * Math.PI * 2.2 + timeSec * 0.9 + u * 2.4) * amp;
        const dy = Math.cos(u * Math.PI * 2.1 + timeSec * 0.75 + v * 2.0) * amp;
        return [bx + dx, by + dy];
      };

      ctx.strokeStyle = wireColor;
      ctx.lineWidth = 1;

      // Vertical wavy lines
      for (let c = 0; c <= cols; c++) {
        const u = c / cols;
        ctx.beginPath();
        const segs = 28;
        for (let s = 0; s <= segs; s++) {
          const [x, y] = pt(u, s / segs);
          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Horizontal wavy lines
      for (let r = 0; r <= rows; r++) {
        const v = r / rows;
        ctx.beginPath();
        const segs = 28;
        for (let s = 0; s <= segs; s++) {
          const [x, y] = pt(s / segs, v);
          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    const observer = new ResizeObserver(() => {
      resize();
      if (reducedMotion.matches) draw(0);
    });
    observer.observe(canvas);
    resize();

    if (reducedMotion.matches) {
      draw(0);
      return () => observer.disconnect();
    }

    const loop = (now: number) => {
      if (!document.hidden && !pausedRef?.current) {
        draw(now / 1000);
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [theme, pausedRef]);

  return <canvas ref={canvasRef} className={styles.grid} aria-hidden="true" />;
}
