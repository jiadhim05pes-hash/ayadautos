import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import type { Vehicle } from '@/lib/inventory-data';

export interface MiniSearchQuery {
  make: string;
  model: string;
  maxBudget: number;
  trans: string;
}

const BUDGETS = [
  { label: 'Maximum Budget', value: 0 },
  { label: 'Up to KES 2M', value: 2_000_000 },
  { label: 'Up to KES 4M', value: 4_000_000 },
  { label: 'Up to KES 6M', value: 6_000_000 },
  { label: 'KES 6M+', value: 999_999_999 },
] as const;

/**
 * Compact variant of the premium smart search — sits above the homepage
 * Featured Inventory grid and filters the cards in place.
 */
export function MiniSmartSearch({
  vehicles,
  onSearch,
}: {
  vehicles: Vehicle[];
  onSearch: (q: MiniSearchQuery) => void;
}) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [budget, setBudget] = useState(0);
  const [trans, setTrans] = useState('');

  const makes = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.make))).sort(),
    [vehicles],
  );
  const models = useMemo(() => {
    const list = make ? vehicles.filter((v) => v.make === make) : vehicles;
    return Array.from(new Set(list.map((v) => v.model))).sort();
  }, [make, vehicles]);

  const selCls =
    'rounded-md border border-white/10 bg-black/50 px-3 py-2 text-xs text-white outline-none transition-colors focus:border-accent';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch({ make, model, maxBudget: budget, trans });
      }}
      className="mb-8 rounded-xl border border-white/[0.08] bg-black/60 p-3 backdrop-blur-xl sm:p-4"
    >
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <select
          value={make}
          onChange={(e) => {
            setMake(e.target.value);
            setModel('');
          }}
          className={selCls}
          aria-label="Brand"
        >
          <option value="">Select Brand</option>
          {makes.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select value={model} onChange={(e) => setModel(e.target.value)} className={selCls} aria-label="Model">
          <option value="">Select Model</option>
          {models.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className={selCls}
          aria-label="Maximum budget"
        >
          {BUDGETS.map((b) => (
            <option key={b.label} value={b.value}>{b.label}</option>
          ))}
        </select>
        <select value={trans} onChange={(e) => setTrans(e.target.value)} className={selCls} aria-label="Transmission">
          <option value="">Transmission</option>
          <option value="Automatic">Automatic</option>
          <option value="Manual">Manual</option>
        </select>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground transition-all hover:shadow-[0_0_20px_-6px_var(--accent)]"
        >
          <Search className="h-3.5 w-3.5" /> Search
        </button>
      </div>
      <div className="mt-2.5 text-center sm:text-right">
        <Link
          to="/inventory"
          className="text-[0.65rem] uppercase tracking-[0.25em] text-white/45 transition-colors hover:text-accent"
        >
          View All Inventory
        </Link>
      </div>
    </form>
  );
}
