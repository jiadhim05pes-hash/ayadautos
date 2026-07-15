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

export function useIsStaff(userId?: string | null) {
  const [isStaff, setIsStaff] = useState<boolean | null>(null);
  useEffect(() => {
    if (!userId) {
      setIsStaff(false);
      return;
    }
    const client = supabase as unknown as { from: (t: string) => any };
    client
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .in('role', ['admin', 'staff'])
      .then(({ data }: { data: unknown }) => {
        setIsStaff(Array.isArray(data) && data.length > 0);
      });
  }, [userId]);
  return isStaff;
}
