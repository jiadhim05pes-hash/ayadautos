import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { openBlaze } from '@/hooks/use-blaze-chat';

/**
 * Multi-currency loan payment calculator.
 *
 * Architecture:
 * - Base currency anchor: every internal value (price, down payment, loan
 *   results) is stored and computed in KES. Currency is a presentation layer.
 * - Live FX: rates are fetched once on mount from open.er-api.com (KES base).
 *   If the request fails or is slow, hardcoded fallback rates are used so the
 *   calculator always works offline.
 * - Editing in a foreign currency: the typed amount is divided back to the
 *   KES base, so switching currency instantly re-converts every field.
 * - Pure client computation today. Built so a future server fn can replace
 *   `computeLoan()` with a call into a bank/SACCO rate API without touching
 *   the UI (props/return shape is stable).
 */

const CURRENCIES = [
  { code: 'KES', locale: 'en-KE', label: 'Kenyan Shilling' },
  { code: 'USD', locale: 'en-US', label: 'US Dollar' },
  { code: 'EUR', locale: 'en-IE', label: 'Euro' },
  { code: 'GBP', locale: 'en-GB', label: 'British Pound' },
  { code: 'AED', locale: 'en-AE', label: 'UAE Dirham' },
] as const;

type Currency = (typeof CURRENCIES)[number]['code'];

/** KES → currency fallbacks (approximate market rates) used when live FX is unavailable. */
const FALLBACK_RATES: Record<Currency, number> = {
  KES: 1,
  USD: 0.0078,
  EUR: 0.0067,
  GBP: 0.0058,
  AED: 0.0287,
};

/** Live KES-based rates; null until the fetch resolves (fallbacks used meanwhile). */
type LiveRates = Partial<Record<Currency, number>> & { fetchedAt?: string };

interface LoanResult {
  monthly: number;
  totalInterest: number;
  totalCost: number;
  principal: number;
  months: number;
}

function computeLoan(price: number, down: number, months: number, annualRatePct: number): LoanResult {
  const principal = Math.max(0, price - down);
  const r = annualRatePct / 100 / 12;
  let monthly = 0;
  if (months > 0) {
    monthly = r === 0 ? principal / months : (principal * r) / (1 - Math.pow(1 + r, -months));
  }
  const totalCost = monthly * months + down;
  const totalInterest = monthly * months - principal;
  return { monthly, totalInterest, totalCost, principal, months };
}

