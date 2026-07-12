import { createFileRoute } from '@tanstack/react-router';
import { LegalLayout } from '@/components/site/LegalLayout';

export const Route = createFileRoute('/legal/refund')({
  head: () => ({
    meta: [
      { title: 'Refund Policy — Ayad Automotives' },
      { name: 'description', content: 'Our refund and cancellation policy for deposits, imports and vehicle purchases.' },
      { property: 'og:url', content: '/legal/refund' },
    ],
    links: [{ rel: 'canonical', href: '/legal/refund' }],
  }),
  component: () => (
    <LegalLayout title="Refund Policy" updated="May 2026">
      <h2>Deposits</h2>
      <p>Deposits made to reserve a specific vehicle are refundable within 7 days of payment, provided the vehicle has not been removed from sale at your request. After 7 days, deposits are non-refundable but transferable to another vehicle of equivalent value.</p>
      <h2>Imports on Request</h2>
      <p>For bespoke imports sourced on your behalf, deposits become non-refundable once the supplier has been paid and the auction or purchase confirmed. We will provide written confirmation before that point.</p>
      <h2>Completed Sales</h2>
      <p>All vehicle sales are final once the logbook has been transferred. Mechanical issues outside of any written guarantee are not covered by refund.</p>
      <h2>Faulty Service or Misrepresentation</h2>
      <p>If a service was not delivered as described, contact us within 14 days at <a href="mailto:ayadnexas@gmail.com">ayadnexas@gmail.com</a>. We investigate every concern in good faith.</p>
      <h2>Disputes</h2>
      <p>Disputes are resolved in accordance with our Terms & Conditions and the laws of Kenya.</p>
    </LegalLayout>
  ),
});
