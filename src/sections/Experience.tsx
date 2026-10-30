import { useRef } from 'react';
import { m, useScroll, useSpring } from 'framer-motion';
import { CalendarDays, Check, MapPin } from 'lucide-react';
import { Reveal, SectionHeading, SpotlightCard } from '@/components/ui/primitives';
import { formatDuration, formatRange } from '@/lib/format';
import type { Experience as ExperienceType } from '@/types/content';

export function Experience({ items }: { items: ExperienceType[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  return (
    <section id="experience" className="section">
      <div className="container-x">
        <SectionHeading
          eyebrow="Career"
          title="Professional experience"
          description="Where I have been building and shipping enterprise software."
        />

        <div ref={ref} className="relative pl-9 sm:pl-12">
          <div className="absolute bottom-2 left-[11px] top-2 w-px bg-white/10 sm:left-[15px]" aria-hidden />
          <m.div
            className="absolute bottom-2 left-[11px] top-2 w-px origin-top bg-gradient-to-b from-gold-300 via-gold-500 to-gold-600 sm:left-[15px]"
            style={{ scaleY }}
            aria-hidden
          />

          <ol className="space-y-10">
            {items.map((exp, i) => (
              <li key={exp.id} className="relative">
                <span
                  className={`absolute -left-9 top-6 flex h-6 w-6 items-center justify-center rounded-full border-2 sm:-left-12 sm:h-8 sm:w-8 ${
                    exp.is_current
                      ? 'border-gold-300 bg-ink-900 shadow-glow-sm'
                      : 'border-gold-600/70 bg-ink-900'
                  }`}
                  aria-hidden
                >
                  <span
                    className={`h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5 ${
                      exp.is_current ? 'animate-pulse-glow bg-gold-300' : 'bg-gold-600'
                    }`}
                  />
                </span>

                <Reveal delay={i * 0.05}>
                  <SpotlightCard as="div" className="p-6 transition duration-300 hover:border-gold-400/40 sm:p-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-xl font-semibold sm:text-2xl">{exp.role}</h3>
                        <p className="mt-1 text-lg font-medium text-gold-300">{exp.company}</p>
                        {exp.location && (
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                            <MapPin className="h-3.5 w-3.5" aria-hidden /> {exp.location}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col gap-1 sm:items-end">
                        <span className="chip gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                          {formatRange(exp.start_date, exp.end_date, exp.is_current)}
                        </span>
                        <span className="text-xs text-muted">
                          {formatDuration(exp.start_date, exp.end_date, exp.is_current)}
                          {exp.is_current && ' · current'}
                        </span>
                      </div>
                    </div>

                    {exp.summary && <p className="mt-5 leading-relaxed text-parchment-100">{exp.summary}</p>}

                    {exp.highlights.length > 0 && (
                      <ul className="mt-5 space-y-3">
                        {exp.highlights.map((item, hi) => (
                          <li key={hi} className="flex gap-3 text-sm leading-relaxed text-muted sm:text-base">
                            <Check className="mt-1 h-4 w-4 shrink-0 text-gold-400" aria-hidden />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {exp.tech.length > 0 && (
                      <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technologies used">
                        {exp.tech.map((t) => (
                          <li key={t} className="chip">
                            {t}
                          </li>
                        ))}
                      </ul>
                    )}
                  </SpotlightCard>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
