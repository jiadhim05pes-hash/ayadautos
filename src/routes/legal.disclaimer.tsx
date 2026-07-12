import { createFileRoute } from '@tanstack/react-router';
import { LegalLayout } from '@/components/site/LegalLayout';

export const Route = createFileRoute('/legal/disclaimer')({
  head: () => ({
    meta: [
      { title: 'Legal Disclaimer — Ayad Automotives' },
      { name: 'description', content: 'Important disclaimers regarding pricing, vehicle availability and financing information on this site.' },
      { property: 'og:url', content: '/legal/disclaimer' },
    ],
    links: [{ rel: 'canonical', href: '/legal/disclaimer' }],
  }),
  component: () => (
    <LegalLayout title="Legal Disclaimer" updated="May 2026">
      <h2>Information Accuracy</h2>
      <p>Information on this website is provided in good faith. We make no warranties, express or implied, regarding accuracy, completeness or fitness for any particular purpose.</p>
      <h2>Vehicle Specifications</h2>
      <p>Photographs, specifications and prices are indicative. Vehicles must be inspected in person prior to purchase. Mileage and condition are verified at handover.</p>
      <h2>Financing Estimates</h2>
      <p>The loan calculator on this site is for illustration only and does not constitute a financing offer, pre-approval, or guarantee of any rate or term.</p>
      <h2>External Links</h2>
      <p>This site may link to third-party websites. We are not responsible for the content or practices of those sites.</p>
      <h2>No Professional Advice</h2>
      <p>Nothing on this site constitutes legal, financial, tax or insurance advice. Always consult a qualified professional before making financial decisions.</p>
    </LegalLayout>
  ),
});
