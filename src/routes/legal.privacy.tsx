import { createFileRoute } from '@tanstack/react-router';
import { LegalLayout } from '@/components/site/LegalLayout';

export const Route = createFileRoute('/legal/privacy')({
  head: () => ({
    meta: [
      { title: 'Privacy Policy — Ayad Automotives' },
      { name: 'description', content: 'How Ayad Automotives collects, uses and protects your personal information.' },
      { property: 'og:title', content: 'Privacy Policy — Ayad Automotives' },
      { property: 'og:url', content: '/legal/privacy' },
    ],
    links: [{ rel: 'canonical', href: '/legal/privacy' }],
  }),
  component: () => (
    <LegalLayout title="Privacy Policy" updated="May 2026">
      <p>Ayad Automotives ("we", "us", "our") respects your privacy and is committed to protecting the personal data you share with us through this website and our showroom interactions.</p>
      <h2>Information We Collect</h2>
      <ul>
        <li>Contact details you submit (name, phone, email) when inquiring about a vehicle or financing.</li>
        <li>Vehicle preferences, budget range and trade-in details you voluntarily share.</li>
        <li>Basic analytics data (pages viewed, device type) to improve our service.</li>
      </ul>
      <h2>How We Use Your Information</h2>
      <ul>
        <li>To respond to inquiries and prepare tailored vehicle and financing quotes.</li>
        <li>To process trade-ins, imports, registration and after-sales support.</li>
        <li>To share occasional updates about new inventory (only if you opt in).</li>
      </ul>
      <h2>Sharing</h2>
      <p>We share data only with partner banks, SACCOs, insurance providers and government agencies (NTSA, KRA) strictly as required to complete the service you requested. We do not sell personal data.</p>
      <h2>Your Rights</h2>
      <p>You may request access, correction, or deletion of your personal data at any time by emailing us at <a href="mailto:ayadnexas@gmail.com">ayadnexas@gmail.com</a>.</p>
      <h2>Security</h2>
      <p>We use industry-standard safeguards. No method of transmission is 100% secure, but we take reasonable steps to protect your information.</p>
      <h2>Contact</h2>
      <p>Questions about this policy? Reach us at <a href="mailto:ayadnexas@gmail.com">ayadnexas@gmail.com</a> or +254 768 487 356.</p>
    </LegalLayout>
  ),
});
