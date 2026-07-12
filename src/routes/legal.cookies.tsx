import { createFileRoute } from '@tanstack/react-router';
import { LegalLayout } from '@/components/site/LegalLayout';

export const Route = createFileRoute('/legal/cookies')({
  head: () => ({
    meta: [
      { title: 'Cookie Policy — Ayad Automotives' },
      { name: 'description', content: 'How this website uses cookies and similar technologies.' },
      { property: 'og:url', content: '/legal/cookies' },
    ],
    links: [{ rel: 'canonical', href: '/legal/cookies' }],
  }),
  component: () => (
    <LegalLayout title="Cookie Policy" updated="May 2026">
      <h2>What Are Cookies?</h2>
      <p>Cookies are small text files placed on your device when you visit a website. They help the site function and provide analytics so we can improve it.</p>
      <h2>Cookies We Use</h2>
      <ul>
        <li><strong>Essential cookies</strong> — required for the site to function (navigation, security).</li>
        <li><strong>Analytics cookies</strong> — anonymous data on how visitors use the site so we can improve it.</li>
        <li><strong>Preference cookies</strong> — remember basic settings such as preferred currency in the loan calculator.</li>
      </ul>
      <h2>Managing Cookies</h2>
      <p>Most browsers let you control cookies through settings. Blocking some cookies may affect functionality.</p>
      <h2>Third-Party Cookies</h2>
      <p>Embedded tools (such as future chatbot widgets) may set their own cookies. Refer to those providers' policies for details.</p>
    </LegalLayout>
  ),
});
