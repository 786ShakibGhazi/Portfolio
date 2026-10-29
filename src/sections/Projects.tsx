import { ExternalLink, Github } from 'lucide-react';
import { ProjectArt } from '@/components/public/ProjectArt';
import { Reveal, SectionHeading, SpotlightCard } from '@/components/ui/primitives';
import { imageUrl, safeUrl } from '@/lib/url';
import type { Project } from '@/types/content';

interface CardProps {
  project: Project;
  wide: boolean;
  flip: boolean;
  index: number;
}

function ProjectCard({ project, wide, flip, index }: CardProps) {
  const image = imageUrl(project.image_path);
  const live = safeUrl(project.live_url);
  const repo = safeUrl(project.repo_url);

  return (
    <Reveal delay={index * 0.08} className={wide ? 'lg:col-span-2' : ''}>
      <SpotlightCard
        as="article"
        className={`group h-full overflow-hidden transition duration-300 hover:-translate-y-1.5 hover:border-gold-400/50 hover:shadow-glow ${
          wide ? (flip ? 'lg:grid lg:grid-cols-[1fr_1.1fr]' : 'lg:grid lg:grid-cols-[1.1fr_1fr]') : 'flex flex-col'
        }`}
      >
        <div
          className={`relative overflow-hidden ${
            wide ? 'aspect-[16/10] lg:aspect-auto lg:min-h-[340px]' : 'aspect-[16/10]'
          } ${wide && flip ? 'lg:order-2' : ''}`}
        >
          <div className="h-full w-full transition-transform duration-700 group-hover:scale-105">
            {image ? (
              <img
                src={image}
                alt={`Screenshot of ${project.title}`}
                width={800}
                height={500}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : (
              <ProjectArt title={project.title} />
            )}
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
          {project.is_featured && (
            <span className="chip absolute bottom-4 left-4 border-gold-300/60 bg-ink-950/70 text-gold-100 backdrop-blur">
              Featured
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6 sm:p-8">
          {project.period && <p className="mb-2 text-xs uppercase tracking-[0.18em] text-gold-400">{project.period}</p>}
          <h3 className="text-xl font-semibold sm:text-2xl">{project.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{project.description}</p>

          {project.tech.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Technologies">
              {project.tech.map((t) => (
                <li key={t} className="chip">
                  {t}
                </li>
              ))}
            </ul>
          )}

          {(live || repo) && (
            <div className="mt-auto flex flex-wrap gap-3 pt-6">
              {live && (
                <a href={live} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden /> Live demo
                  <span className="sr-only"> of {project.title} (opens in a new tab)</span>
                </a>
              )}
              {repo && (
                <a href={repo} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                  <Github className="h-3.5 w-3.5" aria-hidden /> Source code
                  <span className="sr-only"> for {project.title} (opens in a new tab)</span>
                </a>
              )}
            </div>
          )}
        </div>
      </SpotlightCard>
    </Reveal>
  );
}

export function Projects({ projects }: { projects: Project[] }) {
  // Featured projects lead; the admin-defined order is kept within each group.
  const ordered = [...projects].sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
  const regularCount = ordered.filter((p) => !p.is_featured).length;
  return (
    <section id="projects" className="section">
      <div className="container-x">
        <SectionHeading
          eyebrow="Artefacts & creations"
          title="Projects"
          description="Things I have designed and built end to end."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          {ordered.map((project, i) => {
            // Featured cards, and a trailing odd regular card, span the full row.
            const wide = project.is_featured || (i === ordered.length - 1 && regularCount % 2 === 1);
            return <ProjectCard key={project.id} project={project} wide={wide} flip={i % 2 === 1} index={i} />;
          })}
        </div>
      </div>
    </section>
  );
}
