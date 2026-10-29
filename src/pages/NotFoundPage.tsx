import { m } from 'framer-motion';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FloatingCandles } from '@/components/background/FloatingCandles';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

export default function NotFoundPage() {
  useDocumentMeta('Page not found | Sakiv');
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 text-center">
      <div className="bg-grid absolute inset-0" aria-hidden />
      <FloatingCandles />
      <m.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-lg"
      >
        <p className="font-display text-8xl font-bold text-gold-gradient sm:text-9xl">404</p>
        <h1 className="mt-4 text-2xl sm:text-3xl">This page has vanished</h1>
        <p className="mt-3 text-muted">
          Not even a Summoning Charm can fetch it. The link may be broken, or the page may have moved.
        </p>
        <Link to="/" className="btn btn-primary mt-8">
          <Home className="h-4 w-4" aria-hidden /> Back to the portfolio
        </Link>
      </m.div>
    </main>
  );
}
