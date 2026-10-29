import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spinner } from '@/components/ui/primitives';
import { AdminProvider } from './AdminContext';
import { useAuth } from './AuthContext';

/**
 * UI guard only. Real authorisation happens in the database: even if this guard were bypassed,
 * Row Level Security rejects every read/write from non-administrators.
 */
export function RequireAdmin() {
  const { loading, session, isAdmin } = useAuth();
  const location = useLocation();

  if (loading || (session && isAdmin === null)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Verifying access" />
      </div>
    );
  }
  if (!session || isAdmin === false) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }
  return (
    <AdminProvider>
      <Outlet />
    </AdminProvider>
  );
}
