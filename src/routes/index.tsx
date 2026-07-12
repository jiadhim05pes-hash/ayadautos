import { Link } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';
import { Card } from '@/components/ui/card';
import { Star, ArrowRight, Car, TrendingUp, DollarSign, Wrench, Heart, FileText, Zap, MessageCircle } from 'lucide-react';
import { featuredVehicles, formatKes, waLink } from '@/lib/inventory-data';
import { CountUp } from '@/components/site/CountUp';
import { PartnersMarquee } from '@/components/site/PartnersMarquee';
import { ShowroomHero } from '@/components/site/ShowroomHero';

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

function Home() {
  const featured = featuredVehicles(6);


  return (
    <div className="bg-background text-foreground">
      {/* Scroll-driven showroom hero */}
      <ShowroomHero />

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
              <Card key={title} className="glass p-5 hover:border-accent transition-colors">
                <Icon className="w-7 h-7 accent-red mb-3" />
                <h3 className="font-semibold mb-1 text-sm md:text-base">{title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{desc}</p>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/services" className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all">
              See full services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured inventory */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="section-title">Featured Inventory</h2>
            <p className="text-muted-foreground">Handpicked vehicles ready for viewing in Nairobi.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((v) => (
              <Card key={v.id} className="glass overflow-hidden border border-white/10 hover:border-accent transition-all duration-300 group py-0 hover:scale-[1.02]">
                <div className="h-52 relative overflow-hidden">
                  <img src={v.image} alt={v.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-bold">{v.registration}</div>
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-white">{v.year}</div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-lg text-white leading-tight">{v.name}</h3>
                    <span className="shrink-0 text-xs font-semibold accent-red border border-accent/40 rounded-md px-2 py-0.5">{v.year}</span>
                  </div>
                  <p className="text-2xl font-bold accent-red mb-3">{formatKes(v.priceKes)}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-white/70 mb-4">
                    <span>{v.fuel}</span><span>{v.transmission}</span>
                    <span>{v.mileageKm.toLocaleString()} km</span><span>{v.category}</span>
                  </div>
                  <a
                    href={waLink(`Hello! I'm interested in the ${v.name} (${v.year}, ${formatKes(v.priceKes)}). Please share more details.`)}
                    target="_blank" rel="noopener noreferrer"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-4 py-2 rounded-md w-full flex items-center justify-center gap-2 text-sm"
                  >
                    <MessageCircle className="w-4 h-4" /> Inquire
                  </a>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/inventory" className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded-md font-semibold">
              View Full Inventory <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials teaser */}
      <section className="py-20 bg-background">
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
