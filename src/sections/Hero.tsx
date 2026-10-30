import { m } from 'framer-motion';
import { ArrowRight, Download, Mail, MapPin } from 'lucide-react';
import { SocialIcons } from '@/components/public/Footer';
import { CountUp } from '@/components/public/CountUp';
import { RotatingText } from '@/components/public/RotatingText';
import { fadeUp, scaleIn, stagger } from '@/lib/motion';
import { initialOf } from '@/lib/text';
import { imageUrl, resumeUrl } from '@/lib/url';
import type { PortfolioContent } from '@/types/content';

export function Hero({ content }: { content: PortfolioContent }) {
  const { profile, social_links, experiences, projects } = content;
  const current = experiences.find((e) => e.is_current) ?? experiences[0];
  const resume = resumeUrl(profile.resume_path, `${profile.full_name}-Resume.pdf`);
  const avatar = imageUrl(profile.avatar_path);

  return (
    <section id="home" className="relative flex min-h-[100svh] items-center overflow-hidden pb-14 pt-36 sm:pt-32">
      <div className="bg-grid absolute inset-0" aria-hidden />
      <div className="absolute left-1/2 top-1/4 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gold-500/10 blur-[120px]" aria-hidden />

      <div className="container-x relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
          <m.div variants={stagger(0.1, 0.1)} initial="hidden" animate="show">
            <m.p variants={fadeUp} className="chip mb-6 gap-2 py-1.5 pl-3 pr-4 text-[0.8rem]">
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {current ? `${current.role} at ${current.company}` : profile.title}
            </m.p>

            <m.h1
              variants={fadeUp}
              className="mb-4 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
            >
              <span className="text-gradient">{profile.full_name}</span>
            </m.h1>

            {profile.roles.length > 0 && (
              <m.p variants={fadeUp} className="mb-5 text-xl text-parchment-200 sm:text-2xl">
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
            <div className="glass relative mx-auto w-full max-w-sm rounded-2xl p-6 text-center shadow-glow">
              <div className="mx-auto h-36 w-36 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gold-500/30 to-ink-700">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={`Portrait of ${profile.full_name}`}
                    width={144}
                    height={144}
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-6xl font-bold text-parchment-50" aria-hidden>
                    {initialOf(profile.full_name)}
                  </span>
                )}
              </div>
              <p className="mt-5 text-xl font-semibold text-parchment-50">{profile.full_name}</p>
              <p className="mt-1 text-sm text-gold-300">{profile.title}</p>
              {profile.location && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted">
                  <MapPin className="h-3.5 w-3.5" aria-hidden /> {profile.location}
                </p>
              )}
            </div>
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
                  <span className="block text-3xl font-bold text-parchment-50 sm:text-4xl">
                    <CountUp value={stat.value} />
                  </span>
                  <span className="mt-1 block text-xs font-medium uppercase tracking-wider text-muted">{stat.label}</span>
                </dd>
              </m.div>
            ))}
          </m.dl>
        )}
      </div>
    </section>
  );
}
