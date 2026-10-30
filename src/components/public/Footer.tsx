import { Mail, Phone } from 'lucide-react';
import { SOCIAL_ICONS } from '@/lib/icons';
import type { NavItem } from '@/lib/sections';
import { safeUrl, telHref } from '@/lib/url';
import type { Profile, SocialLink } from '@/types/content';

export function SocialIcons({ links, className = '' }: { links: SocialLink[]; className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`}>
      {links.map((link) => {
        const href = safeUrl(link.url);
        if (!href) return null;
        const Icon = SOCIAL_ICONS[link.platform] ?? SOCIAL_ICONS.other;
        return (
          <li key={link.id}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${link.label} (opens in a new tab)`}
              title={link.label}
              className="group flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-parchment-100 transition duration-200 hover:-translate-y-0.5 hover:border-gold-400/60 hover:bg-gold-500/15 hover:text-gold-200"
            >
              <Icon className="h-5 w-5 transition-transform group-hover:scale-110" aria-hidden />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function Footer({ profile, links, nav }: { profile: Profile; links: SocialLink[]; nav: NavItem[] }) {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-ink-950/80">
      <div className="container-x grid gap-10 py-12 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="text-xl font-semibold tracking-tight text-parchment-50">{profile.full_name}</p>
          <p className="mt-1 text-sm text-gold-300">{profile.title}</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">{profile.headline}</p>
          {links.length > 0 && <SocialIcons links={links} className="mt-5" />}
        </div>
        <nav aria-label="Footer">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold-300">Explore</p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm md:grid-cols-1">
            {nav.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="text-parchment-200 transition hover:text-gold-200">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold-300">Contact</p>
          <ul className="space-y-2 text-sm">
            {profile.email && (
              <li>
                <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2 text-parchment-200 hover:text-gold-200">
                  <Mail className="h-4 w-4 text-gold-400" aria-hidden /> {profile.email}
                </a>
              </li>
            )}
            {profile.phone && (
              <li>
                <a href={telHref(profile.phone)} className="inline-flex items-center gap-2 text-parchment-200 hover:text-gold-200">
                  <Phone className="h-4 w-4 text-gold-400" aria-hidden /> {profile.phone}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} {profile.full_name}. Built with React, TypeScript &amp; Tailwind CSS.
      </div>
    </footer>
  );
}
