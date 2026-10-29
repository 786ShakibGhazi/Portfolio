import { useRef, type ReactNode } from 'react';
import { m, type HTMLMotionProps } from 'framer-motion';
import { EASE } from '@/lib/motion';
import { useSpotlight } from '@/hooks/useSpotlight';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-white/[0.06] ${className}`}
      aria-hidden
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-10 text-muted">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-gold-500/30 border-t-gold-300" aria-hidden />
      <span className="text-sm">{label}…</span>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gold-500/25 bg-white/[0.02] px-6 py-12 text-center">
      {icon && <div className="text-gold-400">{icon}</div>}
      <p className="font-display text-base text-parchment-50">{title}</p>
      {hint && <p className="max-w-md text-sm text-muted">{hint}</p>}
      {action}
    </div>
  );
}

interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'initial' | 'whileInView' | 'viewport'> {
  delay?: number;
  y?: number;
}

/** Scroll-triggered entrance. Transforms are disabled automatically for reduced-motion users. */
export function Reveal({ delay = 0, y = 24, children, ...rest }: RevealProps) {
  return (
    <m.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </m.div>
  );
}

export function SpotlightCard({
  children,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'article' | 'li';
}) {
  const ref = useRef<HTMLDivElement>(null);
  useSpotlight(ref);
  const Component = Tag as 'div';
  return (
    <Component ref={ref} className={`spotlight glass rounded-2xl ${className}`}>
      {children}
    </Component>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}) {
  const center = align === 'center';
  return (
    <Reveal className={`mb-12 max-w-2xl sm:mb-14 ${center ? 'mx-auto text-center' : ''}`}>
      <p
        className={`mb-3 flex items-center gap-3 font-serif text-lg italic text-gold-300 ${center ? 'justify-center' : ''}`}
      >
        <span className="h-px w-8 bg-gradient-to-r from-transparent to-gold-400/70" aria-hidden />
        {eyebrow}
        {center && <span className="h-px w-8 bg-gradient-to-l from-transparent to-gold-400/70" aria-hidden />}
      </p>
      <h2 className="text-3xl font-semibold sm:text-4xl lg:text-5xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{description}</p>}
    </Reveal>
  );
}
