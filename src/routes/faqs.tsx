import { createFileRoute } from '@tanstack/react-router';
import { PageHero } from '@/components/site/PageHero';

export const Route = createFileRoute('/faqs')({
  head: () => ({
    meta: [
      { title: 'FAQs — Ayad Automotives' },
      { name: 'description', content: 'Common questions about buying, importing, financing, and trading in vehicles at Ayad Automotives.' },
      { property: 'og:title', content: 'FAQs — Ayad Automotives' },
      { property: 'og:description', content: 'Answers to common buyer questions.' },
      { property: 'og:url', content: '/faqs' },
    ],
    links: [{ rel: 'canonical', href: '/faqs' }],
    scripts: [{
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQS.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }),
    }],
  }),
  component: FaqsPage,
});

const FAQS = [
  { q: 'Do you import vehicles on request?', a: 'Yes. Tell us the exact make, model, year and budget. We source from verified Japan, UK and UAE suppliers and handle shipping, clearance and registration.' },
  { q: 'What payment methods do you accept?', a: 'Bank transfer, cheque, M-Pesa for deposits, and financing through our partner banks and SACCOs.' },
  { q: 'Do you offer financing?', a: 'Yes. We work with leading Kenyan banks and SACCOs. Use our loan calculator on the Financing page for an indicative monthly payment.' },
  { q: 'Can I trade in my current car?', a: 'Absolutely. Bring it to our Ngong Road showroom for a same-day valuation. The trade-in value is applied to your next purchase.' },
  { q: 'Are your vehicles inspected?', a: 'Every vehicle is mechanically inspected and certified before being listed. Import vehicles come with auction-grade reports where applicable.' },
  { q: 'How long does an import take?', a: 'Typically 6–10 weeks from sourcing to delivery, depending on shipping schedule and clearance.' },
  { q: 'Do you handle registration paperwork?', a: 'Yes. Logbook transfer, NTSA registration, and all import documentation is handled by our team.' },
  { q: 'Do you offer warranty?', a: 'Where available we pass through manufacturer/extended warranties. For used imports we provide a written mechanical guarantee on key components.' },
];

function FaqsPage() {
  return (
    <>
      <PageHero eyebrow="FAQs" title="Frequently asked questions." subtitle="Quick answers about buying, importing, financing and trade-ins." />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl space-y-3">
          {FAQS.map((f, i) => (
            <details key={i} className="glass rounded-lg group overflow-hidden">
              <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-4 font-semibold">
                <span>{f.q}</span>
                <span className="accent-red text-2xl leading-none group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">{f.a}</div>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
