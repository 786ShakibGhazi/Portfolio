import type { PortfolioContent } from '@/types/content';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Loose = Record<string, any>;

const list = <T = any>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

/**
 * Validates and normalises a snapshot coming from the database, the local cache or the bundled fallback.
 * Returns null when the payload is unusable so callers can fall back safely.
 */
export function normalizeContent(raw: unknown): PortfolioContent | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Loose;
  const p = r.profile as Loose | null;
  if (!p || typeof p !== 'object' || typeof p.full_name !== 'string') return null;

  return {
    profile: {
      full_name: p.full_name,
      title: String(p.title ?? ''),
      headline: String(p.headline ?? ''),
      intro: String(p.intro ?? ''),
      bio: String(p.bio ?? ''),
      roles: list<string>(p.roles),
      stats: list(p.stats),
      focus_areas: list(p.focus_areas),
      email: p.email ?? null,
      phone: p.phone ?? null,
      location: p.location ?? null,
      resume_path: p.resume_path ?? null,
      avatar_path: p.avatar_path ?? null,
    },
    social_links: list<Loose>(r.social_links).map((s, i) => ({ ...s, id: s.id ?? `social-${i}` })) as any,
    skill_categories: list<Loose>(r.skill_categories).map((c, ci) => ({
      id: c.id ?? `cat-${ci}`,
      name: c.name,
      icon: c.icon ?? 'code',
      skills: list<any>(c.skills).map((s, si) =>
        typeof s === 'string' ? { id: `${c.id ?? ci}-${si}`, name: s } : { id: s.id ?? `${c.id ?? ci}-${si}`, name: s.name },
      ),
    })),
    experiences: list<Loose>(r.experiences).map((e, i) => ({
      ...e,
      id: e.id ?? `exp-${i}`,
      highlights: list(e.highlights),
      tech: list(e.tech),
    })) as any,
    projects: list<Loose>(r.projects).map((x, i) => ({ ...x, id: x.id ?? `proj-${i}`, tech: list(x.tech) })) as any,
    education: list<Loose>(r.education).map((x, i) => ({ ...x, id: x.id ?? `edu-${i}` })) as any,
    certifications: list<Loose>(r.certifications).map((x, i) => ({ ...x, id: x.id ?? `cert-${i}` })) as any,
    achievements: list<Loose>(r.achievements).map((x, i) => ({ ...x, id: x.id ?? `ach-${i}` })) as any,
  };
}
