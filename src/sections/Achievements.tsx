import { ArrowUpRight } from 'lucide-react';
import { Reveal, SectionHeading, SpotlightCard } from '@/components/ui/primitives';
import { achievementIcon } from '@/lib/icons';
import { safeUrl } from '@/lib/url';
import type { Achievement } from '@/types/content';

export function Achievements({ items }: { items: Achievement[] }) {
  return (
    <section id="achievements" className="section">
      <div className="container-x">
        <SectionHeading
          eyebrow="Highlights"
          title="Achievements"
          description="Verified highlights from my coding practice and career so far."
        />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const Icon = achievementIcon(item.platform);
            const url = safeUrl(item.url);
            return (
              <li key={item.id}>
                <Reveal delay={i * 0.07} className="h-full">
                  <SpotlightCard
                    as="div"
                    className="group flex h-full flex-col p-6 transition duration-300 hover:-translate-y-1.5 hover:border-gold-400/50"
                  >
                    <div className="mb-5 flex items-start justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold-500/30 bg-gold-500/10 text-gold-200">
                        <Icon className="h-6 w-6" aria-hidden />
                      </span>
                      {item.platform && (
                        <span className="text-xs uppercase tracking-[0.16em] text-muted">{item.platform}</span>
                      )}
                    </div>
                    {item.metric && (
                      <p className="text-4xl font-bold text-gradient">{item.metric}</p>
                    )}
                    <h3 className={`font-semibold ${item.metric ? 'mt-1 text-base' : 'text-lg'}`}>{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto inline-flex items-center gap-1 pt-4 text-sm text-gold-300 underline-offset-4 hover:underline"
                      >
                        View <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                        <span className="sr-only"> {item.title} (opens in a new tab)</span>
                      </a>
                    )}
                  </SpotlightCard>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
