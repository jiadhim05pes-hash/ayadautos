import { createFileRoute, Link } from '@tanstack/react-router';
import { PageHero } from '@/components/site/PageHero';
import { Card } from '@/components/ui/card';
import { ShieldCheck, Award, Globe2, Users } from 'lucide-react';

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [
      { title: 'About Us — Ayad Automotives' },
      { name: 'description', content: 'Learn about Ayad Automotives — a trusted Nairobi dealership specialising in Japanese imports and executive vehicles since 2010.' },
      { property: 'og:title', content: 'About Ayad Automotives' },
      { property: 'og:description', content: 'Trusted Nairobi dealership specialising in Japanese imports and executive vehicles.' },
      { property: 'og:url', content: '/about' },
    ],
    links: [{ rel: 'canonical', href: '/about' }],
  }),
  component: AboutPage,
});

const VALUES = [
  { icon: ShieldCheck, title: 'Verified Quality', desc: 'Every vehicle is inspected and certified before being listed.' },
  { icon: Award, title: '15+ Years Experience', desc: 'A decade and a half of trusted dealership expertise in Kenya.' },
  { icon: Globe2, title: 'Direct Imports', desc: 'Established partnerships with vetted suppliers in Japan, UK and UAE.' },
  { icon: Users, title: 'Client First', desc: 'Honest advice, transparent paperwork, and after-sales support.' },
];

function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About Us" title="Driven by Trust. Built on Service." subtitle="Ayad Automotives is a premium vehicle dealership on Ngong Road, Nairobi — known for transparency, integrity and the quality of every car we deliver." />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-10 items-start max-w-5xl">
          <div>
            <h2 className="display-font text-3xl font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground mb-4">Founded with a mission to make premium vehicle ownership accessible in Kenya, Ayad Automotives has grown into one of Nairobi's most recognised independent dealerships. Our team combines technical knowledge, market insight, and a deep respect for our clients' time and budget.</p>
            <p className="text-muted-foreground">We import directly from trusted overseas suppliers and prepare each vehicle for Kenyan roads before handover — papers, registration, and a full mechanical check included.</p>
          </div>
          <div>
            <h2 className="display-font text-3xl font-bold mb-4">What We Stand For</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {VALUES.map(({ icon: Icon, title, desc }) => (
                <Card key={title} className="glass p-5">
                  <Icon className="w-7 h-7 accent-red mb-3" />
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="display-font text-2xl md:text-3xl font-bold mb-3">Visit our showroom</h2>
          <p className="text-muted-foreground mb-5">Ngong Road, Nairobi. We're open Monday – Saturday.</p>
          <Link to="/contact" className="inline-block bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded-md font-semibold">Get directions</Link>
        </div>
      </section>
    </>
  );
}
