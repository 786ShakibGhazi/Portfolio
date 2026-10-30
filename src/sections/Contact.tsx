import { useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { AlertCircle, CheckCircle2, Loader2, Mail, MapPin, Phone, Send } from 'lucide-react';
import { SocialIcons } from '@/components/public/Footer';
import { Reveal, SectionHeading } from '@/components/ui/primitives';
import { isSupabaseConfigured } from '@/lib/config';
import { cleanText } from '@/lib/text';
import { telHref } from '@/lib/url';
import { sendContactMessage } from '@/services/contact';
import type { Profile, SocialLink } from '@/types/content';

type Errors = Partial<Record<'name' | 'email' | 'message', string>>;
type Status = 'idle' | 'sending' | 'sent' | 'error';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

function validate(name: string, email: string, message: string): Errors {
  const errors: Errors = {};
  if (name.length < 2) errors.name = 'Please enter your name (at least 2 characters).';
  else if (name.length > 100) errors.name = 'Name must be 100 characters or fewer.';
  if (!EMAIL_RE.test(email) || email.length > 254) errors.email = 'Please enter a valid email address.';
  if (message.length < 10) errors.message = 'Please write at least 10 characters.';
  else if (message.length > 2000) errors.message = 'Message must be 2000 characters or fewer.';
  return errors;
}

export function Contact({ profile, links }: { profile: Profile; links: SocialLink[] }) {
  const [values, setValues] = useState({ name: '', email: '', message: '', website: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverError, setServerError] = useState('');
  const openedAt = useRef(Date.now());
  const formRef = useRef<HTMLFormElement>(null);

  const set = (key: keyof typeof values) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    const clean = {
      name: cleanText(values.name),
      email: cleanText(values.email),
      message: cleanText(values.message),
    };
    const found = validate(clean.name, clean.email, clean.message);
    setErrors(found);
    if (Object.keys(found).length) {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }
    setStatus('sending');
    setServerError('');
    try {
      await sendContactMessage({ ...clean, website: values.website }, Date.now() - openedAt.current);
      setStatus('sent');
      setValues({ name: '', email: '', message: '', website: '' });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'The message could not be sent.');
      setStatus('error');
    }
  };

  const disabled = !isSupabaseConfigured;

  return (
    <section id="contact" className="section">
      <div className="container-x">
        <SectionHeading
          eyebrow="Contact"
          title="Get in touch"
          description="Have a role, a project or a question? Send a message and I will reply by email."
        />

        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <Reveal className="space-y-6">
            <ul className="space-y-4">
              {profile.email && (
                <li>
                  <a href={`mailto:${profile.email}`} className="group flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold-500/30 bg-gold-500/10 text-gold-300 transition group-hover:shadow-glow-sm">
                      <Mail className="h-5 w-5" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-xs uppercase tracking-[0.16em] text-muted">Email</span>
                      <span className="text-parchment-50 group-hover:text-gold-200">{profile.email}</span>
                    </span>
                  </a>
                </li>
              )}
              {profile.phone && (
                <li>
                  <a href={telHref(profile.phone)} className="group flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold-500/30 bg-gold-500/10 text-gold-300 transition group-hover:shadow-glow-sm">
                      <Phone className="h-5 w-5" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-xs uppercase tracking-[0.16em] text-muted">Phone</span>
                      <span className="text-parchment-50 group-hover:text-gold-200">{profile.phone}</span>
                    </span>
                  </a>
                </li>
              )}
              {profile.location && (
                <li className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold-500/30 bg-gold-500/10 text-gold-300">
                    <MapPin className="h-5 w-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-xs uppercase tracking-[0.16em] text-muted">Location</span>
                    <span className="text-parchment-50">{profile.location}</span>
                  </span>
                </li>
              )}
            </ul>
            {links.length > 0 && (
              <div>
                <p className="mb-3 text-xs uppercase tracking-[0.16em] text-muted">Find me online</p>
                <SocialIcons links={links} />
              </div>
            )}
          </Reveal>

          <Reveal delay={0.1}>
            <div className="glass relative overflow-hidden rounded-2xl p-6 sm:p-8">
              <AnimatePresence mode="wait" initial={false}>
                {status === 'sent' ? (
                  <m.div
                    key="sent"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-4 py-10 text-center"
                    role="status"
                  >
                    <CheckCircle2 className="h-14 w-14 text-emerald-300" aria-hidden />
                    <h3 className="text-2xl">Your owl is on its way</h3>
                    <p className="max-w-sm text-muted">Thank you. Your message was delivered and I will reply by email.</p>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm mt-2"
                      onClick={() => {
                        openedAt.current = Date.now();
                        setStatus('idle');
                      }}
                    >
                      Send another message
                    </button>
                  </m.div>
                ) : (
                  <m.form
                    key="form"
                    ref={formRef}
                    onSubmit={onSubmit}
                    noValidate
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                    aria-label="Contact form"
                  >
                    {/* Honeypot: hidden from people and assistive tech, bots tend to fill it. */}
                    <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
                      <label>
                        Website
                        <input
                          type="text"
                          name="website"
                          tabIndex={-1}
                          autoComplete="off"
                          value={values.website}
                          onChange={set('website')}
                        />
                      </label>
                    </div>

                    <div>
                      <label htmlFor="contact-name" className="label">
                        Name
                      </label>
                      <input
                        id="contact-name"
                        className="input"
                        autoComplete="name"
                        maxLength={100}
                        value={values.name}
                        onChange={set('name')}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? 'contact-name-error' : undefined}
                        disabled={disabled}
                      />
                      {errors.name && (
                        <p id="contact-name-error" role="alert" className="mt-1.5 text-sm text-red-300">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="label">
                        Email
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        className="input"
                        autoComplete="email"
                        maxLength={254}
                        value={values.email}
                        onChange={set('email')}
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? 'contact-email-error' : undefined}
                        disabled={disabled}
                      />
                      {errors.email && (
                        <p id="contact-email-error" role="alert" className="mt-1.5 text-sm text-red-300">
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <div className="flex items-baseline justify-between">
                        <label htmlFor="contact-message" className="label">
                          Message
                        </label>
                        <span className="text-xs text-muted" aria-hidden>
                          {values.message.length}/2000
                        </span>
                      </div>
                      <textarea
                        id="contact-message"
                        className="input min-h-[140px] resize-y"
                        rows={5}
                        maxLength={2000}
                        value={values.message}
                        onChange={set('message')}
                        aria-invalid={Boolean(errors.message)}
                        aria-describedby={errors.message ? 'contact-message-error' : undefined}
                        disabled={disabled}
                      />
                      {errors.message && (
                        <p id="contact-message-error" role="alert" className="mt-1.5 text-sm text-red-300">
                          {errors.message}
                        </p>
                      )}
                    </div>

                    {status === 'error' && (
                      <p role="alert" className="flex items-start gap-2 rounded-lg border border-crimson-500/40 bg-crimson-600/10 px-3 py-2.5 text-sm text-red-200">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {serverError}
                      </p>
                    )}
                    {disabled && (
                      <p className="rounded-lg border border-gold-500/30 bg-gold-500/10 px-3 py-2.5 text-sm text-gold-100">
                        The contact form is unavailable right now.
                        {profile.email && (
                          <>
                            {' '}
                            Please email{' '}
                            <a className="underline" href={`mailto:${profile.email}`}>
                              {profile.email}
                            </a>{' '}
                            directly.
                          </>
                        )}
                      </p>
                    )}

                    <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={disabled || status === 'sending'}>
                      {status === 'sending' ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Sending…
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" aria-hidden /> Send message
                        </>
                      )}
                    </button>
                  </m.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
