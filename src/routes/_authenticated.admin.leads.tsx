import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatKes } from '@/lib/inventory-data';
import type { LeadStatus } from '@/lib/db-types';

export const Route = createFileRoute('/_authenticated/admin/leads')({
  component: LeadsInbox,
});

const client = supabase as unknown as { from: (t: string) => any };

type TabKey = 'contact' | 'test_drive' | 'finance' | 'trade_in' | 'ai_chat';

const TABLES: Record<TabKey, { table: string; label: string }> = {
  contact: { table: 'contact_messages', label: 'Contact Messages' },
  test_drive: { table: 'test_drive_requests', label: 'Test Drive' },
  finance: { table: 'finance_requests', label: 'Finance' },
  trade_in: { table: 'trade_in_requests', label: 'Trade-In' },
  ai_chat: { table: 'ai_chat_leads', label: 'AI Chat Leads' },
};

const STATUSES: LeadStatus[] = ['new', 'in_progress', 'contacted', 'won', 'lost', 'archived'];

function LeadsInbox() {
  const [tab, setTab] = useState<TabKey>('contact');
  const qc = useQueryClient();

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['admin', 'leads', tab],
    queryFn: async () => {
      const { data, error } = await client.from(TABLES[tab].table).select('*').order('created_at', { ascending: false }).limit(200);
      if (error) throw error;
      return data as any[];
    },
  });

  async function updateStatus(id: string, status: LeadStatus) {
    const { error } = await client.from(TABLES[tab].table).update({ status }).eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Updated');
    qc.invalidateQueries({ queryKey: ['admin', 'leads', tab] });
    qc.invalidateQueries({ queryKey: ['admin', 'counts'] });
  }

  async function del(id: string) {
    if (!confirm('Delete this lead?')) return;
    const { error } = await client.from(TABLES[tab].table).delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Deleted');
    qc.invalidateQueries({ queryKey: ['admin', 'leads', tab] });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-4">
        {(Object.keys(TABLES) as TabKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-3 py-1.5 rounded text-xs uppercase tracking-wider font-semibold ${
              tab === k ? 'bg-accent text-accent-foreground' : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            {TABLES[k].label}
          </button>
        ))}
      </div>

      <div className="edge-card rounded-xl">
        {isLoading && <div className="p-6 text-sm text-muted-foreground">Loading…</div>}
        {!isLoading && rows.length === 0 && (
          <div className="p-6 text-sm text-muted-foreground text-center">No {TABLES[tab].label.toLowerCase()} yet.</div>
        )}
        {rows.length > 0 && (
          <div className="divide-y divide-border">
            {rows.map((r) => (
              <div key={r.id} className="p-4 hover:bg-white/[0.02]">
                <div className="flex flex-wrap justify-between gap-3 items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{r.name || r.email || 'AI Chat Lead'}</span>
                      {r.phone && (
                        <a href={`tel:${r.phone}`} className="text-xs text-accent hover:underline">{r.phone}</a>
                      )}
                      {r.email && (
                        <a href={`mailto:${r.email}`} className="text-xs text-muted-foreground hover:text-accent">{r.email}</a>
                      )}
                      <span className="text-xs text-muted-foreground">
                        · {new Date(r.created_at).toLocaleString()}
                      </span>
                    </div>
                    <LeadBody row={r} tab={tab} />
                  </div>
                  <div className="flex gap-2 items-center">
                    <select
                      value={r.status}
                      onChange={(e) => updateStatus(r.id, e.target.value as LeadStatus)}
                      className="text-xs bg-input border border-border rounded px-2 py-1"
                    >
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <button onClick={() => del(r.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LeadBody({ row: r, tab }: { row: any; tab: TabKey }) {
  return (
    <div className="mt-2 text-sm text-muted-foreground space-y-1">
      {tab === 'contact' && (
        <>
          {r.subject && <p className="text-foreground/90 font-medium">{r.subject}</p>}
          <p className="whitespace-pre-wrap">{r.message}</p>
        </>
      )}
      {tab === 'test_drive' && (
        <p>
          {r.vehicle_name && <span className="text-foreground">{r.vehicle_name}</span>}
          {r.preferred_date && <> · Preferred: {r.preferred_date}</>}
          {r.notes && <><br />{r.notes}</>}
        </p>
      )}
      {tab === 'finance' && (
        <p>
          {r.vehicle_name && <span className="text-foreground">{r.vehicle_name}</span>}
          {r.vehicle_price != null && <> · Price {formatKes(Number(r.vehicle_price))}</>}
          {r.deposit != null && <> · Deposit {formatKes(Number(r.deposit))}</>}
          {r.term_months && <> · {r.term_months} months</>}
        </p>
      )}
      {tab === 'trade_in' && (
        <p>
          <span className="text-foreground">{r.make} {r.model}</span>
          {r.year && <> · {r.year}</>}
          {r.mileage_km != null && <> · {r.mileage_km.toLocaleString()} km</>}
          {r.condition && <> · {r.condition}</>}
        </p>
      )}
      {tab === 'ai_chat' && (
        <p>
          {r.interested_vehicle && <>Interest: {r.interested_vehicle} · </>}
          {r.budget_kes != null && <>Budget: {formatKes(Number(r.budget_kes))} · </>}
          {r.language && <>Lang: {r.language} · </>}
          {r.escalated_to_human && <span className="text-accent">Escalated to human</span>}
        </p>
      )}
    </div>
  );
}
