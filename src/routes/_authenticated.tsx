import { useEffect } from 'react';
import { createFileRoute, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { useAuth } from '@/hooks/use-auth';

export const Route = createFileRoute('/_authenticated')({
  ssr: false,
  component: AuthGate,
});

function AuthGate() {
  const nav = useNavigate();
  const { session, loading } = useAuth();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  useEffect(() => {
    if (!loading && !session) {
      nav({ to: '/auth', search: { redirect: pathname }, replace: true });
    }
  }, [loading, session, nav, pathname]);

  if (loading || !session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }
  return <Outlet />;
}