const parseNum = (s: string) => Number(s.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')) || 0;

export interface CalculatorVehicle {
  id?: string;
  name: string;
  stock?: string;
  priceKes: number;
}

export function LoanCalculator({
  initialPrice,
  vehicle,
}: { initialPrice?: number; vehicle?: CalculatorVehicle } = {}) {
  const [currency, setCurrency] = useState<Currency>('KES');
  const basePrice = initialPrice ?? vehicle?.priceKes ?? 3_500_000;
  // All monetary state is anchored in KES (the base currency).
  const [priceBase, setPriceBase] = useState(basePrice);
  const [downBase, setDownBase] = useState(Math.round(basePrice * 0.2));
  const [months, setMonths] = useState(48);
  const [rate, setRate] = useState(14);
  const [liveRates, setLiveRates] = useState<LiveRates | null>(null);
  const [ratesSource, setRatesSource] = useState<'live' | 'offline' | null>(null);

  // Fetch live exchange rates once on mount (KES base), with graceful fallback.
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    fetch('https://open.er-api.com/v6/latest/KES', { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json) => {
        if (json?.result !== 'success' || typeof json?.rates !== 'object') {
          throw new Error('unexpected rates payload');
        }
        const rates: LiveRates = { fetchedAt: json.time_last_update_utc as string | undefined };
        for (const c of CURRENCIES) {
          const v = Number(json.rates[c.code]);
          if (Number.isFinite(v) && v > 0) rates[c.code] = v;
        }
        if (!rates.USD) throw new Error('no usable rates');
        setLiveRates(rates);
        setRatesSource('live');
      })
      .catch(() => {
        if (!controller.signal.aborted) setRatesSource('offline');
      })
      .finally(() => clearTimeout(timer));
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, []);

  // KES → selected currency conversion rate (live, else hardcoded fallback).
  const fx = useMemo(() => {
    const rateFor = (code: Currency): number => {
      if (code === 'KES') return 1;
      const live = liveRates?.[code];
      return Number.isFinite(live) && live! > 0 ? live! : FALLBACK_RATES[code];
    };
    return {
      rateFor,
      toDisplay: (kes: number) => kes * rateFor(currency),
      toBase: (displayed: number) => displayed / rateFor(currency),
    };
  }, [currency, liveRates]);

  const result = useMemo(
    () => computeLoan(priceBase, downBase, months, rate),
    [priceBase, downBase, months, rate],
  );

  const cfg = CURRENCIES.find((c) => c.code === currency)!;
  const fmt = (kes: number) =>
    new Intl.NumberFormat(cfg.locale, { style: 'currency', currency: cfg.code, maximumFractionDigits: 0 }).format(
      isFinite(kes) ? Math.max(0, fx.toDisplay(kes)) : 0,
    );

  const requestQuote = () => {
    const lines = [
      `I'd like to request a finance quote.`,
      vehicle ? `Vehicle: ${vehicle.name}` : null,
      vehicle?.stock ? `Stock ID: ${vehicle.stock}` : null,
      `Vehicle price: ${fmt(priceBase)}${currency !== 'KES' ? ` (≈ KES ${Math.round(priceBase).toLocaleString()})` : ''}`,
      `Deposit: ${fmt(downBase)}`,
      `Loan period: ${months} months`,
      `Indicative rate: ${rate}% APR`,
      `Estimated monthly repayment: ${fmt(result.monthly)}`,
      `Amount financed: ${fmt(result.principal)}`,
      `Please save this finance request for the team.`,
    ].filter(Boolean);
    openBlaze({ intent: 'finance', autoSend: true, prompt: lines.join('\n') });
  };

  return (
    <Card className="glass p-6 md:p-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <h3 className="text-2xl font-bold display-font">Loan Payment Calculator</h3>
          {vehicle && (
            <p className="text-xs uppercase tracking-[0.25em] text-accent">
              {vehicle.name}
              {vehicle.stock ? ` · Stock ${vehicle.stock}` : ''}
            </p>
          )}

          <Field label="Currency">
            <div className="flex items-center gap-3">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} — {c.label}</option>
                ))}
              </select>
              {ratesSource && (
                <span
                  className="shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground"
                  title={
                    ratesSource === 'live'
                      ? `Live exchange rates${liveRates?.fetchedAt ? ` · updated ${liveRates.fetchedAt}` : ''}`
                      : 'Network unavailable — using built-in indicative rates'
                  }
                >
                  {ratesSource === 'live' ? 'Live rates' : 'Offline rates'}
                </span>
              )}
            </div>
          </Field>

          <Field label={`Vehicle Price (${cfg.code})`}>
            <input
              type="text"
              inputMode="decimal"
              value={fmt(priceBase)}
              onChange={(e) => {
                const base = Math.round(fx.toBase(parseNum(e.target.value)));
                setPriceBase(base);
                if (downBase > base) setDownBase(base);
              }}
              className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground"
            />
          </Field>

          <Field label={`Down Payment (${cfg.code})`}>
            <input
              type="text"
              inputMode="decimal"
              value={fmt(downBase)}
              onChange={(e) => setDownBase(Math.min(priceBase, Math.round(fx.toBase(parseNum(e.target.value)))))}
              className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground"
            />
            <input
              type="range"
              min={0}
              max={priceBase}
              step={Math.max(1, Math.round(priceBase / 100))}
              value={downBase}
              onChange={(e) => setDownBase(+e.target.value)}
              className="w-full mt-2 accent-[color:var(--accent)]"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Loan Term (months)">
              <input
                type="number"
                min={1}
                max={120}
                value={months}
                onChange={(e) => setMonths(Math.min(120, Math.max(1, +e.target.value)))}
                className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground"
              />
            </Field>
            <Field label="Interest Rate (% APR)">
              <input
                type="number"
                min={0}
                max={50}
                step={0.1}
                value={rate}
                onChange={(e) => setRate(Math.min(50, Math.max(0, +e.target.value)))}
                className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground"
              />
            </Field>
          </div>
        </div>

        <div className="space-y-4">
          <Stat label="Monthly Payment" value={fmt(result.monthly)} highlight />
          <Stat label="Total Interest" value={fmt(result.totalInterest)} />
          <Stat label="Total Cost (incl. down payment)" value={fmt(result.totalCost)} />
          <Stat label="Amount Financed" value={fmt(result.principal)} />
          <button
            type="button"
            onClick={requestQuote}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-accent px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-accent-foreground transition-all hover:shadow-[0_0_24px_-4px_var(--accent)]"
          >
            <Flame className="w-4 h-4" /> Request a Finance Quote
          </button>
          <p className="text-xs text-muted-foreground pt-1">
            Indicative only. Converted at current market rates; final terms depend on the lender (bank or SACCO), your
            credit profile, and current market rates.
          </p>
        </div>
      </div>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-foreground mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        highlight ? 'border-accent bg-accent/10' : 'border-border bg-card/50'
      }`}
    >
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${highlight ? 'accent-red' : 'text-foreground'}`}>{value}</div>
    </div>
  );
}
