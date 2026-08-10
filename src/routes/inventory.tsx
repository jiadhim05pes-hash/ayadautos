import { useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { type VehicleCategory } from '@/lib/inventory-data';
import { useVehicles } from '@/hooks/use-vehicles';
import { PageHero } from '@/components/site/PageHero';
import { PremiumVehicleCard } from '@/components/site/PremiumVehicleCard';
import { InventorySearchBar } from '@/components/site/InventorySearchBar';

export interface InventorySearch {
  make?: string;
  model?: string;
  body?: string;
  fuel?: string;
  trans?: string;
  min?: number;
  max?: number;
}

export const Route = createFileRoute('/inventory')({
  validateSearch: (s: Record<string, unknown>): InventorySearch => ({
    make: typeof s.make === 'string' ? s.make : undefined,
    model: typeof s.model === 'string' ? s.model : undefined,
    body: typeof s.body === 'string' ? (s.body as string) : undefined,
    fuel: typeof s.fuel === 'string' ? (s.fuel as string) : undefined,
    trans: typeof s.trans === 'string' ? (s.trans as string) : undefined,
    min: typeof s.min === 'number' ? s.min : undefined,
    max: typeof s.max === 'number' ? s.max : undefined,
  }),
  head: () => ({
    meta: [
      { title: 'Inventory — Ayad Automotives' },
      { name: 'description', content: 'Browse premium vehicles for sale: SUVs, sedans, luxury, family cars and hatchbacks.' },
      { property: 'og:title', content: 'Inventory — Ayad Automotives' },
      { property: 'og:description', content: 'Browse our premium vehicle inventory.' },
      { property: 'og:url', content: '/inventory' },
    ],
    links: [{ rel: 'canonical', href: '/inventory' }],
  }),
  component: InventoryPage,
});

const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'year-desc', label: 'Newest Year' },
] as const;

function InventoryPage() {
  const sp = Route.useSearch();
  const [sort, setSort] = useState<(typeof SORTS)[number]['id']>('featured');
  const { data: vehicles } = useVehicles();

  const filtered = useMemo(() => {
    let list = vehicles.filter((v) => {
      if (sp.make && v.make !== sp.make) return false;
      if (sp.model && v.model !== sp.model) return false;
      if (sp.body && (v.category as string) !== sp.body) return false;
      if (sp.fuel && (v.fuel as string) !== sp.fuel) return false;
      if (sp.trans && (v.transmission as string) !== sp.trans) return false;
      if (sp.min && v.priceKes < sp.min) return false;
      if (sp.max && v.priceKes > sp.max) return false;
      return true;
    });
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.priceKes - b.priceKes);
    else if (sort === 'price-desc') list = [...list].sort((a, b) => b.priceKes - a.priceKes);
    else if (sort === 'year-desc') list = [...list].sort((a, b) => b.year - a.year);
    else list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    return list;
  }, [sp, sort, vehicles]);

  const activeFilters = [sp.make, sp.model, sp.body, sp.fuel, sp.trans].filter(Boolean) as string[];

  return (
    <>
      <PageHero
        eyebrow="Inventory"
        title="Our Vehicles"
        subtitle="Premium imports and locally available vehicles."
      />
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <InventorySearchBar />

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {activeFilters.length === 0 ? (
                <span className="text-sm text-muted-foreground">Showing all {filtered.length} vehicles</span>
              ) : (
                activeFilters.map((f) => (
                  <span
                    key={f}
                    className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent"
                  >
                    {f}
                  </span>
                ))
              )}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground"
              aria-label="Sort inventory"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          <div id="grid" className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((v) => (
              <PremiumVehicleCard key={v.id} vehicle={v} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No vehicles match your filters.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
