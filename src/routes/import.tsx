import { useState, type FormEvent } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { ArrowRight, Anchor, BadgeCheck, Check, ChevronRight, ClipboardCheck, Compass, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { importRequestSchema } from '@/lib/import-request-schema';
import { submitImportRequest } from '@/lib/import-request.functions';

export const Route = createFileRoute('/import')({
  head: () => ({
    meta: [
      { title: 'Custom Japanese & Executive Imports — Ayad Automotives' },
      { name: 'description', content: 'Source your ideal Japanese or executive vehicle with transparent guidance, insured shipping, KRA customs clearance, and delivery across Kenya.' },
      { property: 'og:title', content: 'Custom Japanese & Executive Imports — Ayad Automotives' },
      { property: 'og:description', content: 'From sourcing and inspection to KRA clearance and doorstep handover, we manage your vehicle import end to end.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://ayad-automotives.lovable.app/import' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [{ rel: 'canonical', href: 'https://ayad-automotives.lovable.app/import' }],
  }),
  component: ImportPage,
});

const PROCESS = [
  { number: '01', title: 'Sourcing & Inspection', description: 'We identify vehicles against your brief and review auction or dealer condition reports.', icon: Compass },
  { number: '02', title: 'Secure Shipping', description: 'Your selected vehicle is arranged for marine transit with insurance cover.', icon: Anchor },
  { number: '03', title: 'Customs Clearance', description: 'We coordinate KRA customs clearance and the documentation required for import.', icon: ClipboardCheck },
  { number: '04', title: 'Doorstep Handover', description: 'Once cleared, your vehicle is prepared for collection or delivery to your location.', icon: Truck },
];

const IMPORT_OPTIONS = [
  {
    number: '01',
    title: 'Direct Japan Auction House Sourcing',
    description: 'Choose a vehicle brief and budget; we help source from Japanese auction listings and guide you through the inspection details before bidding.',
  },
  {
    number: '02',
    title: 'Custom Dealer-Assisted Import',
    description: 'Have a specific model or specification in mind? We coordinate a tailored search with our dealer network and keep you updated along the way.',
  },
];

type FormValues = {
  preferred_make_model: string;
  year_from: string;
  year_to: string;
  target_budget_kes: string;
  fuel_type: string;
  import_type: string;
  full_name: string;
  phone: string;
  email: string;
  website: string;
};

const EMPTY_FORM: FormValues = {
  preferred_make_model: '',
  year_from: '',
  year_to: '',
  target_budget_kes: '',
  fuel_type: 'Any',
  import_type: 'Doorstep',
  full_name: '',
  phone: '',
  email: '',
  website: '',
};

function ImportPage() {
  const [form, setForm] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const submitRequest = useServerFn(submitImportRequest);

  const update = (key: keyof FormValues, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
    setSubmitError('');
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = importRequestSchema.safeParse(form);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === 'string' && !nextErrors[field]) nextErrors[field] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    setSubmitError('');
    try {
      await submitRequest({ data: parsed.data });
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'We could not send your request right now. Please try again shortly.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = 'w-full rounded-md border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent';

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative isolate overflow-hidden border-b border-border bg-background">
        <img
          src="/frames/ezgif-frame-001.jpg"
          alt="AYAD Automotives showroom and vehicle handover"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-35"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/90 to-background/55" />
        <div className="container mx-auto px-4 pb-20 pt-36 md:pb-28 md:pt-44">
          <div className="max-w-3xl">
            <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-accent">
              <span className="h-px w-10 bg-accent" /> Import Concierge
            </p>
            <h1 className="display-font max-w-3xl text-4xl font-bold leading-tight text-foreground sm:text-5xl md:text-6xl">
              Custom Japanese &amp; Executive Imports
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-foreground/75 md:text-lg">
              Source with confidence. We guide you through vehicle selection, marine insurance, and end-to-end KRA customs clearance — through to handover in Kenya.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a href="#import-request" className="inline-flex min-h-12 items-center gap-2 rounded-md bg-accent px-6 py-3 font-semibold text-accent-foreground transition-colors hover:bg-accent/90">
                Start an import request <ArrowRight className="h-4 w-4" />
              </a>
              <span className="inline-flex items-center gap-2 text-sm text-foreground/70">
                <ShieldCheck className="h-4 w-4 text-accent" /> Insured shipping coordination
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-10 max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-accent">Your import, handled</p>
            <h2 className="display-font text-3xl font-bold md:text-4xl">From the first search to the final handover.</h2>
            <p className="mt-4 text-muted-foreground">A clear process, with your vehicle and import brief at the centre of every step.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {PROCESS.map(({ number, title, description, icon: Icon }) => (
              <article key={number} className="edge-card rounded-lg p-5 md:p-6">
                <div className="mb-7 flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-[0.2em] text-accent">{number}</span>
                  <Icon className="h-5 w-5 text-foreground/75" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-10 max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-accent">Choose your route</p>
            <h2 className="display-font text-3xl font-bold md:text-4xl">Two ways to find the right vehicle.</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {IMPORT_OPTIONS.map((option) => (
              <article key={option.number} className="edge-card rounded-lg p-6 md:p-8">
                <span className="text-xs font-semibold tracking-[0.2em] text-accent">OPTION {option.number}</span>
                <h3 className="mt-4 text-xl font-semibold md:text-2xl">{option.title}</h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{option.description}</p>
                <a href="#import-request" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-all hover:gap-3">
                  Share your requirements <ChevronRight className="h-4 w-4" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="import-request" className="scroll-mt-24 bg-background py-16 md:py-20">
        <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="max-w-lg">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-accent">Tell us what you’re looking for</p>
            <h2 className="display-font text-3xl font-bold md:text-4xl">Your next vehicle starts with a brief.</h2>
            <p className="mt-4 leading-7 text-muted-foreground">Share your preferred model, budget, and import option. The team can use your details to prepare a tailored sourcing conversation.</p>
            <div className="mt-8 space-y-4 text-sm text-foreground/75">
              <p className="flex items-start gap-3"><BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" /> Vehicle options matched to your brief</p>
              <p className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" /> Import steps and costs discussed transparently</p>
              <p className="flex items-start gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" /> Shipping and clearance coordination</p>
            </div>
          </div>

          <div className="edge-card rounded-lg p-5 sm:p-8">
            {submitted ? (
              <div className="py-8 text-center" role="status" aria-live="polite">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-accent/40 bg-accent/10 text-accent">
                  <Check className="h-7 w-7" />
                </span>
                <h3 className="mt-5 text-2xl font-semibold">Your import brief is with us.</h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">Thank you for sharing your requirements. The team will review your vehicle preferences and contact you using the details provided.</p>
                <Button type="button" variant="outline" className="mt-7" onClick={() => { setForm(EMPTY_FORM); setSubmitted(false); }}>
                  Send another request
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Preferred make / model" error={errors.preferred_make_model} className="sm:col-span-2">
                    <input className={inputClass} placeholder="e.g. Toyota Land Cruiser, BMW X5" value={form.preferred_make_model} onChange={(e) => update('preferred_make_model', e.target.value)} aria-invalid={!!errors.preferred_make_model} />
                  </Field>
                  <Field label="Year range — from" error={errors.year_from}>
                    <input className={inputClass} type="number" min="1980" max="2100" inputMode="numeric" placeholder="e.g. 2019" value={form.year_from} onChange={(e) => update('year_from', e.target.value)} aria-invalid={!!errors.year_from} />
                  </Field>
                  <Field label="Year range — to" error={errors.year_to}>
                    <input className={inputClass} type="number" min="1980" max="2100" inputMode="numeric" placeholder="e.g. 2023" value={form.year_to} onChange={(e) => update('year_to', e.target.value)} aria-invalid={!!errors.year_to} />
                  </Field>
                  <Field label="Target budget (KES)" error={errors.target_budget_kes}>
                    <input className={inputClass} type="number" min="1" max="500000000" inputMode="numeric" placeholder="e.g. 8500000" value={form.target_budget_kes} onChange={(e) => update('target_budget_kes', e.target.value)} aria-invalid={!!errors.target_budget_kes} />
                  </Field>
                  <Field label="Fuel type preference" error={errors.fuel_type}>
                    <select className={inputClass} value={form.fuel_type} onChange={(e) => update('fuel_type', e.target.value)}>
                      <option value="Any">Any fuel type</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </Field>
                  <Field label="Import preference" error={errors.import_type}>
                    <select className={inputClass} value={form.import_type} onChange={(e) => update('import_type', e.target.value)}>
                      <option value="CIF">CIF — Mombasa arrival</option>
                      <option value="Doorstep">Doorstep — delivery after clearance</option>
                    </select>
                  </Field>
                  <Field label="Full name" error={errors.full_name}>
                    <input className={inputClass} autoComplete="name" placeholder="Your full name" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} aria-invalid={!!errors.full_name} />
                  </Field>
                  <Field label="Phone number" error={errors.phone}>
                    <input className={inputClass} type="tel" autoComplete="tel" inputMode="tel" placeholder="+254 7XX XXX XXX" value={form.phone} onChange={(e) => update('phone', e.target.value)} aria-invalid={!!errors.phone} />
                  </Field>
                  <Field label="Email address" error={errors.email} className="sm:col-span-2">
                    <input className={inputClass} type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(e) => update('email', e.target.value)} aria-invalid={!!errors.email} />
                  </Field>
                </div>

                <div aria-hidden="true" className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden">
                  <label htmlFor="import-website">Website</label>
                  <input id="import-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => update('website', e.target.value)} />
                </div>

                {submitError && <p className="text-sm text-destructive-foreground" role="alert">{submitError}</p>}
                <div className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-5 text-muted-foreground">Your information is used to respond to this import request.</p>
                  <Button type="submit" size="lg" disabled={submitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    {submitting ? 'Sending request…' : 'Send import request'} <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card py-10">
        <div className="container mx-auto flex flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-lg font-semibold">Have a specific vehicle in mind?</p>
            <p className="mt-1 text-sm text-muted-foreground">Explore our available vehicles while we prepare your import brief.</p>
          </div>
          <Link to="/inventory" className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-all hover:gap-3">
            Browse inventory <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  error,
  className = '',
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-foreground/80">
        {label}
        {children}
      </label>
      {error && <p className="mt-1.5 text-xs text-destructive-foreground" role="alert">{error}</p>}
    </div>
  );
}