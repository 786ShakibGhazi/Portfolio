import { useEffect, useState } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';

export function RotatingText({ words }: { words: string[] }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced || words.length < 2) return;
    const id = window.setInterval(() => setIndex((n) => (n + 1) % words.length), 2800);
    return () => window.clearInterval(id);
  }, [reduced, words.length]);

  if (!words.length) return null;
  const current = words[index % words.length];

  return (
    <span className="inline-block align-baseline">
      <span className="sr-only">{words.join(', ')}</span>
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={current}
          aria-hidden
          className="inline-block font-display text-xl not-italic tracking-wide text-gold-gradient sm:text-2xl"
          initial={{ y: '55%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-55%', opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {current}
        </m.span>
      </AnimatePresence>
    </span>
  );
}
