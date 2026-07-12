import { createFileRoute, Link } from '@tanstack/react-router';
import { PageHero } from '@/components/site/PageHero';
import { Card } from '@/components/ui/card';
import { Car, TrendingUp, DollarSign, Wrench, Heart, FileText, Zap, Award } from 'lucide-react';

export const Route = createFileRoute('/services')({
  head: () => ({
    meta: [
      { title: 'Services — Ayad Automotives' },
      { name: 'description', content: 'Direct imports, executive SUV sales, bank and SACCO financing, trade-ins, valuations and bespoke vehicle sourcing from Japan, UK and UAE.' },
      { property: 'og:title', content: 'Services — Ayad Automotives' },
      { property: 'og:description', content: 'Imports, financing, trade-ins, sourcing and valuation services.' },
      { property: 'og:url', content: '/services' },
    ],
    links: [{ rel: 'canonical', href: '/services' }],
  }),
  component: ServicesPage,
});

const SERVICES = [
  { icon: Car, title: 'Direct Vehicle Imports', desc: 'Fresh imports from Japan, UK and UAE — we handle sourcing, shipping, clearance, registration and delivery.', benefits: ['Verified suppliers', 'Auction-grade reports', 'Door-to-door delivery'] },
  { icon: TrendingUp, title: 'Executive SUV Sales', desc: 'Curated premium SUVs ready for viewing on Ngong Road — Land Cruiser Prado, Lexus RX, Mercedes GLE, BMW X5 and more.', benefits: ['Inspected & certified', 'Fresh import or local registration', 'Walk-in viewing'] },
  { icon: DollarSign, title: 'Bank Financing', desc: 'We work with leading Kenyan banks to secure competitive asset finance for qualified buyers.', benefits: ['Tier-1 partner banks', 'Pre-approval support', 'Flexible repayment terms'] },
  { icon: Wrench, title: 'SACCO Financing', desc: 'Tailored SACCO-backed financing if your savings or credit union offers asset loans.', benefits: ['Lower interest rates', 'Member-friendly terms', 'Documentation support'] },
  { icon: Heart, title: 'Trade-In Services', desc: 'Bring your current car. We evaluate fairly and apply the value to your next purchase.', benefits: ['Same-day valuation', 'Transparent pricing', 'No-pressure offers'] },
  { icon: FileText, title: 'Import On Behalf', desc: 'Tell us the exact vehicle you want — make, model, year, budget — and we source it.', benefits: ['Bespoke sourcing', 'Auction bidding', 'End-to-end handling'] },
  { icon: Zap, title: 'Vehicle Sourcing', desc: 'Network of trusted partners across East Africa to locate hard-to-find vehicles.', benefits: ['Wide network', 'Specialist models', 'Fast turnaround'] },
  { icon: Award, title: 'Car Valuation', desc: 'Professional vehicle valuation for insurance, sale, transfer, or financing purposes.', benefits: ['Certified appraisers', 'Insurance accepted', 'Written reports'] },
];

function ServicesPage() {
  return (
    <>
      <PageHero eyebrow="Services" title="Everything you need, under one roof." subtitle="From sourcing the right vehicle abroad to financing and trade-ins — our team handles it." />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {SERVICES.map(({ icon: Icon, title, desc, benefits }) => (
              <Card key={title} className="glass p-6 hover:border-accent transition-colors">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-lg bg-accent/15 flex items-center justify-center">
                    <Icon className="w-6 h-6 accent-red" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">{title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{desc}</p>
                    <ul className="text-sm space-y-1">
                      {benefits.map(b => (
                        <li key={b} className="flex items-center gap-2 text-foreground/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" /> {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="display-font text-2xl md:text-3xl font-bold mb-3">Need a tailored service?</h2>
          <p className="text-muted-foreground mb-5">Talk to our team — we'll build a quote around your budget and timeline.</p>
          <Link to="/contact" className="inline-block bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded-md font-semibold">Talk to us</Link>
        </div>
      </section>
    </>
  );
}
