import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { Download, Menu, X } from 'lucide-react';
import { useActiveSection } from '@/hooks/useActiveSection';
import type { NavItem } from '@/lib/sections';

interface NavbarProps {
  items: NavItem[];
  name: string;
  initial: string;
  resumeHref: string | null;
}

export function Navbar({ items, name, initial, resumeHref }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const active = useActiveSection(['home', ...items.map((i) => i.id)]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onResize = () => window.innerWidth >= 1024 && setOpen(false);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? 'glass-strong border-x-0 border-t-0' : 'border-b border-transparent'
      }`}
    >
      <a
        href="#main"
        className="sr-only z-[70] rounded-md bg-gold-300 px-4 py-2 font-semibold text-ink-950 focus:not-sr-only focus:absolute focus:left-4 focus:top-3"
      >
        Skip to content
      </a>
      <div className="container-x flex h-16 items-center justify-between">
        <a href="#home" className="group flex items-center gap-3" aria-label={`${name} – back to top`}>
          <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500 text-base font-bold text-white shadow-glow-sm transition group-hover:bg-gold-400">
            {initial}
          </span>
          <span className="text-lg font-semibold tracking-tight text-parchment-50">{name}</span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={active === item.id ? 'true' : undefined}
              className="group relative px-3 py-2 text-sm text-parchment-200 transition-colors hover:text-gold-200 aria-[current=true]:text-gold-200"
            >
              {item.label}
              <span className="absolute inset-x-3 bottom-0.5 h-px origin-left scale-x-0 bg-gold-400 transition-transform duration-300 group-hover:scale-x-100 group-aria-[current=true]:scale-x-100" />
            </a>
          ))}
          {resumeHref && (
            <a href={resumeHref} className="btn btn-secondary btn-sm ml-3" rel="noopener">
              <Download className="h-3.5 w-3.5" aria-hidden /> Resume
            </a>
          )}
        </nav>

        <button
          ref={buttonRef}
          type="button"
          className="btn-icon lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <m.nav
            id="mobile-menu"
            aria-label="Mobile"
            className="overflow-hidden border-t border-white/10 lg:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <ul className="container-x flex flex-col gap-1 py-4">
              {items.map((item, i) => (
                <m.li
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.25 }}
                >
                  <a
                    href={`#${item.id}`}
                    onClick={() => setOpen(false)}
                    aria-current={active === item.id ? 'true' : undefined}
                    className="group flex items-center justify-between rounded-lg px-3 py-3 font-medium text-parchment-100 hover:bg-white/5 aria-[current=true]:bg-gold-500/10 aria-[current=true]:text-gold-200"
                  >
                    {item.label}
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-400 opacity-0 group-aria-[current=true]:opacity-100" />
                  </a>
                </m.li>
              ))}
              {resumeHref && (
                <li className="pt-2">
                  <a href={resumeHref} className="btn btn-primary w-full" rel="noopener">
                    <Download className="h-4 w-4" aria-hidden /> Download resume
                  </a>
                </li>
              )}
            </ul>
          </m.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
