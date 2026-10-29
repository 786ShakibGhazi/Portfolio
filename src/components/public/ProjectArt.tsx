import { useMemo } from 'react';

const PALETTES = [
  ['#7c1d1d', '#d4a634', '#1d1930'],
  ['#2a2542', '#e0b94f', '#9b1c24'],
  ['#0f3d3a', '#ecd07a', '#1d1930'],
  ['#3b1d5a', '#d4a634', '#7c1d1d'],
];

function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

/** Generated, deterministic cover art used when a project has no uploaded screenshot. */
export function ProjectArt({ title }: { title: string }) {
  const { palette, rotation, initial } = useMemo(() => {
    const h = hash(title);
    return { palette: PALETTES[h % PALETTES.length], rotation: (h % 40) - 20, initial: (title.trim()[0] ?? 'P').toUpperCase() };
  }, [title]);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${palette[2]} 0%, #0c0a14 60%)` }}
      role="img"
      aria-label={`Generated cover for ${title}`}
    >
      <div
        className="absolute -right-10 -top-16 h-64 w-64 rounded-full blur-3xl"
        style={{ background: palette[0], opacity: 0.7 }}
      />
      <div
        className="absolute -bottom-20 left-10 h-56 w-56 rounded-full blur-3xl"
        style={{ background: palette[1], opacity: 0.25 }}
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgb(255 255 255 / 0.07) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.07) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          transform: `rotate(${rotation / 4}deg) scale(1.2)`,
        }}
      />
      <div className="absolute left-4 top-3 flex gap-1.5" aria-hidden>
        <span className="h-2.5 w-2.5 rounded-full bg-crimson-500/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-gold-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
      </div>
      <span
        className="absolute inset-0 flex items-center justify-center font-display text-8xl font-bold sm:text-9xl"
        style={{ color: palette[1], opacity: 0.85, textShadow: `0 0 40px ${palette[1]}66` }}
        aria-hidden
      >
        {initial}
      </span>
    </div>
  );
}
