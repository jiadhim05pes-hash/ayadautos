import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { PageHero } from '@/components/site/PageHero';
import { Button } from '@/components/ui/button';
import { Check, ChevronLeft, ChevronRight, Upload, Flame } from 'lucide-react';
import { openBlaze } from '@/hooks/use-blaze-chat';

export const Route = createFileRoute('/trade-in')({
  head: () => ({
    meta: [
      { title: 'Value Your Trade-In — Ayad Automotives' },
      { name: 'description', content: 'Get a fast, fair valuation on your current vehicle with our interactive trade-in wizard. Enter your car details and condition to receive an offer.' },
      { property: 'og:title', content: 'Value Your Trade-In — Ayad Automotives' },
      { property: 'og:description', content: 'Interactive trade-in valuation wizard for your vehicle.' },
      { property: 'og:url', content: '/trade-in' },
    ],
    links: [{ rel: 'canonical', href: '/trade-in' }],
  }),
  component: TradeInPage,
});

const YEARS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));
const STEPS = ['Vehicle Basics', 'Auction Grade', 'Your Details'] as const;

/** Japanese auction grading scale. */
const GRADES = [
  { code: 'S / 6', desc: 'Brand new or near-new condition' },
  { code: '5', desc: 'Excellent' },
  { code: '4.5', desc: 'Very Good' },
  { code: '4', desc: 'Good' },
  { code: '3.5', desc: 'Fair' },
  { code: '3', desc: 'Poor' },
  { code: 'R / RA', desc: 'Accident repaired' },
] as const;

