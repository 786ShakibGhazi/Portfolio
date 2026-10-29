const CANDLES = [
  { left: '5%', top: 8, h: 46, delay: '0s', hideSm: false },
  { left: '14%', top: 40, h: 62, delay: '-1.4s', hideSm: true },
  { left: '26%', top: 4, h: 54, delay: '-3s', hideSm: false },
  { left: '38%', top: 52, h: 40, delay: '-2.2s', hideSm: true },
  { left: '51%', top: 10, h: 66, delay: '-4.1s', hideSm: false },
  { left: '63%', top: 46, h: 48, delay: '-0.8s', hideSm: true },
  { left: '74%', top: 6, h: 58, delay: '-5s', hideSm: false },
  { left: '86%', top: 38, h: 44, delay: '-2.8s', hideSm: true },
  { left: '94%', top: 12, h: 52, delay: '-3.6s', hideSm: false },
];

/** Decorative floating candles for the hero. Pure CSS, hidden from assistive tech. */
export function FloatingCandles() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-14 h-44 overflow-hidden [mask-image:linear-gradient(to_bottom,#000_55%,transparent)] sm:h-72"
      aria-hidden
    >
      {CANDLES.map((c, i) => (
        <div
          key={i}
          className={`absolute animate-float ${c.hideSm ? 'hidden sm:block' : ''}`}
          style={{ left: c.left, top: c.top, animationDelay: c.delay, animationDuration: `${6 + (i % 4)}s` }}
        >
          <div className="relative flex origin-top scale-[0.6] flex-col items-center sm:scale-100">
            <div
              className="absolute -top-8 h-24 w-24 animate-pulse-glow rounded-full bg-gold-400/20 blur-2xl"
              style={{ animationDelay: c.delay }}
            />
            <div
              className="flame relative z-10 -mb-0.5 h-5 w-2.5 animate-flicker"
              style={{ animationDelay: c.delay }}
            />
            <div className="h-1 w-px bg-ink-950" />
            <div
              className="w-2.5 rounded-t-[2px] sm:w-3"
              style={{
                height: c.h,
                background: 'linear-gradient(90deg, #cdbd96 0%, #f3e8c8 45%, #b9a77c 100%)',
                boxShadow: 'inset 0 -10px 12px rgb(0 0 0 / 0.25)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
