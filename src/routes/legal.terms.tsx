import { createFileRoute } from '@tanstack/react-router';
import { LegalLayout } from '@/components/site/LegalLayout';

export const Route = createFileRoute('/legal/terms')({
  head: () => ({
    meta: [
      { title: 'Terms & Conditions — Ayad Automotives' },
      { name: 'description', content: 'Terms governing your use of the Ayad Automotives website and services.' },
      { property: 'og:title', content: 'Terms & Conditions — Ayad Automotives' },
      { property: 'og:url', content: '/legal/terms' },
    ],
    links: [{ rel: 'canonical', href: '/legal/terms' }],
  }),
  component: () => (
    <LegalLayout title="Terms & Conditions of Use" updated="May 2026">
      <p>By accessing this website you agree to be bound by these terms. If you do not agree, please discontinue use.</p>
      <h2>Use of Website</h2>
      <p>The content on this site is for general information only. Inventory, pricing and financing terms shown are indicative and subject to change without notice. Final pricing and contractual terms are confirmed in writing at our showroom.</p>
      <h2>Intellectual Property</h2>
      <p>All trademarks, logos, photographs and content are the property of Ayad Automotives or their respective owners and may not be reproduced without permission.</p>
      <h2>Vehicle Listings</h2>
      <p>Vehicle availability, specifications, mileage and condition are accurate at time of publication. Always confirm details with our team before purchase.</p>
      <h2>Financing & Calculator</h2>
      <p>The loan calculator provides indicative figures only. Actual rates, fees and approval depend on the lender, your credit profile, and prevailing market conditions.</p>
      <h2>Limitation of Liability</h2>
      <p>To the extent permitted by Kenyan law, Ayad Automotives is not liable for any indirect or consequential loss arising from use of this website.</p>
      <h2>Governing Law</h2>
      <p>These terms are governed by the laws of the Republic of Kenya. Disputes shall be resolved in the courts of Nairobi.</p>
    </LegalLayout>
  ),
});
