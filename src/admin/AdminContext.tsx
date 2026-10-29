import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useToast } from '@/components/ui/Toast';
import { toMessage } from '@/lib/errors';
import { countUnreadMessages, getPublishStatus, publishPortfolio, type PublishStatus } from '@/services/admin';

interface AdminContextValue {
  status: PublishStatus | null;
  statusError: string | null;
  unread: number;
  publishing: boolean;
  /** Call after any content change so the "unpublished changes" indicator stays accurate. */
  refresh: () => Promise<void>;
  publish: () => Promise<boolean>;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [status, setStatus] = useState<PublishStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);
  const [publishing, setPublishing] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [s, u] = await Promise.all([getPublishStatus(), countUnreadMessages()]);
      setStatus(s);
      setUnread(u);
      setStatusError(null);
    } catch (err) {
      setStatusError(toMessage(err));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const publish = useCallback(async () => {
    setPublishing(true);
    try {
      await publishPortfolio();
      toast.success('Published. The live website now shows your latest changes.');
      await refresh();
      return true;
    } catch (err) {
      toast.error(toMessage(err));
      return false;
    } finally {
      setPublishing(false);
    }
  }, [refresh, toast]);

  const value = useMemo(
    () => ({ status, statusError, unread, publishing, refresh, publish }),
    [status, statusError, unread, publishing, refresh, publish],
  );
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside <AdminProvider>');
  return ctx;
}
