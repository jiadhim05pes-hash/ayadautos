import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Car, Inbox, MessageCircle, DollarSign, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/_authenticated/admin/')({
  component: AdminDashboard,
});

const client = supabase as unknown as { from: (t: string) => any };

async function count(table: string, filter?: Record<string, string>) {
  let q = client.from(table).select('id', { count: 'exact', head: true });
  if (filter) for (const [k, v] of Object.entries(filter)) q = q.eq(k, v);
  const { count: c, error } = await q;
  if (error) throw error;
  return c ?? 0;
}

function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ['admin', 'counts'],
    queryFn: async () => ({
      vehicles: await count('vehicles'),
      available: await count('vehicles', { status: 'available' }),
      featured: await count('vehicles', { featured: 'true' }),
      contacts: await count('contact_messages', { status: 'new' }),
      testDrives: await count('test_drive_requests', { status: 'new' }),
      finance: await count('finance_requests', { status: 'new' }),
      tradeIns: await count('trade_in_requests', { status: 'new' }),
      aiLeads: await count('ai_chat_leads', { status: 'new' }),
    }),
    staleTime: 30_000,
  });

  const cards = [
    { label: 'Total Vehicles', value: data?.vehicles ?? '…', icon: Car, to: '/admin/vehicles' },
    { label: 'Available Now', value: data?.available ?? '…', icon: Car, to: '/admin/vehicles' },
    { label: 'Featured', value: data?.featured ?? '…', icon: Car, to: '/admin/vehicles' },
    { label: 'New Contact Messages', value: data?.contacts ?? '…', icon: MessageCircle, to: '/admin/leads' },
    { label: 'New Test Drive Requests', value: data?.testDrives ?? '…', icon: Inbox, to: '/admin/leads' },
    { label: 'New Finance Requests', value: data?.finance ?? '…', icon: DollarSign, to: '/admin/leads' },
    { label: 'New Trade-In Requests', value: data?.tradeIns ?? '…', icon: RefreshCw, to: '/admin/leads' },
    { label: 'New AI Chat Leads', value: data?.aiLeads ?? '…', icon: MessageCircle, to: '/admin/leads' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Link
          key={c.label}
          to={c.to}
          className="edge-card rounded-xl p-5 hover:border-accent transition-colors"
        >
          <c.icon className="w-6 h-6 text-accent mb-3" />
          <div className="text-3xl font-bold">{c.value}</div>
          <div className="text-[0.7rem] uppercase tracking-wider text-muted-foreground mt-1">
            {c.label}
          </div>
        </Link>
      ))}
    </div>
  );
}
