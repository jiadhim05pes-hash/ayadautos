import { createFileRoute } from '@tanstack/react-router';
import { PageHero } from '@/components/site/PageHero';
import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';

export const Route = createFileRoute('/testimonials')({
  head: () => ({
    meta: [
      { title: 'Testimonials — Ayad Automotives' },
      { name: 'description', content: 'Hear from clients who trusted Ayad Automotives with their vehicle purchase, financing, and trade-ins.' },
      { property: 'og:title', content: 'Client Testimonials — Ayad Automotives' },
      { property: 'og:description', content: 'What our customers say about our dealership.' },
      { property: 'og:url', content: '/testimonials' },
    ],
    links: [{ rel: 'canonical', href: '/testimonials' }],
  }),
  component: TestimonialsPage,
});

const TESTIMONIALS = [
  { name: 'James Mwangi', role: 'Business Owner', text: 'Excellent service and quality vehicles. The team handled everything from selection to financing — I drove off in two weeks.' },
  { name: 'Sarah Kipchoge', role: 'Executive', text: 'Best dealership experience in Nairobi. Professional, transparent paperwork, and a beautiful Lexus RX delivered as promised.' },
  { name: 'David Okonkwo', role: 'Entrepreneur', text: 'Great financing options and support throughout the process. They walked me through the SACCO option which saved me thousands.' },
  { name: 'Aisha Hassan', role: 'Doctor', text: 'I imported a Prado through Ayad Automotives — clean process, fair pricing, and the vehicle arrived in exactly the spec I requested.' },
  { name: 'Peter Otieno', role: 'Logistics Manager', text: 'Their trade-in valuation was the most competitive in Nairobi. I upgraded to a CR-V without much out-of-pocket cost.' },
  { name: 'Linda Wanjiru', role: 'Consultant', text: 'Honest team. They told me the Camry I was eyeing had a small issue and suggested an alternative — that kind of integrity is rare.' },
];

function TestimonialsPage() {
  return (
    <>
      <PageHero eyebrow="Testimonials" title="Trusted by clients across Kenya." subtitle="Real feedback from buyers, importers, and trade-in customers." />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
          {TESTIMONIALS.map(t => (
            <Card key={t.name} className="glass p-6">
              <div className="flex gap-1 mb-3" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="w-4 h-4 fill-[color:var(--accent)] text-[color:var(--accent)]" />
                ))}
              </div>
              <p className="text-muted-foreground italic mb-4 text-sm leading-relaxed">"{t.text}"</p>
              <p className="font-semibold text-sm">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
