import { useMemo } from 'react';
import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router';
import { LayoutDashboard, Car, Inbox, LogOut, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, useIsStaff } from '@/hooks/use-auth';
import { dealership } from '@/config/dealership';

export const Route = createFileRoute('/_authenticated/admin')({
  component: AdminLayout,
});

const TABS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/vehicles', label: 'Vehicles', icon: Car },
  { to: '/admin/leads', label: 'Leads', icon: Inbox },
] as const;

function AdminLayout() {
  const { user } = useAuth();
  const isStaff = useIsStaff(user?.id);
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const active = useMemo(() => pathname, [pathname]);

  if (isStaff === null) {
    return <div className="p-10 text-muted-foreground text-sm">Loading permissions…</div>;
  }
  if (!isStaff) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl text-center">
        <h1 className="text-2xl font-bold mb-3">Access denied</h1>
        <p className="text-muted-foreground mb-6">
          You're signed in as <span className="text-foreground">{user?.email}</span> but you don't have
          staff access to the {dealership.brand.name} dashboard. Ask an administrator to grant you
          the <code className="text-accent">admin</code> or <code className="text-accent">staff</code> role.
        </p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="inline-flex items-center gap-2 border border-border hover:border-accent px-5 py-2.5 rounded-md text-sm font-semibold"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-accent mb-1">Dashboard</p>
            <h1 className="display-font text-3xl md:text-4xl font-bold">{dealership.brand.displayName}</h1>
          </div>
          <div className="flex gap-2 items-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-white/70 hover:text-accent"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View site
            </Link>
            <button
              onClick={() => supabase.auth.signOut()}
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-white/70 hover:text-accent"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </div>

        <nav className="flex flex-wrap gap-1 border-b border-border mb-6">
          {TABS.map(({ to, label, icon: Icon }) => {
            const isActive = active === to || (to !== '/admin' && active.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors ${
                  isActive
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </Link>
            );
          })}
        </nav>

        <Outlet />
      </div>
    </div>
  );
}
