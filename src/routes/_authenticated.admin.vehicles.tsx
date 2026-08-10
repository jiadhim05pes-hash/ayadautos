import { useState, useMemo, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Plus, Pencil, Trash2, Star, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatKes } from '@/lib/inventory-data';
import type { CategoryRow, VehicleRow, VehicleStatus, FuelType, Transmission, Registration } from '@/lib/db-types';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

export const Route = createFileRoute('/_authenticated/admin/vehicles')({
  component: AdminVehicles,
});

const client = supabase as unknown as { from: (t: string) => any; storage: any };

const STATUSES: VehicleStatus[] = ['available', 'reserved', 'sold', 'draft'];
const FUELS: FuelType[] = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
const TRANS: Transmission[] = ['Automatic', 'Manual'];
const REGS: Registration[] = ['Fresh Import', 'New Registration', 'Locally Used'];

const INTERIOR_MATERIALS = ['Leather', 'Premium Fabric', 'Alcantara', 'Cloth', 'Synthetic Leather'];

type FormState = {
  id?: string;
  name: string; make: string; model: string; year: number;
  price_kes: number; category_id: string | null;
  fuel: FuelType; transmission: Transmission;
  mileage_km: number; registration: Registration;
  description: string; primary_image: string;
  featured: boolean; status: VehicleStatus; slug: string;
  engine: string; exterior_color: string;
  interior_color: string; interior_material: string;
  features: string;
};

const empty: FormState = {
  name: '', make: '', model: '', year: new Date().getFullYear(),
  price_kes: 0, category_id: null,
  fuel: 'Petrol', transmission: 'Automatic',
  mileage_km: 0, registration: 'Locally Used',
  description: '', primary_image: '',
  featured: false, status: 'available', slug: '',
  engine: '', exterior_color: '',
  interior_color: '', interior_material: '',
  features: '',
};

