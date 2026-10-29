import { m } from 'framer-motion';
import { ArrowRight, Download, Mail } from 'lucide-react';
import { ArcaneCircle } from '@/components/background/ArcaneCircle';
import { FloatingCandles } from '@/components/background/FloatingCandles';
import { SocialIcons } from '@/components/public/Footer';
import { CountUp } from '@/components/public/CountUp';
import { RotatingText } from '@/components/public/RotatingText';
import { fadeUp, scaleIn, stagger } from '@/lib/motion';
import { initialOf } from '@/lib/text';
import { resumeUrl } from '@/lib/url';
import type { PortfolioContent } from '@/types/content';

const letter = {
  hidden: { opacity: 0, y: 36, rotateX: -50 },
  show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

export function Hero({ content }: { content: PortfolioContent }) {
  const { profile, social_links, experiences, projects } = content;
  const current = experiences.find((e) => e.is_current) ?? experiences[0];
  const resume = resumeUrl(profile.resume_path, `${profile.full_name}-Resume.pdf`);

  return (
    <section id="home" className="relative flex min-h-[100svh] items-center overflow-hidden pb-14 pt-36 sm:pt-32">
      <div className="bg-grid absolute inset-0" aria-hidden />
      <div className="absolute left-1/2 top-1/3 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-crimson-700/15 blur-[120px]" aria-hidden />
      <FloatingCandles />

      <div className="container-x relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
          <m.div variants={stagger(0.1, 0.1)} initial="hidden" animate="show">
            <m.p variants={fadeUp} className="chip mb-6 gap-2 rounded-2xl py-1.5 pl-3 pr-4 text-left text-[0.8rem] sm:rounded-full sm:pl-2">
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-300 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-300" />
              </span>
              {current ? `${current.role} at ${current.company}` : profile.title}
            </m.p>

            <h1
              aria-label={profile.full_name}
              className="mb-3 text-6xl font-bold leading-[1.02] sm:text-7xl lg:text-[5.5rem]"
              style={{ perspective: 600 }}
            >
              <m.span variants={stagger(0.06)} className="inline-block text-gold-gradient" aria-hidden>
                {Array.from(profile.full_name).map((char, i) => (
                  <m.span key={i} variants={letter} className="inline-block origin-bottom">
                    {char === ' ' ? '\u00A0' : char}
                  </m.span>
                ))}
              </m.span>
            </h1>

            {profile.roles.length > 0 && (
              <m.p variants={fadeUp} className="mb-5 font-serif text-xl italic text-parchment-200 sm:text-2xl">
                I am a <RotatingText words={profile.roles} />
              </m.p>
            )}

            <m.p variants={fadeUp} className="max-w-xl text-lg font-medium leading-snug text-parchment-50 sm:text-xl">
              {profile.headline}
            </m.p>
            <m.p variants={fadeUp} className="mt-4 max-w-xl text-base leading-relaxed text-muted">
              {profile.intro}
            </m.p>

            <m.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
              {projects.length > 0 && (
                <a href="#projects" className="btn btn-primary">
                  View projects <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
              )}
              <a href="#contact" className="btn btn-secondary">
                <Mail className="h-4 w-4" aria-hidden /> Contact me
              </a>
              {resume && (
                <a href={resume} className="btn btn-ghost border border-white/10" rel="noopener">
                  <Download className="h-4 w-4" aria-hidden /> Resume
                </a>
              )}
            </m.div>

            {social_links.length > 0 && (
              <m.div variants={fadeUp} className="mt-8">
                <SocialIcons links={social_links} />
              </m.div>
            )}
          </m.div>

          <m.div variants={scaleIn} initial="hidden" animate="show" transition={{ delay: 0.3 }}>
            <ArcaneCircle initial={initialOf(profile.full_name)} />
          </m.div>
        </div>

        {profile.stats.length > 0 && (
          <m.dl
            variants={stagger(0.1, 0.8)}
            initial="hidden"
            animate="show"
            className="glass mt-14 grid grid-cols-2 overflow-hidden rounded-2xl sm:mt-16 lg:grid-cols-4"
          >
            {profile.stats.map((stat, i) => (
              <m.div
                key={`${stat.label}-${i}`}
                variants={fadeUp}
                className="border-white/5 px-5 py-5 text-center [&:nth-child(n+3)]:border-t lg:[&:nth-child(n+3)]:border-t-0 lg:[&:not(:first-child)]:border-l [&:nth-child(even)]:border-l lg:[&:nth-child(even)]:border-l"
              >
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block font-display text-3xl font-bold text-gold-gradient sm:text-4xl">
                    <CountUp value={stat.value} />
                  </span>
                  <span className="mt-1 block text-xs uppercase tracking-[0.14em] text-muted">{stat.label}</span>
                </dd>
              </m.div>
            ))}
          </m.dl>
        )}
      </div>
    </section>
  );
}
