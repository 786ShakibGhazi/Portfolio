import { Boxes, Layers, Mail, MapPin, Phone, Plug, ShieldCheck, Workflow } from 'lucide-react';
import { Reveal, SectionHeading, SpotlightCard } from '@/components/ui/primitives';
import { paragraphs } from '@/lib/text';
import { imageUrl, telHref } from '@/lib/url';
import type { PortfolioContent } from '@/types/content';

const ICONS = [Boxes, Workflow, Plug, Layers, ShieldCheck];

export function About({ content }: { content: PortfolioContent }) {
  const { profile } = content;
  const avatar = imageUrl(profile.avatar_path);
  const paras = paragraphs(profile.bio);

  return (
    <section id="about" className="section">
      <div className="container-x">
        <SectionHeading eyebrow="Introduction" title="About me" />
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          <Reveal className="space-y-5">
            {avatar && (
              <div className="mb-6 w-40 sm:w-48">
                <img
                  src={avatar}
                  alt={`Portrait of ${profile.full_name}`}
                  width={192}
                  height={192}
                  loading="lazy"
                  decoding="async"
                  className="aspect-square w-full rounded-2xl border border-white/10 object-cover shadow-glow"
                />
              </div>
            )}
            {paras.map((p, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? 'text-lg leading-relaxed text-parchment-50'
                    : 'leading-relaxed text-muted'
                }
              >
                {p}
              </p>
            ))}
            <ul className="flex flex-wrap gap-2 pt-2 text-sm">
              {profile.location && (
                <li className="chip gap-2 py-1.5">
                  <MapPin className="h-3.5 w-3.5" aria-hidden /> {profile.location}
                </li>
              )}
              {profile.email && (
                <li>
                  <a href={`mailto:${profile.email}`} className="chip gap-2 py-1.5 transition hover:bg-gold-500/20">
                    <Mail className="h-3.5 w-3.5" aria-hidden /> {profile.email}
                  </a>
                </li>
              )}
              {profile.phone && (
                <li>
                  <a href={telHref(profile.phone)} className="chip gap-2 py-1.5 transition hover:bg-gold-500/20">
                    <Phone className="h-3.5 w-3.5" aria-hidden /> {profile.phone}
                  </a>
                </li>
              )}
            </ul>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {profile.focus_areas.map((area, i) => {
              const Icon = ICONS[i % ICONS.length];
              const wide = i === 0 || (profile.focus_areas.length % 2 === 1 && i === profile.focus_areas.length - 1);
              return (
                <Reveal key={area.title} delay={i * 0.07} className={wide ? 'sm:col-span-2' : ''}>
                  <SpotlightCard as="div" className="group h-full p-6 transition duration-300 hover:-translate-y-1 hover:border-gold-400/40">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold-500/30 bg-gold-500/10 text-gold-300 transition group-hover:bg-gold-500/20 group-hover:shadow-glow-sm">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <span className="text-sm font-medium text-muted/60" aria-hidden>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{area.title}</h3>
                    <p className="text-sm leading-relaxed text-muted">{area.description}</p>
                  </SpotlightCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
