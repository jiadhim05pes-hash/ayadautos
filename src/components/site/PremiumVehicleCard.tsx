import { memo, useCallback, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import {
  Heart,
  GitCompare,
  Calculator,
  CalendarCheck,
  MessageCircle,
  ArrowRight,
  Gauge,
  Fuel,
  Cog,
  Car as CarIcon,
} from 'lucide-react';
import type { Vehicle } from '@/lib/inventory-data';
import { formatKes, stockId, waLink } from '@/lib/inventory-data';
import { useVehicleList } from '@/hooks/use-vehicle-lists';
import { openBlaze } from '@/hooks/use-blaze-chat';
import { cn } from '@/lib/utils';


interface Props {
  vehicle: Vehicle;
  className?: string;
}

/**
 * Premium vehicle card — used identically on Home and Inventory pages.
 * - Cursor-follow radial spotlight on hover (CSS custom props updated in rAF).
 * - Stock ID, status + registration badges, spec icons.
 * - Actions: Favourite · Compare · Finance · Test Drive · WhatsApp · Details.
 */
export const PremiumVehicleCard = memo(function PremiumVehicleCard({
  vehicle: v,
  className,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const favs = useVehicleList('favorites');
  const comp = useVehicleList('compare');

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      el.style.setProperty('--mx', `${x}%`);
      el.style.setProperty('--my', `${y}%`);
    });
  }, []);

  const isFav = favs.has(v.id);
  const isComp = comp.has(v.id);
  const stock = stockId(v.id);

  const inquiryPrompt = [
    `I'm enquiring about the ${v.year} ${v.name}.`,
    `Stock ID: ${stock}`,
    `Price: ${formatKes(v.priceKes)}`,
    `Specs: ${v.transmission} · ${v.fuel} · ${v.mileageKm.toLocaleString()} km · ${v.registration} · ${v.category}`,
    `Please answer my questions about this vehicle.`,
  ].join('\n');


  const statusClass =
    v.status === 'reserved'
      ? 'border-amber-400/40 bg-amber-400/15 text-amber-300'
      : v.status === 'sold'
        ? 'border-white/20 bg-black/70 text-white/60'
        : 'border-accent/40 bg-accent/15 text-accent';
  const statusLabel =
    v.status === 'reserved' ? 'Reserved' : v.status === 'sold' ? 'Sold' : 'Available';

  return (
    <article
      ref={cardRef}
      onMouseMove={onMove}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/[0.06]',
        'bg-gradient-to-b from-[#141821] to-[#0B0D12]',
        'shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]',
        'transition-transform duration-500 hover:-translate-y-1',
        className,
      )}
      style={{
        // radial spotlight overlay driven by --mx/--my
        backgroundImage:
          'radial-gradient(600px circle at var(--mx,50%) var(--my,50%), rgba(0,240,255,0.08), transparent 40%)',
      }}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={v.image}
          alt={`${v.year} ${v.name} for sale at Ayad Automotives`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0B0D12] to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span
            className={cn(
              'rounded-full border px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-wider backdrop-blur',
              statusClass,
            )}
          >
            {statusLabel}
          </span>
          <span className="rounded-full bg-black/70 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-wider text-white backdrop-blur">
            {v.registration}
          </span>
        </div>
        <span className="absolute right-3 top-3 rounded-full border border-accent/30 bg-black/60 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-accent backdrop-blur">
          {v.year}
        </span>

        {/* Save / Compare quick actions */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <IconToggle
            label={isFav ? 'Remove from favourites' : 'Save to favourites'}
            active={isFav}
            onClick={() => favs.toggle(v.id)}
          >
            <Heart className={cn('h-4 w-4', isFav && 'fill-current')} />
          </IconToggle>
          <IconToggle
            label={isComp ? 'Remove from compare' : 'Add to compare'}
            active={isComp}
            onClick={() => comp.toggle(v.id)}
          >
            <GitCompare className="h-4 w-4" />
          </IconToggle>
        </div>
      </div>

      {/* Body */}
      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-bold leading-tight text-white">{v.name}</h3>
          <span className="shrink-0 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[0.6rem] font-semibold tracking-[0.15em] text-white/50">
            {stock}
          </span>
        </div>
        <p className="mt-1 text-[0.7rem] uppercase tracking-[0.2em] text-white/40">
          {v.make} · {v.category}
        </p>

        <p className="mt-3 text-2xl font-bold text-accent">{formatKes(v.priceKes)}</p>

        {/* Spec icons */}
        <ul className="mt-4 grid grid-cols-4 gap-2 border-t border-white/[0.06] pt-4 text-white/80">
          <Spec icon={<Cog className="h-4 w-4" />} label={v.transmission === 'Automatic' ? 'Auto' : 'Manual'} />
          <Spec icon={<Fuel className="h-4 w-4" />} label={v.fuel} />
          <Spec icon={<Gauge className="h-4 w-4" />} label={`${Math.round(v.mileageKm / 1000)}k`} />
          <Spec icon={<CarIcon className="h-4 w-4" />} label={v.category === 'Family Car' ? 'Family' : v.category} />
        </ul>

        {/* Primary actions — Finance opens the calculator, others route through Blaze */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link
            to="/financing"
            search={{ id: v.id, price: v.priceKes }}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-accent px-3 py-2 text-xs font-semibold uppercase tracking-wider text-accent-foreground transition-colors hover:bg-accent/90"
          >
            <Calculator className="h-3.5 w-3.5" /> Finance
          </Link>
          <button
            type="button"
            onClick={() =>
              openBlaze({
                intent: 'test_drive',
                autoSend: true,
                prompt: `I'd like to book a test drive for the ${v.year} ${v.name}. Please help me schedule it.`,
              })
            }
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-white/15 bg-white/[0.02] px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/90 transition-colors hover:border-accent hover:text-accent"
          >
            <CalendarCheck className="h-3.5 w-3.5" /> Test Drive
          </button>
        </div>


        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => openBlaze({ intent: 'inquiry', autoSend: true, prompt: inquiryPrompt })}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-accent transition-colors hover:bg-accent/20"
          >
            <MessageCircle className="h-3.5 w-3.5" /> Inquire
          </button>
          {v.slug ? (
            <Link
              to="/vehicle/$slug"
              params={{ slug: v.slug }}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-white/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              Details <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <Link
              to="/inventory"
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-white/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              Details <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

      </div>
    </article>
  );
});

function Spec({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <li className="flex flex-col items-center gap-1 text-center">
      <span className="text-accent/80">{icon}</span>
      <span className="text-[0.65rem] uppercase tracking-wider text-white/70">
        {label}
      </span>
    </li>
  );
}

function IconToggle({
  active,
  onClick,
  children,
  label,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <span className="group/tip relative">
      <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        onClick={onClick}
        className={cn(
          'grid h-8 w-8 place-items-center rounded-full border backdrop-blur transition-all',
          active
            ? 'border-accent bg-accent text-accent-foreground shadow-[0_0_12px_-2px_var(--accent)]'
            : 'border-white/20 bg-black/50 text-white/85 hover:border-accent hover:text-accent',
        )}
      >
        {children}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full right-0 mb-2 w-max max-w-[11rem] translate-y-1 rounded-md border border-white/10 bg-black/90 px-2.5 py-1.5 text-[0.6rem] font-semibold uppercase tracking-wider text-white/90 opacity-0 shadow-xl backdrop-blur transition-all duration-200 group-hover/tip:translate-y-0 group-hover/tip:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
