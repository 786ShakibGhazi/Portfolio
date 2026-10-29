import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { AdminLayout } from './layout/AdminLayout';
import AccountPage from './pages/AccountPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import MessagesPage from './pages/MessagesPage';
import PreviewPage from './pages/PreviewPage';
import ProfilePage from './pages/ProfilePage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ResourcePage from './pages/ResourcePage';
import SkillsPage from './pages/SkillsPage';
import { RequireAdmin } from './RequireAdmin';

/** Mounted lazily at /admin/*. Public visitors never download this code. */
export default function AdminApp() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-ink-950">
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route element={<RequireAdmin />}>
            <Route path="preview" element={<PreviewPage />} />
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="social" element={<ResourcePage resource="social_links" />} />
              <Route path="skills" element={<SkillsPage />} />
              <Route path="experience" element={<ResourcePage resource="experiences" />} />
              <Route path="projects" element={<ResourcePage resource="projects" />} />
              <Route path="education" element={<ResourcePage resource="education" />} />
              <Route path="certifications" element={<ResourcePage resource="certifications" />} />
              <Route path="achievements" element={<ResourcePage resource="achievements" />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="account" element={<AccountPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}
