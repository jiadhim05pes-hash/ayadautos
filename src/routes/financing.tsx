import { createFileRoute, Link } from '@tanstack/react-router';
import { PageHero } from '@/components/site/PageHero';
import { LoanCalculator } from '@/components/site/LoanCalculator';
import { Card } from '@/components/ui/card';
import { Building2, Users, FileCheck, Headphones } from 'lucide-react';
import { useVehicles } from '@/hooks/use-vehicles';

export const Route = createFileRoute('/financing')({
  validateSearch: (s: Record<string, unknown>) => ({
    price: typeof s.price === 'number' ? s.price : undefined,
    id: typeof s.id === 'string' ? s.id : undefined,
  }),
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
  const { price, id } = Route.useSearch();
  const { data: vehicles } = useVehicles();
  const vehicle = id ? vehicles.find((v) => v.id === id) : undefined;

  return (
    <>
      <PageHero
        eyebrow="Financing"
        title={vehicle ? `Financing for the ${vehicle.name}` : 'Plan your purchase with confidence.'}
        subtitle={vehicle
          ? 'The calculator below is pre-loaded with this vehicle. Adjust deposit and loan period to fit your budget.'
          : 'Estimate monthly payments, compare options, then talk to our team for a tailored quote.'}
      />
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <LoanCalculator
            initialPrice={price ?? vehicle?.priceKes}
            vehicle={
              vehicle
                ? { id: vehicle.id, name: vehicle.name, stock: stockId(vehicle.id), priceKes: vehicle.priceKes }
                : undefined
            }
          />
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
        </div>
      </section>

    </>
  );
}
