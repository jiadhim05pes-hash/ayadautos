import { useEffect, useRef, useState } from 'react';
import { Check, Cog, Fuel, Gauge, Palette, Settings2, Sofa } from 'lucide-react';

/**
 * Vehicle Specifications — scoped to the vehicle details page.
 * Reads every value from the active vehicle object; omits anything missing.
 */
export interface VehicleSpecSource {
  engine?: string | null;
  transmission?: string | null;
  fuel?: string | null;
  mileageKm?: number | null;
  exteriorColor?: string | null;
  interiorColor?: string | null;
  features?: string[] | null;
  // tolerate snake_case / extra fields from older records
  [key: string]: unknown;
}

function pick(v: VehicleSpecSource, ...keys: string[]): string | null {
  for (const k of keys) {
    const val = v[k];
    if (typeof val === 'string' && val.trim()) return val.trim();
  }
  return null;
}

export function VehicleSpecifications({ vehicle }: { vehicle: VehicleSpecSource | null | undefined }) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  if (!vehicle) return null;

  const mileage =
    typeof vehicle.mileageKm === 'number' && Number.isFinite(vehicle.mileageKm)
      ? `${vehicle.mileageKm.toLocaleString()} km`
      : null;

  const specs: { label: string; value: string; icon: React.ReactNode }[] = [
    { label: 'Engine', value: pick(vehicle, 'engine', 'engine_size'), icon: <Settings2 className="h-4 w-4" /> },
    { label: 'Transmission', value: pick(vehicle, 'transmission'), icon: <Cog className="h-4 w-4" /> },
    { label: 'Fuel', value: pick(vehicle, 'fuel', 'fuel_type'), icon: <Fuel className="h-4 w-4" /> },
    { label: 'Mileage', value: mileage, icon: <Gauge className="h-4 w-4" /> },
    {
      label: 'Exterior',
      value: pick(vehicle, 'exteriorColor', 'exterior_color', 'exterior', 'color'),
      icon: <Palette className="h-4 w-4" />,
    },
    {
      label: 'Interior',
      value: pick(vehicle, 'interiorColor', 'interior_color', 'interior', 'interiorMaterial', 'interior_material'),
      icon: <Sofa className="h-4 w-4" />,
    },
  ].filter((s): s is { label: string; value: string; icon: React.ReactNode } => Boolean(s.value));

  const features = Array.isArray(vehicle.features)
    ? vehicle.features.filter((f): f is string => typeof f === 'string' && f.trim().length > 0)
    : [];

  if (specs.length === 0 && features.length === 0) return null;

  return (
    <section
      ref={ref}
      aria-labelledby="vehicle-specifications-heading"
      className={`bg-background py-14 transition-all duration-700 ease-out ${
        shown ? 'translate-y-0 opacity-100' : 'translate-y-[18px] opacity-0'
      }`}
    >
      <div className="container mx-auto px-4">
        <h2 id="vehicle-specifications-heading" className="section-title">
          Vehicle Specifications
        </h2>

        {specs.length > 0 && (
          <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {specs.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition-colors hover:border-accent/40"
              >
                <dt className="flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-white/45">
                  <span className="text-accent/80">{s.icon}</span>
                  {s.label}
                </dt>
                <dd className="mt-2 text-base font-semibold text-white/90">{s.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {features.length > 0 && (
          <div className="mt-10">
            <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-accent">Key Features</h3>
            <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2 text-sm text-muted-foreground"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
