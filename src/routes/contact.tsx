import { createFileRoute } from '@tanstack/react-router';
import { PageHero } from '@/components/site/PageHero';
import { Card } from '@/components/ui/card';
import { MapPin, Phone, MessageCircle, Mail, Clock } from 'lucide-react';
import { waLink, PHONE_DISPLAY, LOCATION_DISPLAY } from '@/lib/inventory-data';

export const Route = createFileRoute('/contact')({
  head: () => ({
    meta: [
      { title: 'Contact — Ayad Automotives' },
      { name: 'description', content: 'Visit our Ngong Road showroom in Nairobi, call us, or reach out on WhatsApp.' },
      { property: 'og:title', content: 'Contact Ayad Automotives' },
      { property: 'og:description', content: 'Ngong Road, Nairobi. Call, visit, or message us on WhatsApp.' },
      { property: 'og:url', content: '/contact' },
    ],
    links: [{ rel: 'canonical', href: '/contact' }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const wa = waLink('Hello Ayad Automotives! I would like to get in touch.');
  return (
    <>
      <PageHero eyebrow="Contact" title="We'd love to hear from you." subtitle="Visit our showroom, call, or message us on WhatsApp — we reply quickly." />
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Card className="glass p-6">
              <MapPin className="w-8 h-8 accent-red mb-3" />
              <h3 className="font-bold mb-1">Showroom</h3>
              <p className="text-sm text-muted-foreground">{LOCATION_DISPLAY}</p>
            </Card>
            <Card className="glass p-6">
              <Phone className="w-8 h-8 accent-red mb-3" />
              <h3 className="font-bold mb-1">Call us</h3>
              <a href="tel:+254768487356" className="text-sm text-muted-foreground hover:text-accent">{PHONE_DISPLAY}</a>
            </Card>
            <Card className="glass p-6">
              <MessageCircle className="w-8 h-8 accent-red mb-3" />
              <h3 className="font-bold mb-1">WhatsApp</h3>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-accent">{PHONE_DISPLAY}</a>
            </Card>
            <Card className="glass p-6">
              <Mail className="w-8 h-8 accent-red mb-3" />
              <h3 className="font-bold mb-1">Email</h3>
              <a href="mailto:ayadnexas@gmail.com" className="text-sm text-muted-foreground hover:text-accent break-all">ayadnexas@gmail.com</a>
            </Card>
            <Card className="glass p-6">
              <Clock className="w-8 h-8 accent-red mb-3" />
              <h3 className="font-bold mb-1">Hours</h3>
              <p className="text-sm text-muted-foreground">Mon–Sat · 8:30 – 18:00</p>
            </Card>
          </div>

          <div className="mt-10 text-center">
            <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white px-6 py-3 rounded-md font-semibold">
              <MessageCircle className="w-5 h-5" /> Message us on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
