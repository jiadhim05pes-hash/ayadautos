import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user, loading, signOut: () => supabase.auth.signOut() };
}

function useRoles(userId?: string | null) {
  const [roles, setRoles] = useState<string[] | null>(null);
  useEffect(() => {
    if (!userId) {
      setRoles([]);
      return;
    }
    const client = supabase as unknown as { from: (t: string) => any };
    client
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .then(({ data }: { data: unknown }) => {
        setRoles(Array.isArray(data) ? (data as { role: string }[]).map((r) => r.role) : []);
      });
  }, [userId]);
  return roles;
}

export function useIsStaff(userId?: string | null) {
  const roles = useRoles(userId);
  if (roles === null) return null;
  return roles.some((r) => r === 'admin' || r === 'staff' || r === 'super_admin');
}

export function useIsSuperAdmin(userId?: string | null) {
  const roles = useRoles(userId);
  if (roles === null) return null;
  return roles.includes('super_admin');
}
