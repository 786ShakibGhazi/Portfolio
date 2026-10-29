import { lazy, Suspense, type ReactNode } from 'react';
import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Spinner } from '@/components/ui/primitives';
import { ToastProvider } from '@/components/ui/Toast';
import NotFoundPage from '@/pages/NotFoundPage';
import PortfolioPage from '@/pages/PortfolioPage';

const AdminApp = lazy(() => import('@/admin/AdminApp'));

function PageTransition({ children }: { children: ReactNode }) {
  return (
    <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}>
      {children}
    </m.div>
  );
}

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

export default function App() {
  return (
    <LazyMotion features={domAnimation} strict={false}>
      <MotionConfig reducedMotion="user">
        <ToastProvider>
          <BrowserRouter basename={basename} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route
                path="/"
                element={
                  <PageTransition>
                    <PortfolioPage />
                  </PageTransition>
                }
              />
              <Route
                path="/admin/*"
                element={
                  <Suspense fallback={<Spinner label="Loading admin" />}>
                    <AdminApp />
                  </Suspense>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
