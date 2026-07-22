import { useEffect, useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Download, Eye, MessageSquare, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/_authenticated/admin/analytics')({
  component: AnalyticsPage,
});

interface PageView {
  path: string;
  referrer: string | null;
  session_id: string | null;
  created_at: string;
}

interface Lead {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  escalated_to_human: boolean | null;
  created_at: string;
}

function AnalyticsPage() {
  const [views, setViews] = useState<PageView[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const client = supabase as unknown as { from: (t: string) => any };
    const since = new Date(Date.now() - 30 * 86400e3).toISOString();
    client
      .from('page_views')
      .select('path, referrer, session_id, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(5000)
      .then(({ data }: { data: PageView[] | null }) => setViews(data ?? []));
    client
      .from('ai_chat_leads')
      .select('id, name, phone, email, escalated_to_human, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .then(({ data }: { data: Lead[] | null }) => setLeads(data ?? []));
  }, []);

  const stats = useMemo(() => {
    const uniqueSessions = new Set(views.map((v) => v.session_id).filter(Boolean)).size;
    const topPaths = Object.entries(
      views.reduce<Record<string, number>>((acc, v) => {
        acc[v.path] = (acc[v.path] ?? 0) + 1;
        return acc;
      }, {}),
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    const escalated = leads.filter((l) => l.escalated_to_human).length;
    return { totalViews: views.length, uniqueSessions, topPaths, totalLeads: leads.length, escalated };
  }, [views, leads]);

  function exportCsv() {
    const header = 'created_at,name,phone,email,escalated\n';
    const rows = leads
      .map((l) => [l.created_at, l.name ?? '', l.phone ?? '', l.email ?? '', l.escalated_to_human ? 'yes' : 'no'].map(csv).join(','))
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blaze-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="display-font text-2xl font-bold">Analytics</h2>
          <p className="text-sm text-muted-foreground">Last 30 days · visitors, Blaze performance & top pages.</p>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 border border-border hover:border-accent px-4 py-2 rounded-md text-xs uppercase tracking-wider font-semibold"
        >
          <Download className="w-4 h-4" /> Export leads CSV
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Eye className="w-4 h-4" />} label="Page views" value={stats.totalViews} />
        <StatCard icon={<Users className="w-4 h-4" />} label="Unique visitors" value={stats.uniqueSessions} />
        <StatCard icon={<MessageSquare className="w-4 h-4" />} label="Blaze leads" value={stats.totalLeads} />
        <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Escalated" value={stats.escalated} />
      </div>

      <div className="rounded-xl border border-border bg-white/[0.02] p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 mb-4">Top pages</h3>
        {stats.topPaths.length === 0 ? (
          <p className="text-xs text-muted-foreground">No page views recorded yet.</p>
        ) : (
          <ul className="space-y-2">
            {stats.topPaths.map(([path, count]) => (
              <li key={path} className="flex items-center justify-between text-sm border-b border-white/5 pb-2 last:border-0">
                <code className="text-white/80">{path}</code>
                <span className="text-accent font-semibold">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 text-accent mb-2">{icon}<span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">{label}</span></div>
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
    </div>
  );
}

function csv(v: string) {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}
