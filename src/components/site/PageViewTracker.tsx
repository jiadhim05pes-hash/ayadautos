import { useEffect } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';

const SESSION_KEY = 'ayad-visit-session';

function getVisitSession() {
  if (typeof window === 'undefined') return '';
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/**
 * Fires a single page_views row per client-side route change.
 * Best-effort — failures are swallowed to never disrupt the storefront.
 */
export function PageViewTracker() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Skip admin pages — internal traffic pollutes analytics.
    if (pathname.startsWith('/admin') || pathname.startsWith('/_')) return;
    const client = supabase as unknown as { from: (t: string) => any };
    client
      .from('page_views')
      .insert({
        path: pathname,
        referrer: document.referrer || null,
        session_id: getVisitSession(),
        user_agent: navigator.userAgent.slice(0, 300),
      })
      .then(() => {}, () => {});
  }, [pathname]);

  return null;
}
