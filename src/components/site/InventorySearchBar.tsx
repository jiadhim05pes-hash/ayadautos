import { useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { useVehicles } from '@/hooks/use-vehicles';

const FUELS = ['Any', 'Petrol', 'Diesel', 'Hybrid', 'Electric'] as const;
const TRANS = ['Any', 'Automatic', 'Manual'] as const;
const BODY = ['Any', 'SUV', 'Sedan', 'Luxury', 'Family Car', 'Hatchback'] as const;
const BUDGETS = [
  { label: 'Any budget', min: 0, max: 0 },
  { label: 'Under KES 2M', min: 0, max: 2_000_000 },
  { label: 'KES 2M – 4M', min: 2_000_000, max: 4_000_000 },
  { label: 'KES 4M – 6M', min: 4_000_000, max: 6_000_000 },
  { label: 'KES 6M+', min: 6_000_000, max: 999_999_999 },
] as const;

interface Props {
  floating?: boolean;
  className?: string;
}

/**
 * Luxury dealership search toolbar.
 * Brand → Model is dependent: picking Toyota narrows models to Toyota models.
 * Submitting navigates to /inventory with the chosen filters as search params.
 */
export function InventorySearchBar({ floating, className = '' }: Props) {
  const navigate = useNavigate();
  const { data: vehicles } = useVehicles();
  const [make, setMake] = useState('Any');
  const [model, setModel] = useState('Any');
  const [body, setBody] = useState<(typeof BODY)[number]>('Any');
  const [fuel, setFuel] = useState<(typeof FUELS)[number]>('Any');
  const [trans, setTrans] = useState<(typeof TRANS)[number]>('Any');
  const [budgetIdx, setBudgetIdx] = useState(0);

  const makes = useMemo(
    () => ['Any', ...Array.from(new Set(vehicles.map((v) => v.make))).sort()],
    [vehicles],
  );
  const models = useMemo(() => {
    const list =
      make === 'Any'
        ? vehicles.map((v) => v.model)
        : vehicles.filter((v) => v.make === make).map((v) => v.model);
    return ['Any', ...Array.from(new Set(list)).sort()];
  }, [make, vehicles]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const budget = BUDGETS[budgetIdx];
    navigate({
      to: '/inventory',
      search: {
        make: make !== 'Any' ? make : undefined,
        model: model !== 'Any' ? model : undefined,
        body: body !== 'Any' ? body : undefined,
        fuel: fuel !== 'Any' ? fuel : undefined,
        trans: trans !== 'Any' ? trans : undefined,
        min: budget.min || undefined,
        max: budget.max || undefined,
      } as Record<string, unknown>,
    });
  };

  return (
    <form
      onSubmit={submit}
      className={`${
        floating
          ? 'border border-white/[0.08] bg-black/70 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl'
          : 'border border-border bg-card/60 backdrop-blur'
      } rounded-2xl p-4 sm:p-5 ${className}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[0.65rem] uppercase tracking-[0.4em] text-accent">
          Smart Inventory Search
        </p>
        <span className="hidden sm:block text-[0.65rem] uppercase tracking-[0.3em] text-white/40">
          Refine {vehicles.length || ''} executive vehicles
        </span>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-6">
        <Select
          label="Brand"
          value={make}
          onChange={(v) => { setMake(v); setModel('Any'); }}
          options={makes}
          anyLabel="All brands"
        />
        <Select
          label="Model"
          value={model}
          onChange={setModel}
          options={models}
          anyLabel={make === 'Any' ? 'All models' : `All ${make} models`}
        />
        <Select label="Body Type" value={body} onChange={(v) => setBody(v as typeof body)} options={[...BODY]} anyLabel="All body types" />
        <Select label="Fuel" value={fuel} onChange={(v) => setFuel(v as typeof fuel)} options={[...FUELS]} anyLabel="Any fuel" />
        <Select label="Transmission" value={trans} onChange={(v) => setTrans(v as typeof trans)} options={[...TRANS]} anyLabel="Any transmission" />
        <label className="flex flex-col">
          <span className="mb-1 text-[0.6rem] uppercase tracking-[0.25em] text-white/50">Budget</span>
          <select
            value={budgetIdx}
            onChange={(e) => setBudgetIdx(Number(e.target.value))}
            className="rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          >
            {BUDGETS.map((b, i) => (
              <option key={b.label} value={i}>{b.label}</option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="submit"
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-accent-foreground transition-all hover:shadow-[0_0_24px_-4px_var(--accent)] sm:w-auto sm:self-end"
      >
        <Search className="h-4 w-4" /> Search
      </button>
    </form>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  anyLabel,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  anyLabel?: string;
}) {
  return (
    <label className="flex flex-col">
      <span className="mb-1 text-[0.6rem] uppercase tracking-[0.25em] text-white/50">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-accent"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o === 'Any' ? (anyLabel ?? 'Any') : o}
          </option>
        ))}
      </select>
    </label>
  );
}
