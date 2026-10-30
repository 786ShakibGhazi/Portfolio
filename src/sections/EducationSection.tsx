import { BadgeCheck, ExternalLink, GraduationCap } from 'lucide-react';
import { Reveal, SectionHeading, SpotlightCard } from '@/components/ui/primitives';
import { formatMonthYear } from '@/lib/format';
import { safeUrl } from '@/lib/url';
import type { Certification, Education } from '@/types/content';

interface Props {
  education: Education[];
  certifications: Certification[];
}

export function EducationSection({ education, certifications }: Props) {
  const both = education.length > 0 && certifications.length > 0;
  return (
    <section id="education" className="section">
      <div className="container-x">
        <SectionHeading
          eyebrow="Background"
          title="Education"
          description="Academic background and verified certifications."
        />
        <div className={`grid gap-8 ${both ? 'lg:grid-cols-[1.4fr_1fr]' : ''}`}>
          {education.length > 0 && (
            <ol className="space-y-4">
              {education.map((item, i) => (
                <li key={item.id}>
                  <Reveal delay={i * 0.07}>
                    <SpotlightCard
                      as="div"
                      className={`flex gap-4 p-5 transition duration-300 hover:border-gold-400/40 sm:gap-5 sm:p-6 ${
                        i === 0 ? 'border-gold-400/30' : ''
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex shrink-0 items-center justify-center rounded-xl border border-gold-500/40 bg-gold-500/10 text-gold-300 ${
                          i === 0 ? 'h-12 w-12' : 'h-10 w-10'
                        }`}
                      >
                        <GraduationCap className={i === 0 ? 'h-6 w-6' : 'h-5 w-5'} aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <h3 className={i === 0 ? 'text-lg font-semibold sm:text-xl' : 'text-base font-semibold'}>
                            {item.institution}
                          </h3>
                          {item.period && <span className="text-sm text-gold-300">{item.period}</span>}
                        </div>
                        <p className="mt-1 text-sm text-parchment-100 sm:text-base">{item.qualification}</p>
                        {item.grade_label && item.grade_value && (
                          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-sm">
                            <span className="text-muted">{item.grade_label}</span>
                            <span className="font-semibold text-gold-200">{item.grade_value}</span>
                          </p>
                        )}
                      </div>
                    </SpotlightCard>
                  </Reveal>
                </li>
              ))}
            </ol>
          )}

          {certifications.length > 0 && (
            <div>
              <Reveal>
                <h3 className="mb-4 text-xl font-semibold text-parchment-50">Certifications</h3>
              </Reveal>
              <ul className="space-y-4">
                {certifications.map((cert, i) => {
                  const url = safeUrl(cert.credential_url);
                  return (
                    <li key={cert.id}>
                      <Reveal delay={i * 0.07}>
                        <SpotlightCard as="div" className="p-5 transition duration-300 hover:border-gold-400/40">
                          <div className="flex items-start gap-3">
                            <BadgeCheck className="mt-0.5 h-6 w-6 shrink-0 text-gold-300" aria-hidden />
                            <div>
                              <h4 className="text-base font-semibold">{cert.title}</h4>
                              <p className="mt-0.5 text-sm text-muted">
                                {cert.issuer}
                                {cert.issued_on && ` · ${formatMonthYear(cert.issued_on)}`}
                              </p>
                              {url && (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-gold-300 underline-offset-4 hover:underline"
                                >
                                  View credential <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                                  <span className="sr-only"> (opens in a new tab)</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </SpotlightCard>
                      </Reveal>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
