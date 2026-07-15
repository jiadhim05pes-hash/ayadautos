import { lazy, Suspense } from 'react';
import { Link, createFileRoute } from '@tanstack/react-router';
import { Card } from '@/components/ui/card';
import { Star, ArrowRight, Car, TrendingUp, DollarSign, Wrench, Heart, FileText, Zap, Truck, ShieldCheck, MapPin } from 'lucide-react';
import { useFeaturedVehicles } from '@/hooks/use-vehicles';
import { CountUp } from '@/components/site/CountUp';
import { PartnersMarquee } from '@/components/site/PartnersMarquee';
import { PremiumVehicleCard } from '@/components/site/PremiumVehicleCard';

// Lazy-load the heavy scroll-driven hero so the header/nav paint instantly.
const ShowroomHero = lazy(() =>
  import('@/components/site/ShowroomHero').then((m) => ({ default: m.ShowroomHero })),
);

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Ayad Automotives — Premium Japanese Imports & Executive Vehicles' },
      { name: 'description', content: 'Premium vehicle dealership on Ngong Road, Nairobi. Direct Japanese imports, executive SUVs, bank & SACCO financing, trade-ins.' },
      { property: 'og:title', content: 'Ayad Automotives' },
      { property: 'og:description', content: 'Premium Japanese Imports & Executive Vehicles — Ngong Road, Nairobi.' },
      { property: 'og:url', content: '/' },
    ],
    links: [{ rel: 'canonical', href: '/' }],
  }),
  component: Home,
});

const SERVICE_SUMMARY = [
  { icon: Car, title: 'Direct Imports', desc: 'Fresh Japanese imports to your doorstep.' },
  { icon: TrendingUp, title: 'Executive SUVs', desc: 'Premium SUVs for discerning clients.' },
  { icon: DollarSign, title: 'Bank Financing', desc: 'Competitive loans through partner banks.' },
  { icon: Wrench, title: 'SACCO Financing', desc: 'Flexible SACCO-backed solutions.' },
  { icon: Heart, title: 'Trade-In', desc: 'Fair valuations on your current car.' },
  { icon: FileText, title: 'Import On Behalf', desc: 'We source and import for you.' },
  { icon: Zap, title: 'Vehicle Sourcing', desc: 'Find the perfect car from our network.' },
  { icon: TrendingUp, title: 'Valuation', desc: 'Professional vehicle appraisal.' },
];

const DELIVERY = [
  { icon: Truck, title: 'Doorstep Delivery', desc: 'We deliver anywhere in Kenya — Nairobi, Mombasa, Kisumu, Eldoret & beyond.' },
  { icon: ShieldCheck, title: 'Insured Transport', desc: 'Every vehicle transported with full in-transit insurance cover.' },
  { icon: MapPin, title: 'Live Tracking', desc: 'Get status updates from dispatch to handover, straight to WhatsApp.' },
];

function Home() {
  const featured = featuredVehicles(6);

  return (
    <div className="bg-background text-foreground">
      <Suspense fallback={<div className="h-screen bg-background" />}>
        <ShowroomHero />
      </Suspense>

      {/* Trust stats */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { end: 500, suffix: '+', t: 'Vehicles Sold' },
              { end: 15, suffix: '+', t: 'Years Experience' },
              { end: 100, suffix: '%', t: 'Verified Imports' },
            ].map((s, i) => (
              <div key={i} className="glass p-6 rounded-xl text-center border border-white/10">
                <CountUp end={s.end} suffix={s.suffix} className="text-4xl font-bold accent-red mb-1 inline-block" />
                <p className="text-sm text-muted-foreground">{s.t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PartnersMarquee />

      {/* Services overview (brief) */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="section-title">Our Services</h2>
            <p className="text-muted-foreground">From import to delivery — everything handled under one roof.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SERVICE_SUMMARY.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group edge-card rounded-xl p-5">
                <Icon className="lift-icon w-7 h-7 text-foreground mb-3" />
                <h3 className="font-semibold mb-1 text-sm md:text-base">{title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/services" className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all">
              See full services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured inventory — premium cards, identical to inventory page */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="section-title">Featured Inventory</h2>
            <p className="text-muted-foreground">Handpicked vehicles ready for viewing in Nairobi.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((v) => (
              <PremiumVehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/inventory" className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded-md font-semibold">
              View Full Inventory <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Nationwide Delivery */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-[0.65rem] uppercase tracking-[0.5em] text-accent mb-3">Nationwide Delivery</p>
            <h2 className="section-title">Delivered to your doorstep, anywhere in Kenya.</h2>
            <p className="text-muted-foreground">
              We handle logistics end-to-end so you can drive away — wherever you are.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {DELIVERY.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group edge-card rounded-2xl p-6">
                <Icon className="lift-icon w-8 h-8 text-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials teaser */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="section-title">What Clients Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: 'James Mwangi', role: 'Business Owner', text: 'Excellent service and quality vehicles. Highly recommended!' },
              { name: 'Sarah Kipchoge', role: 'Executive', text: 'Best dealership experience in Nairobi. Professional and trustworthy.' },
              { name: 'David Okonkwo', role: 'Entrepreneur', text: 'Great financing options and support throughout the process.' },
            ].map((t) => (
              <Card key={t.name} className="glass p-6">
                <div className="flex gap-1 mb-3" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className="w-4 h-4 fill-[color:var(--accent)] text-[color:var(--accent)]" />
                  ))}
                </div>
                <p className="text-muted-foreground italic mb-4 text-sm">"{t.text}"</p>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/testimonials" className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all">
              Read more testimonials <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="py-16 bg-gradient-to-r from-accent/20 via-card to-accent/20 border-y border-border">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="display-font text-3xl md:text-4xl font-bold mb-3">Ready to find your next vehicle?</h2>
          <p className="text-muted-foreground mb-6">Visit our Ngong Road showroom or talk to us on WhatsApp today.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/contact" className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded-md font-semibold">Contact Us</Link>
            <Link to="/financing" className="border border-border hover:border-accent text-foreground px-6 py-3 rounded-md font-semibold">Get a Financing Quote</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
