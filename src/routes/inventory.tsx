import { useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Search } from 'lucide-react';
import { vehicles, formatKes, waLink, type VehicleCategory } from '@/lib/inventory-data';
import { PageHero } from '@/components/site/PageHero';

export const Route = createFileRoute('/inventory')({
  head: () => ({
    meta: [
      { title: 'Inventory — Ayad Automotives' },
      { name: 'description', content: 'Browse premium vehicles for sale: SUVs, sedans, luxury, family cars and hatchbacks. Filter by category, fuel, and price.' },
      { property: 'og:title', content: 'Inventory — Ayad Automotives' },
      { property: 'og:description', content: 'Browse our premium vehicle inventory.' },
      { property: 'og:url', content: '/inventory' },
    ],
    links: [{ rel: 'canonical', href: '/inventory' }],
  }),
  component: InventoryPage,
});

const CATEGORIES: Array<'All' | VehicleCategory> = ['All', 'SUV', 'Sedan', 'Luxury', 'Family Car', 'Hatchback'];
const FUELS = ['All', 'Petrol', 'Diesel', 'Hybrid', 'Electric'] as const;
const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'year-desc', label: 'Newest Year' },
] as const;

function InventoryPage() {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>('All');
  const [fuel, setFuel] = useState<(typeof FUELS)[number]>('All');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<(typeof SORTS)[number]['id']>('featured');

  const filtered = useMemo(() => {
    let list = vehicles.filter(v =>
      (cat === 'All' || v.category === cat) &&
      (fuel === 'All' || v.fuel === fuel) &&
      (q.trim() === '' || `${v.make} ${v.model} ${v.name}`.toLowerCase().includes(q.toLowerCase()))
    );
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.priceKes - b.priceKes);
    else if (sort === 'price-desc') list = [...list].sort((a, b) => b.priceKes - a.priceKes);
    else if (sort === 'year-desc') list = [...list].sort((a, b) => b.year - a.year);
    else list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    return list;
  }, [cat, fuel, q, sort]);

  return (
    <>
      <PageHero
        eyebrow="Inventory"
        title="Our Vehicles"
        subtitle="Premium imports and locally available vehicles. Filter, search, and inquire on WhatsApp."
      />
      <section className="py-10 bg-background">
        <div className="container mx-auto px-4">
          {/* Search + sort */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="search"
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search make or model..."
                className="w-full bg-input border border-border rounded-md pl-10 pr-3 py-2.5 text-foreground placeholder:text-muted-foreground"
                aria-label="Search inventory"
              />
            </div>
            <select
              value={sort}
              onChange={e => setSort(e.target.value as typeof sort)}
              className="bg-input border border-border rounded-md px-3 py-2.5 text-foreground"
              aria-label="Sort inventory"
            >
              {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2 mb-3">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  cat === c ? 'bg-accent text-accent-foreground border-accent' : 'bg-card text-foreground/80 border-border hover:border-accent'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          {/* Fuel chips */}
          <div className="flex flex-wrap gap-2 mb-8">
            {FUELS.map(f => (
              <button
                key={f}
                onClick={() => setFuel(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                  fuel === f ? 'bg-accent/20 text-accent border-accent' : 'bg-card text-muted-foreground border-border hover:border-accent'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <p className="text-sm text-muted-foreground mb-4">{filtered.length} vehicle{filtered.length === 1 ? '' : 's'}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(v => (
              <Card key={v.id} className="edge-card overflow-hidden group py-0">
                <div className="relative h-52 overflow-hidden bg-card">
                  <img src={v.image} alt={v.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-bold">{v.year}</div>
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-white">{v.registration}</div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-lg text-white leading-tight">{v.name}</h3>
                    <span className="shrink-0 text-xs font-semibold accent-red border border-accent/40 rounded-md px-2 py-0.5">{v.year}</span>
                  </div>
                  <p className="text-xs text-white/60 mb-2">Year of production: <span className="text-white/90 font-medium">{v.year}</span></p>
                  <p className="text-2xl font-bold accent-red mb-3">{formatKes(v.priceKes)}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-white/70 mb-4 pb-4 border-b border-white/10">
                    <span><span className="text-white/50">Fuel: </span>{v.fuel}</span>
                    <span><span className="text-white/50">Trans: </span>{v.transmission}</span>
                    <span><span className="text-white/50">Mileage: </span>{v.mileageKm.toLocaleString()} km</span>
                    <span><span className="text-white/50">Type: </span>{v.category}</span>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={waLink(`Hello! I'm interested in the ${v.name} (${formatKes(v.priceKes)}). Please share more details and financing options.`)}
                      target="_blank" rel="noopener noreferrer"
                      className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-4 py-2 rounded-md flex items-center justify-center gap-2 text-sm"
                    >
                      <MessageCircle className="w-4 h-4" /> Inquire
                    </a>
                    <Button asChild variant="outline" className="flex-1 border-accent text-accent hover:bg-accent/10">
                      <a href={`/financing?price=${v.priceKes}`}>Finance</a>
                    </Button>
                  </div>
                </div>
              </Card>
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
