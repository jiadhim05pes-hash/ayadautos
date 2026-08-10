import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { mapVehicleRow, type Vehicle } from '@/lib/inventory-data';
import type { VehicleRow, CategoryRow } from '@/lib/db-types';

type Row = VehicleRow & { categories: { name: string } | null };

async function fetchVehicles(opts: { featuredOnly?: boolean; limit?: number } = {}) {
  const client = supabase as unknown as {
    from: (t: string) => any;
  };
  let q = client
    .from('vehicles')
    .select('*, categories ( name )')
    .in('status', ['available', 'reserved'])
    .order('featured', { ascending: false })
    .order('sort_order', { ascending: true });
  if (opts.featuredOnly) q = q.eq('featured', true);
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data as Row[]).map((r) => mapVehicleRow(r, r.categories?.name));
}

export function useVehicles(): { data: Vehicle[]; isLoading: boolean; error: unknown } {
  const { data, isLoading, error } = useQuery({
    queryKey: ['vehicles', 'public'],
    queryFn: () => fetchVehicles(),
    staleTime: 60_000,
  });
  return { data: data ?? [], isLoading, error };
}

export function useFeaturedVehicles(limit = 6) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['vehicles', 'featured', limit],
    queryFn: () => fetchVehicles({ featuredOnly: true, limit }),
    staleTime: 60_000,
  });
  return { data: data ?? [], isLoading, error };
}

export interface VehicleDetail extends Vehicle {
  description: string | null;
  features: string[];
  images: string[];
  engine: string | null;
  exteriorColor: string | null;
  interiorColor: string | null;
  interiorMaterial: string | null;
}

async function fetchVehicleBySlug(slug: string): Promise<VehicleDetail | null> {
  const client = supabase as unknown as { from: (t: string) => any };
  const { data, error } = await client
    .from('vehicles')
    .select('*, categories ( name ), vehicle_images ( url, sort_order )')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as Row & { vehicle_images: { url: string; sort_order: number }[] | null };
  const base = mapVehicleRow(row, row.categories?.name);
  const gallery = (row.vehicle_images ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((i) => i.url);
  return {
    ...base,
    description: row.description ?? null,
    features: Array.isArray(row.features) ? (row.features as string[]) : [],
    images: [base.image, ...gallery.filter((u) => u && u !== base.image)],
  };
}

export function useVehicleBySlug(slug: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['vehicle', slug],
    queryFn: () => fetchVehicleBySlug(slug),
    staleTime: 60_000,
  });
  return { data: data ?? null, isLoading, error };
}

export function useCategories() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const client = supabase as unknown as { from: (t: string) => any };
      const { data, error } = await client
        .from('categories')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as CategoryRow[];
    },
    staleTime: 5 * 60_000,
  });
  return { data: data ?? [], isLoading, error };
}
