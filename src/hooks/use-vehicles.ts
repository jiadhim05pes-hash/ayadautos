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
