import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';

/** Counts up numeric prefixes such as "200+" or "8.6" once visible; other values render as-is. */
export function CountUp({ value }: { value: string }) {
  const match = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const decimals = match ? (match[1].split('.')[1] ?? '').length : 0;
  const [display, setDisplay] = useState(() => (match && !reduced ? (0).toFixed(decimals) : match?.[1] ?? ''));

  useEffect(() => {
    if (!match || !inView || reduced) return;
    const controls = animate(0, parseFloat(match[1]), {
      duration: 1.6,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced, value]);

  if (!match) return <span>{value}</span>;
  return (
    <span ref={ref}>
      {display}
      {match[2]}
    </span>
  );
}
