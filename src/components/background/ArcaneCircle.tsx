import { useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { m, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';

const MOON_OFFSETS = [10, 6, 2, -3, -8, -3, 2, 6];

function polar(radius: number, deg: number): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [200 + radius * Math.cos(rad), 200 + radius * Math.sin(rad)];
}

function Octagram({ r, className }: { r: number; className?: string }) {
  const square = (rot: number) =>
    [0, 90, 180, 270].map((d) => polar(r, d + rot).join(',')).join(' ');
  return (
    <g className={className} fill="none" stroke="currentColor" strokeWidth="1">
      <polygon points={square(0)} />
      <polygon points={square(45)} />
    </g>
  );
}

/** Original "arcane circle" artwork: moon-phase ring, runic ticks and a glowing core. */
export function ArcaneCircle({ initial }: { initial: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 80, damping: 18 });
  const sy = useSpring(py, { stiffness: 80, damping: 18 });
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end start'] });
  const scrollY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const y = useTransform([sy, scrollY], (v: number[]) => (reduced ? 0 : v[0] + v[1]));

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - rect.left) / rect.width - 0.5) * 18);
    py.set(((e.clientY - rect.top) / rect.height - 0.5) * 18);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div ref={wrapRef} onPointerMove={onMove} onPointerLeave={onLeave} className="relative mx-auto aspect-square w-full max-w-[440px]">
      <div className="absolute inset-[8%] rounded-full bg-gold-500/10 blur-3xl" aria-hidden />
      <div className="absolute inset-[24%] rounded-full bg-crimson-600/20 blur-3xl" aria-hidden />
      <m.div style={{ x: sx, y }} className="relative h-full w-full">
        <svg viewBox="0 0 400 400" className="h-full w-full text-gold-400" role="img" aria-label="Decorative arcane circle">
          <defs>
            <radialGradient id="core" cx="50%" cy="45%" r="60%">
              <stop offset="0" stopColor="#f4e3a8" stopOpacity="0.95" />
              <stop offset="0.55" stopColor="#d4a634" stopOpacity="0.55" />
              <stop offset="1" stopColor="#7c1d1d" stopOpacity="0.35" />
            </radialGradient>
            <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f4e3a8" />
              <stop offset="1" stopColor="#b0862a" />
            </linearGradient>
          </defs>

          <g className="origin-center animate-spin-slow" style={{ transformOrigin: '200px 200px' }}>
            <circle cx="200" cy="200" r="192" fill="none" stroke="url(#ring)" strokeOpacity="0.55" strokeWidth="1.2" />
            <circle cx="200" cy="200" r="182" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeDasharray="1.5 7" strokeWidth="2" />
            {Array.from({ length: 36 }, (_, i) => {
              const [x1, y1] = polar(192, i * 10);
              const [x2, y2] = polar(i % 3 === 0 ? 178 : 185, i * 10);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeOpacity={i % 3 === 0 ? 0.7 : 0.35} />;
            })}
          </g>

          <g className="animate-spin-reverse" style={{ transformOrigin: '200px 200px' }}>
            <circle cx="200" cy="200" r="150" fill="none" stroke="url(#ring)" strokeOpacity="0.6" strokeWidth="1.2" />
            {MOON_OFFSETS.map((offset, i) => {
              const [cx, cy] = polar(150, i * 45);
              return (
                <g key={i}>
                  <circle cx={cx} cy={cy} r="12" fill="#0c0a14" stroke="#d4a634" strokeOpacity="0.8" />
                  <clipPath id={`moon-${i}`}>
                    <circle cx={cx} cy={cy} r="10" />
                  </clipPath>
                  <g clipPath={`url(#moon-${i})`}>
                    <circle cx={cx} cy={cy} r="10" fill="#f4e3a8" />
                    <circle cx={cx + offset} cy={cy} r="9" fill="#0c0a14" />
                  </g>
                </g>
              );
            })}
          </g>

          <g className="animate-spin-slower" style={{ transformOrigin: '200px 200px' }}>
            <circle cx="200" cy="200" r="112" fill="none" stroke="#c1272d" strokeOpacity="0.55" strokeWidth="1.2" />
            <circle cx="200" cy="200" r="104" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeDasharray="10 6 2 6" />
            <Octagram r={100} className="text-gold-300/70" />
          </g>

          <circle cx="200" cy="200" r="58" fill="url(#core)" />
          <circle cx="200" cy="200" r="58" fill="none" stroke="url(#ring)" strokeWidth="1.5" />
          <text
            x="200"
            y="216"
            textAnchor="middle"
            fontSize="52"
            fontFamily="Cinzel, serif"
            fontWeight="700"
            fill="#0c0a14"
          >
            {initial}
          </text>
        </svg>

        {/* Orbiting golden orb with fluttering wings */}
        <div className="pointer-events-none absolute inset-0 animate-spin-slower [animation-duration:18s]" aria-hidden>
          <div className="absolute left-1/2 top-[3%] -translate-x-1/2">
            <div className="relative flex items-center">
              <span className="h-3 w-5 origin-right animate-flutter rounded-[100%_0_100%_0] bg-gradient-to-l from-gold-200/90 to-transparent" />
              <span className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-gold-200 to-gold-500 shadow-glow-sm" />
              <span className="h-3 w-5 origin-left animate-flutter rounded-[0_100%_0_100%] bg-gradient-to-r from-gold-200/90 to-transparent" />
            </div>
          </div>
        </div>
      </m.div>
    </div>
  );
}
