import { m } from 'framer-motion';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

export default function NotFoundPage() {
  useDocumentMeta('Page not found | Sakiv');
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 text-center">
      <div className="bg-grid absolute inset-0" aria-hidden />
      <m.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-lg"
      >
        <p className="text-8xl font-bold text-gradient sm:text-9xl">404</p>
        <h1 className="mt-4 text-2xl font-bold sm:text-3xl">Page not found</h1>
        <p className="mt-3 text-muted">
          The page you are looking for does not exist or may have been moved.
        </p>
        <Link to="/" className="btn btn-primary mt-8">
          <Home className="h-4 w-4" aria-hidden /> Back to the portfolio
        </Link>
      </m.div>
    </main>
  );
}
