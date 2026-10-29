import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

interface Star {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
}
interface Ember {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  phase: number;
}
interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
}

/** Fixed starfield with drifting embers and a subtle wand-spark trail. Static when reduced motion is on. */
export function MagicCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let stars: Star[] = [];
    let embers: Ember[] = [];
    const sparks: Spark[] = [];
    const fine = window.matchMedia('(pointer: fine)').matches;

    const seed = () => {
      const small = w < 700;
      const starCount = Math.min(small ? 45 : 90, Math.floor((w * h) / 16000));
      stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.2 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 1.4 + 0.4,
      }));
      embers = Array.from({ length: small ? 8 : 16 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.8,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -(Math.random() * 0.22 + 0.06),
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      draw(performance.now());
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const time = t / 1000;

      for (const s of stars) {
        const a = reduced ? 0.55 : 0.35 + 0.45 * Math.sin(time * s.speed + s.phase);
        ctx.fillStyle = `rgba(244, 227, 168, ${Math.max(0.08, a)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const e of embers) {
        if (!reduced) {
          e.x += e.vx + Math.sin(time * 0.6 + e.phase) * 0.1;
          e.y += e.vy;
          if (e.y < -10) {
            e.y = h + 10;
            e.x = Math.random() * w;
          }
        }
        const a = 0.35 + 0.3 * Math.sin(time * 1.2 + e.phase);
        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 5);
        g.addColorStop(0, `rgba(255, 214, 107, ${a})`);
        g.addColorStop(1, 'rgba(255, 214, 107, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * 5, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.life -= 1;
        if (p.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02;
        const a = p.life / p.max;
        ctx.fillStyle = `rgba(255, 232, 150, ${a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.4 * a + 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (t - last < 33) return; // ~30fps is plenty for a background
      last = t;
      draw(t);
    };

    let lastSpawn = 0;
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastSpawn < 40) return;
      lastSpawn = now;
      sparks.push({
        x: e.clientX,
        y: e.clientY,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.7) * 0.8,
        life: 28,
        max: 28,
      });
      if (sparks.length > 40) sparks.shift();
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduced) raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener('resize', resize);
    if (!reduced) {
      raf = requestAnimationFrame(loop);
      document.addEventListener('visibilitychange', onVisibility);
      if (fine) window.addEventListener('pointermove', onMove, { passive: true });
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reduced]);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-0 h-full w-full" aria-hidden />;
}
