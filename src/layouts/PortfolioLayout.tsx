import { MagicCanvas } from '@/components/background/MagicCanvas';
import { Footer } from '@/components/public/Footer';
import { Navbar } from '@/components/public/Navbar';
import { ScrollProgress } from '@/components/public/ScrollProgress';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { buildNav } from '@/lib/sections';
import { initialOf } from '@/lib/text';
import { resumeUrl } from '@/lib/url';
import { About } from '@/sections/About';
import { Achievements } from '@/sections/Achievements';
import { Contact } from '@/sections/Contact';
import { EducationSection } from '@/sections/EducationSection';
import { Experience } from '@/sections/Experience';
import { Hero } from '@/sections/Hero';
import { Projects } from '@/sections/Projects';
import { Skills } from '@/sections/Skills';
import type { PortfolioContent } from '@/types/content';

interface Props {
  content: PortfolioContent;
  /** Preview mode (admin draft): does not touch the document title/meta. */
  preview?: boolean;
}

function PublicMeta({ content }: { content: PortfolioContent }) {
  const { profile } = content;
  useDocumentMeta(
    `${profile.full_name} | ${profile.title}`,
    profile.intro.length > 160 ? `${profile.intro.slice(0, 157)}…` : profile.intro,
  );
  return null;
}

export function PortfolioLayout({ content, preview = false }: Props) {
  const { profile } = content;
  const nav = buildNav(content);
  const resume = resumeUrl(profile.resume_path, `${profile.full_name}-Resume.pdf`);

  return (
    <div className="relative">
      {!preview && <PublicMeta content={content} />}
      <MagicCanvas />
      <ScrollProgress />
      <Navbar items={nav} name={profile.full_name} initial={initialOf(profile.full_name)} resumeHref={resume} />
      <main id="main" className="relative z-10">
        <Hero content={content} />
        <About content={content} />
        {content.skill_categories.length > 0 && <Skills categories={content.skill_categories} />}
        {content.experiences.length > 0 && <Experience items={content.experiences} />}
        {content.projects.length > 0 && <Projects projects={content.projects} />}
        {(content.education.length > 0 || content.certifications.length > 0) && (
          <EducationSection education={content.education} certifications={content.certifications} />
        )}
        {content.achievements.length > 0 && <Achievements items={content.achievements} />}
        <Contact profile={profile} links={content.social_links} />
      </main>
      <Footer profile={profile} links={content.social_links} nav={nav} />
    </div>
  );
}
