import { createFileRoute, Link } from '@tanstack/react-router';
import { PageHero } from '@/components/site/PageHero';
import { PremiumVehicleCard } from '@/components/site/PremiumVehicleCard';
import { useVehicleList } from '@/hooks/use-vehicle-lists';
import { useVehicles } from '@/hooks/use-vehicles';
import { formatKes } from '@/lib/inventory-data';
import { Heart, GitCompare, Trash2, ArrowRight } from 'lucide-react';

export const Route = createFileRoute('/favorites')({
  head: () => ({
    meta: [
      { title: 'Favourites & Compare — Ayad Automotives' },
      { name: 'description', content: 'Your saved vehicles and side-by-side comparison.' },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const favs = useVehicleList('favorites');
  const comp = useVehicleList('compare');

  const favVehicles = vehicles.filter((v) => favs.has(v.id));
  const compVehicles = vehicles.filter((v) => comp.has(v.id));

  return (
    <>
      <PageHero
        eyebrow="My Garage"
        title="Favourites & Compare"
        subtitle="Save vehicles for later and compare specs side-by-side."
      />

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <SectionHeader
            icon={<Heart className="h-5 w-5" />}
            title="Saved Favourites"
            count={favs.count}
            onClear={favs.clear}
          />
          {favVehicles.length === 0 ? (
            <EmptyState label="You haven't saved any vehicles yet." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favVehicles.map((v) => (
                <PremiumVehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-card">
        <div className="container mx-auto px-4 max-w-6xl">
          <SectionHeader
            icon={<GitCompare className="h-5 w-5" />}
            title="Compare Vehicles"
            count={comp.count}
            onClear={comp.clear}
          />
          {compVehicles.length === 0 ? (
            <EmptyState label="Add up to 4 vehicles to compare." />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-white/[0.03] text-left text-[0.65rem] uppercase tracking-widest text-white/50">
                  <tr>
                    <th className="p-4">Spec</th>
                    {compVehicles.map((v) => (
                      <th key={v.id} className="p-4 text-white">{v.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] text-white/85">
                  {[
                    ['Year', (v: typeof compVehicles[number]) => v.year],
                    ['Price', (v: typeof compVehicles[number]) => formatKes(v.priceKes)],
                    ['Body', (v: typeof compVehicles[number]) => v.category],
                    ['Fuel', (v: typeof compVehicles[number]) => v.fuel],
                    ['Transmission', (v: typeof compVehicles[number]) => v.transmission],
                    ['Mileage', (v: typeof compVehicles[number]) => `${v.mileageKm.toLocaleString()} km`],
                    ['Registration', (v: typeof compVehicles[number]) => v.registration],
                  ].map(([label, get]) => (
                    <tr key={label as string}>
                      <td className="p-4 text-white/50 uppercase text-[0.7rem] tracking-wider">{label as string}</td>
                      {compVehicles.map((v) => (
                        <td key={v.id} className="p-4">{(get as (v: typeof compVehicles[number]) => React.ReactNode)(v)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 text-center">
        <Link
          to="/inventory"
          className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-md font-semibold"
        >
          Browse full inventory <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </>
  );
}

function SectionHeader({
  icon, title, count, onClear,
}: { icon: React.ReactNode; title: string; count: number; onClear: () => void }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-accent">{icon}</span>
        <h2 className="display-font text-xl font-bold text-white">{title}</h2>
        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs text-white/70">{count}</span>
      </div>
      {count > 0 && (
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-white/60 hover:text-accent"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear
        </button>
      )}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
