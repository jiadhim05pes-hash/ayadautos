import { useEffect, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Save, ShieldAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, useIsSuperAdmin } from '@/hooks/use-auth';

export const Route = createFileRoute('/_authenticated/admin/settings')({
  component: SettingsPage,
});

interface SiteConfig {
  id: string;
  brand_name: string;
  tagline: string | null;
  logo_url: string | null;
  primary_color: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  currency: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

function SettingsPage() {
  const { user } = useAuth();
  const isSuper = useIsSuperAdmin(user?.id);
  const nav = useNavigate();
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const client = supabase as unknown as { from: (t: string) => any };
    client
      .from('site_config')
      .select('*')
      .eq('key', 'default')
      .maybeSingle()
      .then(({ data }: { data: SiteConfig | null }) => setConfig(data));
  }, []);

  if (isSuper === null) return <div className="p-10 text-sm text-muted-foreground">Loading…</div>;
  if (!isSuper) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <ShieldAlert className="w-10 h-10 text-accent mx-auto mb-3" />
        <h2 className="text-xl font-bold mb-2">Super admin only</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Site branding and rebranding settings are restricted to super admins.
        </p>
        <button
          onClick={() => nav({ to: '/admin' })}
          className="text-xs uppercase tracking-wider text-accent hover:underline"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  if (!config) return <div className="p-10 text-sm text-muted-foreground">Loading site config…</div>;

  async function save() {
    if (!config) return;
    setSaving(true);
    setSaved(false);
    const client = supabase as unknown as { from: (t: string) => any };
    const { id, ...rest } = config;
    const { error } = await client.from('site_config').update(rest).eq('id', id);
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="display-font text-2xl font-bold mb-1">Site Settings & Rebranding</h2>
      <p className="text-sm text-muted-foreground mb-6">
        These values apply globally across the storefront. Perfect for cloning the platform to a new dealership.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Brand name" value={config.brand_name} onChange={(v) => setConfig({ ...config, brand_name: v })} />
        <Field label="Tagline" value={config.tagline ?? ''} onChange={(v) => setConfig({ ...config, tagline: v })} />
        <Field label="Logo URL" value={config.logo_url ?? ''} onChange={(v) => setConfig({ ...config, logo_url: v })} />
        <Field label="Primary color" value={config.primary_color ?? ''} onChange={(v) => setConfig({ ...config, primary_color: v })} />
        <Field label="Phone" value={config.phone ?? ''} onChange={(v) => setConfig({ ...config, phone: v })} />
        <Field label="WhatsApp (digits only)" value={config.whatsapp ?? ''} onChange={(v) => setConfig({ ...config, whatsapp: v })} />
        <Field label="Email" value={config.email ?? ''} onChange={(v) => setConfig({ ...config, email: v })} />
        <Field label="Address" value={config.address ?? ''} onChange={(v) => setConfig({ ...config, address: v })} />
        <Field label="Currency code" value={config.currency ?? ''} onChange={(v) => setConfig({ ...config, currency: v })} />
        <Field label="SEO title" value={config.seo_title ?? ''} onChange={(v) => setConfig({ ...config, seo_title: v })} />
        <div className="md:col-span-2">
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">SEO description</label>
          <textarea
            value={config.seo_description ?? ''}
            onChange={(e) => setConfig({ ...config, seo_description: e.target.value })}
            rows={3}
            className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => void save()}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-accent/90 disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save settings'}
        </button>
        {saved && <span className="text-xs uppercase tracking-wider text-accent">Saved ✓</span>}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
      />
    </div>
  );
}