function TradeInPage() {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    make: '', model: '', year: '', mileage: '',
    grade: '' as string,
    name: '', phone: '', email: '', photos: [] as string[],
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k as string]: '' }));
  };

  function validate(s: number) {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!form.make.trim()) e.make = 'Make is required';
      if (!form.model.trim()) e.model = 'Model is required';
      if (!form.year) e.year = 'Year is required';
      if (!form.mileage.trim() || Number(form.mileage) <= 0) e.mileage = 'Enter a valid mileage';
    }
    if (s === 1 && !form.grade) e.grade = 'Select an auction grade';
    if (s === 2) {
      if (!form.name.trim()) e.name = 'Full name is required';
      if (!/^[+\d][\d\s-]{7,}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number';
      if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Enter a valid email';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const next = () => {
    if (!validate(step)) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const submit = () => {
    if (!validate(2)) return;
    const grade = GRADES.find((g) => g.code === form.grade);
    const prompt = [
      `I'd like to submit my vehicle for a trade-in valuation.`,
      `Make: ${form.make}`,
      `Model: ${form.model}`,
      `Year: ${form.year}`,
      `Mileage: ${Number(form.mileage).toLocaleString()} km`,
      `Auction grade: ${form.grade}${grade ? ` (${grade.desc})` : ''}`,
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      form.email.trim() ? `Email: ${form.email}` : '',
      form.photos.length ? `Photos provided: ${form.photos.length}` : '',
      `Please save this trade-in valuation request for the team.`,
    ]
      .filter(Boolean)
      .join('\n');
    openBlaze({ intent: 'trade_in', autoSend: true, prompt });
  };

  const inputCls =
    'w-full bg-input border border-border rounded-md px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent';
  const errCls = 'mt-1 text-xs text-red-400';

  return (
    <>
      <PageHero
        eyebrow="Trade-In"
        title="Value Your Trade-In"
        subtitle="A fast, transparent valuation in three simple steps — no pressure, no hidden costs."
      />
      <section className="py-14 bg-background">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Stepper */}
          <div className="flex items-center justify-between mb-10">
            {STEPS.map((label, i) => (
              <div key={label} className="flex-1 flex items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border transition-all duration-300 ${
                      i < step
                        ? 'bg-accent text-accent-foreground border-accent'
                        : i === step
                        ? 'border-accent text-accent shadow-[0_0_18px_-4px_var(--glow)]'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    {i < step ? <Check className="w-5 h-5" /> : i + 1}
                  </div>
                  <span className={`text-[0.65rem] uppercase tracking-wider text-center ${i === step ? 'text-accent' : 'text-muted-foreground'}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 transition-colors duration-300 ${i < step ? 'bg-accent' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="edge-card rounded-xl p-6 sm:p-8">
            {/* STEP 1 — Vehicle Basics */}
            {step === 0 && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="text-xl font-bold mb-2">Vehicle Basics</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <input className={inputCls} placeholder="Make (e.g. Toyota)" value={form.make} onChange={(e) => set('make', e.target.value)} />
                    {errors.make && <p className={errCls}>{errors.make}</p>}
                  </div>
                  <div>
                    <input className={inputCls} placeholder="Model (e.g. Prado)" value={form.model} onChange={(e) => set('model', e.target.value)} />
                    {errors.model && <p className={errCls}>{errors.model}</p>}
                  </div>
                  <div>
                    <select className={inputCls} value={form.year} onChange={(e) => set('year', e.target.value)}>
                      <option value="">Year of manufacture</option>
                      {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                    {errors.year && <p className={errCls}>{errors.year}</p>}
                  </div>
                  <div>
                    <input className={inputCls} type="number" placeholder="Mileage (km)" value={form.mileage} onChange={(e) => set('mileage', e.target.value)} />
                    {errors.mileage && <p className={errCls}>{errors.mileage}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 — Japanese Auction Grade */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-xl font-bold">Japanese Auction Grade</h2>
                <p className="text-sm text-muted-foreground">
                  Select the grade that best matches your vehicle&apos;s condition.
                </p>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {GRADES.map((g) => {
                    const active = form.grade === g.code;
                    return (
                      <button
                        key={g.code}
                        type="button"
                        onClick={() => set('grade', g.code)}
                        className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all duration-300 ${
                          active
                            ? 'border-accent bg-accent/10 shadow-[0_0_18px_-6px_var(--glow)]'
                            : 'border-border hover:border-accent/60 hover:bg-white/[0.03]'
                        }`}
                      >
                        <span
                          className={`shrink-0 min-w-[3.2rem] rounded-md border px-2 py-1 text-center text-xs font-bold ${
                            active ? 'border-accent text-accent' : 'border-border text-foreground/80'
                          }`}
                        >
                          {g.code}
                        </span>
                        <span className={`text-xs ${active ? 'text-accent' : 'text-muted-foreground'}`}>{g.desc}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.grade && <p className={errCls}>{errors.grade}</p>}
              </div>
            )}

            {/* STEP 3 — Details + Upload */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="text-xl font-bold mb-2">Your Details</h2>
                <div>
                  <input className={inputCls} placeholder="Full name" value={form.name} onChange={(e) => set('name', e.target.value)} />
                  {errors.name && <p className={errCls}>{errors.name}</p>}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <input className={inputCls} type="tel" placeholder="Phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                    {errors.phone && <p className={errCls}>{errors.phone}</p>}
                  </div>
                  <div>
                    <input className={inputCls} type="email" placeholder="Email (optional)" value={form.email} onChange={(e) => set('email', e.target.value)} />
                    {errors.email && <p className={errCls}>{errors.email}</p>}
                  </div>
                </div>
                <label className="block cursor-pointer">
                  <div className="border border-dashed border-border rounded-lg p-8 text-center transition-colors hover:border-accent">
                    <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-foreground/80">
                      {form.photos.length > 0 ? `${form.photos.length} photo(s) selected` : 'Upload vehicle photos'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">JPG or PNG, up to 10 images</p>
                  </div>
                  <input
                    type="file" accept="image/*" multiple className="hidden"
                    onChange={(e) => set('photos', Array.from(e.target.files ?? []).map((f) => f.name))}
                  />
                </label>
                <button
                  type="button"
                  onClick={submit}
                  className="w-full inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 py-3.5 rounded-md transition-all"
                >
                  <Flame className="w-4 h-4" /> Submit for Valuation
                </button>
              </div>
            )}

            {/* Navigation */}
            {step < 2 && (
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={back} disabled={step === 0} className="border-border neon-outline gap-1">
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                <Button onClick={next} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1">
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
            {step === 2 && (
              <div className="flex justify-start mt-8">
                <Button variant="outline" onClick={back} className="border-border neon-outline gap-1">
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
              </div>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Prefer to talk?{' '}
            <Link to="/contact" className="text-accent hover:underline">Contact our team</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
