import { createFileRoute, Link } from '@tanstack/react-router';
import { PageHero } from '@/components/site/PageHero';
import { LoanCalculator } from '@/components/site/LoanCalculator';
import { Card } from '@/components/ui/card';
import { Building2, Users, FileCheck, Headphones } from 'lucide-react';

export const Route = createFileRoute('/financing')({
  head: () => ({
    meta: [
      { title: 'Financing & Loan Calculator — Ayad Automotives' },
      { name: 'description', content: 'Estimate your monthly vehicle payments. Bank and SACCO financing options for premium vehicles in Kenya.' },
      { property: 'og:title', content: 'Financing — Ayad Automotives' },
      { property: 'og:description', content: 'Multi-currency loan calculator and financing options.' },
      { property: 'og:url', content: '/financing' },
    ],
    links: [{ rel: 'canonical', href: '/financing' }],
  }),
  component: FinancingPage,
});

const OPTIONS = [
  { icon: Building2, title: 'Bank Financing', desc: 'Partner banks offer competitive asset finance for qualified buyers.' },
  { icon: Users, title: 'SACCO Financing', desc: 'Use your SACCO savings to secure flexible repayment terms.' },
  { icon: FileCheck, title: 'Documentation Support', desc: 'We guide you through every form, valuation, and approval step.' },
  { icon: Headphones, title: 'Pre-Qualification', desc: 'Get an indicative monthly payment in under a minute below.' },
];

function FinancingPage() {
  return (
    <>
      <PageHero eyebrow="Financing" title="Plan your purchase with confidence." subtitle="Estimate monthly payments, compare options, then talk to our team for a tailored quote." />
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <LoanCalculator />
        </div>
      </section>
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="section-title text-center">Your Financing Options</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {OPTIONS.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="glass p-5">
                <Icon className="w-7 h-7 accent-red mb-3" />
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/contact" className="inline-block bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded-md font-semibold">Request a financing quote</Link>
          </div>
        </div>
      </section>
    </>
  );
}
