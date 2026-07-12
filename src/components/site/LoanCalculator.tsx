import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';

/**
 * Multi-currency loan payment calculator.
 *
 * Architecture notes:
 * - Pure client computation today. Built so a future server fn can replace
 *   `computeLoan()` with a call into a bank/SACCO rate API without touching
 *   the UI (props/return shape is stable).
 * - Currency is purely a display concern — math is unit-agnostic.
 */

const CURRENCIES = [
  { code: 'KES', symbol: 'KSh', locale: 'en-KE', label: 'Kenyan Shilling' },
  { code: 'USD', symbol: '$', locale: 'en-US', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', locale: 'en-IE', label: 'Euro' },
  { code: 'GBP', symbol: '£', locale: 'en-GB', label: 'British Pound' },
  { code: 'AED', symbol: 'AED', locale: 'en-AE', label: 'UAE Dirham' },
] as const;

type Currency = (typeof CURRENCIES)[number]['code'];

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

export function LoanCalculator() {
  const [currency, setCurrency] = useState<Currency>('KES');
  const [price, setPrice] = useState(3_500_000);
  const [down, setDown] = useState(700_000);
  const [months, setMonths] = useState(48);
  const [rate, setRate] = useState(14);

  const result = useMemo(() => computeLoan(price, down, months, rate), [price, down, months, rate]);

  const cfg = CURRENCIES.find(c => c.code === currency)!;
  const fmt = (n: number) =>
    new Intl.NumberFormat(cfg.locale, { style: 'currency', currency: cfg.code, maximumFractionDigits: 0 }).format(
      isFinite(n) ? n : 0,
    );

  return (
    <Card className="glass p-6 md:p-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <h3 className="text-2xl font-bold display-font">Loan Payment Calculator</h3>

          <Field label="Currency">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} — {c.label}</option>
              ))}
            </select>
          </Field>

          <Field label={`Vehicle Price (${cfg.code})`}>
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(Math.max(0, +e.target.value))}
              className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground"
            />
          </Field>

          <Field label={`Down Payment (${cfg.code})`}>
            <input
              type="number"
              min={0}
              max={price}
              value={down}
              onChange={(e) => setDown(Math.min(price, Math.max(0, +e.target.value)))}
              className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground"
            />
            <input
              type="range"
              min={0}
              max={price}
              step={Math.max(1, Math.round(price / 100))}
              value={down}
              onChange={(e) => setDown(+e.target.value)}
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
          <p className="text-xs text-muted-foreground pt-2">
            Indicative only. Final terms depend on the lender (bank or SACCO), your credit profile, and current market rates.
            Contact us for a tailored quote.
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
