import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { PageHero } from '@/components/site/PageHero';
import { Button } from '@/components/ui/button';
import { Check, ChevronLeft, ChevronRight, Upload, MessageCircle } from 'lucide-react';
import { waLink } from '@/lib/inventory-data';

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
const CONDITIONS = ['Fair', 'Good', 'Excellent'] as const;
const STEPS = ['Vehicle Basics', 'Condition', 'Your Details'] as const;

function TradeInPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    make: '', model: '', year: '', mileage: '',
    condition: 1,
    name: '', phone: '', email: '', photos: [] as string[],
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const summary = `Hello Ayad Automotives! I'd like a trade-in valuation.\n\nMake: ${form.make}\nModel: ${form.model}\nYear: ${form.year}\nMileage: ${form.mileage} km\nCondition: ${CONDITIONS[form.condition]}\nName: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email}`;

  const inputCls =
    'w-full bg-input border border-border rounded-md px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent';

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
                  <input className={inputCls} placeholder="Make (e.g. Toyota)" value={form.make} onChange={(e) => set('make', e.target.value)} />
                  <input className={inputCls} placeholder="Model (e.g. Prado)" value={form.model} onChange={(e) => set('model', e.target.value)} />
                  <select className={inputCls} value={form.year} onChange={(e) => set('year', e.target.value)}>
                    <option value="">Year of manufacture</option>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <input className={inputCls} type="number" placeholder="Mileage (km)" value={form.mileage} onChange={(e) => set('mileage', e.target.value)} />
                </div>
              </div>
            )}

            {/* STEP 2 — Condition */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-xl font-bold mb-2">Mechanical & Body Condition</h2>
                <p className="text-sm text-muted-foreground">Slide to rate the overall condition of your vehicle.</p>
                <div className="pt-4">
                  <input
                    type="range" min={0} max={2} step={1}
                    value={form.condition}
                    onChange={(e) => set('condition', Number(e.target.value))}
                    className="w-full accent-[color:var(--accent)] cursor-pointer"
                    aria-label="Condition"
                  />
                  <div className="flex justify-between mt-3 text-xs uppercase tracking-wider">
                    {CONDITIONS.map((c, i) => (
                      <span key={c} className={form.condition === i ? 'text-accent font-semibold' : 'text-muted-foreground'}>{c}</span>
                    ))}
                  </div>
                  <div className="mt-8 edge-card rounded-lg p-5 text-center">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">Selected condition</p>
                    <p className="text-3xl font-bold cyan-text">{CONDITIONS[form.condition]}</p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 — Details + Upload */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="text-xl font-bold mb-2">Your Details</h2>
                <input className={inputCls} placeholder="Full name" value={form.name} onChange={(e) => set('name', e.target.value)} />
                <div className="grid sm:grid-cols-2 gap-4">
                  <input className={inputCls} type="tel" placeholder="Phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                  <input className={inputCls} type="email" placeholder="Email" value={form.email} onChange={(e) => set('email', e.target.value)} />
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
                <a
                  href={waLink('') ? `https://wa.me/?text=${summary}` : '#'}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 py-3.5 rounded-md transition-all"
                >
                  <MessageCircle className="w-4 h-4" /> Submit for Valuation
                </a>
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
