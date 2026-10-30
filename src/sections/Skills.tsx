import { m } from 'framer-motion';
import { SectionHeading, SpotlightCard } from '@/components/ui/primitives';
import { categoryIcon } from '@/lib/icons';
import { fadeUp, stagger } from '@/lib/motion';
import type { SkillCategory } from '@/types/content';

export function Skills({ categories }: { categories: SkillCategory[] }) {
  return (
    <section id="skills" className="section">
      <div className="container-x">
        <SectionHeading
          eyebrow="Expertise"
          title="Technical skills"
          description="Languages, frameworks and tools I work with day to day, grouped by where I use them."
        />
        <div className="columns-1 gap-5 md:columns-2 lg:columns-3 [&>*]:mb-5">
          {categories.map((category, ci) => {
            const Icon = categoryIcon(category.icon);
            return (
              <m.div
                key={category.id}
                className="break-inside-avoid"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '0px 0px -60px 0px' }}
                variants={stagger(0.045, ci * 0.05)}
              >
                <SpotlightCard className="p-6 transition duration-300 hover:border-gold-400/40">
                  <div className="mb-5 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold-500/30 bg-gold-500/10 text-gold-300">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold leading-tight">{category.name}</h3>
                      <p className="text-xs text-muted">{category.skills.length} skills</p>
                    </div>
                  </div>
                  <ul className="flex flex-wrap gap-2">
                    {category.skills.map((skill) => (
                      <m.li
                        key={skill.id}
                        variants={fadeUp}
                        whileHover={{ y: -2 }}
                        className="cursor-default rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-parchment-100 transition-colors hover:border-gold-400/50 hover:bg-gold-500/10 hover:text-gold-100"
                      >
                        {skill.name}
                      </m.li>
                    ))}
                  </ul>
                </SpotlightCard>
              </m.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