function parseFeatures(s: string): string[] {
  return s.split(',').map((x) => x.trim()).filter(Boolean);
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

function AdminVehicles() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<FormState | null>(null);

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['admin', 'vehicles'],
    queryFn: async () => {
      const { data, error } = await client.from('vehicles').select('*').order('sort_order');
      if (error) throw error;
      return data as VehicleRow[];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async () => {
      const { data, error } = await client.from('categories').select('*').order('sort_order');
      if (error) throw error;
      return data as CategoryRow[];
    },
  });

  const catMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  async function save(f: FormState): Promise<void> {
    const payload = {
      name: f.name, make: f.make, model: f.model, year: Number(f.year),
      price_kes: Number(f.price_kes), category_id: f.category_id || null,
      fuel: f.fuel, transmission: f.transmission,
      mileage_km: Number(f.mileage_km) || 0, registration: f.registration,
      description: f.description || null,
      primary_image: f.primary_image || null,
      featured: f.featured, status: f.status,
      engine: f.engine.trim() || null,
      exterior_color: f.exterior_color.trim() || null,
      interior_color: f.interior_color.trim() || null,
      interior_material: f.interior_material || null,
      features: parseFeatures(f.features),
      slug: f.slug || slugify(f.name + '-' + f.year),
    };
    const { error } = f.id
      ? await client.from('vehicles').update(payload).eq('id', f.id)
      : await client.from('vehicles').insert(payload);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(f.id ? 'Vehicle updated' : 'Vehicle added');
    setEditing(null);
    qc.invalidateQueries({ queryKey: ['admin', 'vehicles'] });
    qc.invalidateQueries({ queryKey: ['vehicles'] });
  }

  async function del(id: string) {
    if (!confirm('Delete this vehicle?')) return;
    const { error } = await client.from('vehicles').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Deleted');
    qc.invalidateQueries({ queryKey: ['admin', 'vehicles'] });
    qc.invalidateQueries({ queryKey: ['vehicles'] });
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">Vehicles</h2>
          <p className="text-sm text-muted-foreground">{vehicles.length} vehicles</p>
        </div>
        <Button onClick={() => setEditing({ ...empty })} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="w-4 h-4 mr-1" /> Add Vehicle
        </Button>
      </div>

      <div className="overflow-x-auto edge-card rounded-xl">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
            <tr>
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">Loading…</td></tr>
            )}
            {vehicles.map((v) => (
              <tr key={v.id} className="border-b border-border/50 hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {v.primary_image ? (
                      <img src={v.primary_image} className="w-12 h-9 rounded object-cover" alt="" />
                    ) : (
                      <div className="w-12 h-9 rounded bg-muted" />
                    )}
                    <div>
                      <div className="font-semibold">{v.name}</div>
                      <div className="text-xs text-muted-foreground">{v.year} · {v.mileage_km.toLocaleString()} km</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{catMap[v.category_id ?? ''] ?? '—'}</td>
                <td className="px-4 py-3">{formatKes(Number(v.price_kes))}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs uppercase font-semibold px-2 py-1 rounded ${
                    v.status === 'available' ? 'bg-green-500/15 text-green-400'
                    : v.status === 'reserved' ? 'bg-amber-500/15 text-amber-400'
                    : v.status === 'sold' ? 'bg-red-500/15 text-red-400'
                    : 'bg-white/10 text-white/70'
                  }`}>{v.status}</span>
                </td>
                <td className="px-4 py-3">{v.featured && <Star className="w-4 h-4 fill-accent text-accent" />}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-end">
                    <button
                      onClick={() => setEditing({
                        id: v.id, name: v.name, make: v.make, model: v.model, year: v.year,
                        price_kes: Number(v.price_kes), category_id: v.category_id,
                        fuel: v.fuel, transmission: v.transmission,
                        mileage_km: v.mileage_km, registration: v.registration,
                        description: v.description ?? '', primary_image: v.primary_image ?? '',
                        featured: v.featured, status: v.status, slug: v.slug,
                        engine: v.engine ?? '', exterior_color: v.exterior_color ?? '',
                        interior_color: v.interior_color ?? '',
                        interior_material: v.interior_material ?? '',
                        features: Array.isArray(v.features) ? v.features.join(', ') : '',
                      })}
                      className="p-2 rounded hover:bg-white/10"
                      aria-label="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => del(v.id)} className="p-2 rounded hover:bg-white/10 text-red-400" aria-label="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <VehicleDialog
          form={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  );
}

function VehicleDialog({
  form: initial, categories, onClose, onSave,
}: {
  form: FormState;
  categories: CategoryRow[];
  onClose: () => void;
  onSave: (f: FormState) => Promise<void>;
}) {
  const [f, setF] = useState<FormState>(initial);
  const [uploading, setUploading] = useState(false);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setF((s) => ({ ...s, [k]: v }));

  async function upload(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await client.storage.from('vehicle-images').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (error) throw error;
      const { data } = client.storage.from('vehicle-images').getPublicUrl(path);
      set('primary_image', data.publicUrl);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    onSave(f);
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{f.id ? 'Edit vehicle' : 'Add vehicle'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Display name"><Input value={f.name} onChange={(e) => set('name', e.target.value)} required /></Field>
            <Field label="Slug (URL)"><Input value={f.slug} onChange={(e) => set('slug', e.target.value)} placeholder="auto from name" /></Field>
            <Field label="Make"><Input value={f.make} onChange={(e) => set('make', e.target.value)} required /></Field>
            <Field label="Model"><Input value={f.model} onChange={(e) => set('model', e.target.value)} required /></Field>
            <Field label="Year"><Input type="number" value={f.year} onChange={(e) => set('year', Number(e.target.value))} required /></Field>
            <Field label="Price (KES)"><Input type="number" value={f.price_kes} onChange={(e) => set('price_kes', Number(e.target.value))} required /></Field>
            <Field label="Category">
              <select className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm" value={f.category_id ?? ''} onChange={(e) => set('category_id', e.target.value || null)}>
                <option value="">— none —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Mileage (km)"><Input type="number" value={f.mileage_km} onChange={(e) => set('mileage_km', Number(e.target.value))} /></Field>
            <Field label="Fuel">
              <select className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm" value={f.fuel} onChange={(e) => set('fuel', e.target.value as FuelType)}>
                {FUELS.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <Field label="Transmission">
              <select className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm" value={f.transmission} onChange={(e) => set('transmission', e.target.value as Transmission)}>
                {TRANS.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <Field label="Registration">
              <select className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm" value={f.registration} onChange={(e) => set('registration', e.target.value as Registration)}>
                {REGS.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm" value={f.status} onChange={(e) => set('status', e.target.value as VehicleStatus)}>
                {STATUSES.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <Field label="Engine"><Input value={f.engine} onChange={(e) => set('engine', e.target.value)} placeholder="2.8L 4-Cylinder Turbo Diesel" /></Field>
            <Field label="Exterior color"><Input value={f.exterior_color} onChange={(e) => set('exterior_color', e.target.value)} placeholder="Pearl White" /></Field>
            <Field label="Interior color"><Input value={f.interior_color} onChange={(e) => set('interior_color', e.target.value)} placeholder="Black / Beige" /></Field>
            <Field label="Interior material">
              <select className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm" value={f.interior_material} onChange={(e) => set('interior_material', e.target.value)}>
                <option value="">— none —</option>
                {INTERIOR_MATERIALS.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Key features (comma separated)">
            <Textarea rows={2} value={f.features} onChange={(e) => set('features', e.target.value)} placeholder="Sunroof, Adaptive Cruise Control, 360 Camera, Heated Seats" />
            {parseFeatures(f.features).length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {parseFeatures(f.features).map((t) => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded-full border border-accent/40 text-accent bg-accent/10">{t}</span>
                ))}
              </div>
            )}
          </Field>

          <Field label="Description">
            <Textarea rows={3} value={f.description} onChange={(e) => set('description', e.target.value)} />
          </Field>


          <Field label="Primary image">
            <div className="space-y-2">
              {f.primary_image && (
                <div className="relative inline-block">
                  <img src={f.primary_image} className="h-24 rounded object-cover" alt="" />
                  <button type="button" onClick={() => set('primary_image', '')} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1" aria-label="Remove">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              )}
              <div className="flex gap-2 items-center">
                <label className="inline-flex items-center gap-2 border border-dashed border-border hover:border-accent rounded-md px-3 py-2 cursor-pointer text-sm">
                  <Upload className="w-4 h-4" /> {uploading ? 'Uploading…' : 'Upload image'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                </label>
                <Input placeholder="…or paste image URL" value={f.primary_image} onChange={(e) => set('primary_image', e.target.value)} />
              </div>
            </div>
          </Field>

          <div className="flex items-center gap-3">
            <Switch id="feat" checked={f.featured} onCheckedChange={(v) => set('featured', v)} />
            <Label htmlFor="feat">Featured on homepage</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
              {f.id ? 'Save changes' : 'Add vehicle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
