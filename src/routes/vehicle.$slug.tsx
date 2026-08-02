import { useEffect, useState } from 'react';
import { Link, createFileRoute } from '@tanstack/react-router';
import {
  ArrowLeft,
  Calculator,
  CalendarCheck,
  Car as CarIcon,
  Check,
  Cog,
  Fuel,
  Gauge,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { useVehicleBySlug, useVehicles } from '@/hooks/use-vehicles';
import { formatKes, stockId, waLink } from '@/lib/inventory-data';
import { PremiumVehicleCard } from '@/components/site/PremiumVehicleCard';
import { openBlaze } from '@/hooks/use-blaze-chat';

const RECENT_KEY = 'ayad.recentlyViewed';

export const Route = createFileRoute('/vehicle/$slug')({
  head: ({ params }) => {
    const pretty = params.slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    const url = `https://ayadautos.lovable.app/vehicle/${params.slug}`;
    return {
      meta: [
        { title: `${pretty} — Ayad Automotives` },
        {
          name: 'description',
          content: `${pretty} for sale at Ayad Automotives, Ngong Road Nairobi. View specs, pricing, financing and book a test drive.`,
        },
        { property: 'og:title', content: `${pretty} — Ayad Automotives` },
        {
          property: 'og:description',
          content: `${pretty} available now at Ayad Automotives, Nairobi.`,
        },
        { property: 'og:type', content: 'product' },
        { property: 'og:url', content: url },
      ],
      links: [{ rel: 'canonical', href: url }],
    };
  },
  component: VehicleDetailPage,
  errorComponent: ({ error }) => (
    <div className="container mx-auto px-4 py-24 text-center" role="alert">
      <p className="text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-24 text-center">
      <p className="text-muted-foreground">Vehicle not found.</p>
    </div>
  ),
});

function VehicleDetailPage() {
  const { slug } = Route.useParams();
  const { data: v, isLoading } = useVehicleBySlug(slug);
  const { data: all } = useVehicles();
  const [active, setActive] = useState(0);

  useEffect(() => setActive(0), [slug]);

  // Track recently viewed for cross-session recall.
  useEffect(() => {
    if (!v) return;
    try {
      const raw = window.localStorage.getItem(RECENT_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      const next = [v.slug ?? slug, ...list.filter((s) => s !== (v.slug ?? slug))].slice(0, 8);
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, [v, slug]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-32 text-center text-sm text-muted-foreground">
        Loading vehicle…
      </div>
    );
  }

  if (!v) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="display-font text-3xl font-bold">Vehicle not available</h1>
        <p className="mt-3 text-muted-foreground">
          This vehicle may have been sold or removed from the showroom.
        </p>
        <Link
          to="/inventory"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground"
        >
          Browse inventory
        </Link>
      </div>
    );
  }

  const related = all
    .filter((r) => r.id !== v.id && (r.make === v.make || r.category === v.category))
    .slice(0, 4);

  const wa = waLink(
    `Hello Ayad Automotives! I'm interested in ${v.name} (Stock ${stockId(v.id)}, ${formatKes(v.priceKes)}).`,
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Car',
            name: v.name,
            brand: { '@type': 'Brand', name: v.make },
            model: v.model,
            vehicleModelDate: String(v.year),
            fuelType: v.fuel,
            vehicleTransmission: v.transmission,
            mileageFromOdometer: { '@type': 'QuantitativeValue', value: v.mileageKm, unitCode: 'KMT' },
            sku: stockId(v.id),
            image: v.image,
            offers: {
              '@type': 'Offer',
              price: v.priceKes,
              priceCurrency: 'KES',
              availability:
                v.status === 'sold'
                  ? 'https://schema.org/SoldOut'
                  : 'https://schema.org/InStock',
            },
          }),
        }}
      />

      <section className="border-b border-border bg-gradient-to-b from-card to-background pt-24 pb-10">
        <div className="container mx-auto px-4">
          <Link
            to="/inventory"
            className="inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground hover:text-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to inventory
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            {/* Gallery */}
            <div>
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black">
                <img
                  src={v.images[active] ?? v.image}
                  alt={`${v.name} — photo ${active + 1}`}
                  className="aspect-[16/10] w-full object-cover"
                  loading="eager"
                  decoding="async"
                />
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <StatusBadge status={v.status} />
                  <span className="rounded-full bg-black/70 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-white backdrop-blur">
                    {v.registration}
                  </span>
                </div>
              </div>
              {v.images.length > 1 && (
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {v.images.slice(0, 10).map((src, i) => (
                    <button
                      key={src + i}
                      type="button"
                      onClick={() => setActive(i)}
                      aria-label={`View photo ${i + 1}`}
                      className={`overflow-hidden rounded-lg border transition-colors ${
                        i === active ? 'border-accent' : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <img
                        src={src}
                        alt={`${v.name} thumbnail ${i + 1}`}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[4/3] w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-accent">
                Stock {stockId(v.id)}
              </p>
              <h1 className="display-font mt-2 text-3xl font-bold leading-tight md:text-4xl">
                {v.name}
              </h1>
              <p className="mt-2 text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                {v.make} · {v.model} · {v.year}
              </p>
              <p className="mt-4 text-3xl font-bold text-accent">{formatKes(v.priceKes)}</p>

              <ul className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 sm:grid-cols-4">
                <SpecItem icon={<Cog className="h-4 w-4" />} label="Transmission" value={v.transmission} />
                <SpecItem icon={<Fuel className="h-4 w-4" />} label="Fuel" value={v.fuel} />
                <SpecItem
                  icon={<Gauge className="h-4 w-4" />}
                  label="Mileage"
                  value={`${v.mileageKm.toLocaleString()} km`}
                />
                <SpecItem icon={<CarIcon className="h-4 w-4" />} label="Body" value={String(v.category)} />
              </ul>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    openBlaze({
                      intent: 'test_drive',
                      autoSend: true,
                      prompt: `I'd like to book a test drive for the ${v.year} ${v.name} (Stock ${stockId(v.id)}).`,
                    })
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 text-xs font-semibold uppercase tracking-wider text-accent-foreground hover:bg-accent/90"
                >
                  <CalendarCheck className="h-4 w-4" /> Test Drive
                </button>
                <button
                  type="button"
                  onClick={() =>
                    openBlaze({
                      intent: 'finance',
                      autoSend: true,
                      prompt: `Please help me finance the ${v.year} ${v.name} (${formatKes(v.priceKes)}).`,
                    })
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-white/15 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/90 hover:border-accent hover:text-accent"
                >
                  <Calculator className="h-4 w-4" /> Finance
                </button>
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="col-span-2 inline-flex items-center justify-center gap-2 rounded-md border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#25D366] hover:bg-[#25D366]/20"
                >
                  <MessageCircle className="h-4 w-4" /> Enquire on WhatsApp
                </a>
              </div>

              <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-accent" /> Verified import documentation ·
                Nationwide insured delivery
              </p>
            </div>
          </div>
        </div>
      </section>

      {(v.description || v.features.length > 0) && (
        <section className="bg-background py-14">
          <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-2">
            {v.description && (
              <div>
                <h2 className="section-title">Overview</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {v.description}
                </p>
              </div>
            )}
            {v.features.length > 0 && (
              <div>
                <h2 className="section-title">Features</h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {v.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="bg-card py-16">
          <div className="container mx-auto px-4">
            <h2 className="section-title mb-8">You may also like</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <PremiumVehicleCard key={r.id} vehicle={r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, string> = {
    available: 'border-accent/40 bg-accent/15 text-accent',
    reserved: 'border-amber-400/40 bg-amber-400/15 text-amber-300',
    sold: 'border-white/20 bg-black/70 text-white/70',
  };
  const label = status === 'reserved' ? 'Reserved' : status === 'sold' ? 'Sold' : 'Available';
  return (
    <span
      className={`rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider backdrop-blur ${
        map[status ?? 'available'] ?? map.available
      }`}
    >
      {label}
    </span>
  );
}

function SpecItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <li className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <span className="text-accent/80">{icon}</span>
      <p className="mt-2 text-[0.6rem] uppercase tracking-[0.2em] text-white/40">{label}</p>
      <p className="text-sm font-semibold text-white/90">{value}</p>
    </li>
  );
}
