import { Link } from '@tanstack/react-router';
import { MapPin, Phone, MessageCircle, Instagram, Facebook, Linkedin, Music2 } from 'lucide-react';
import { LOCATION_DISPLAY, PHONE_DISPLAY, waLink } from '@/lib/inventory-data';
import { SOCIALS } from '@/config/dealership';

const NEXAS_WA = waLink(
  "Hello AYAD NEXAS! I'm interested in building a similar AI-powered dealership system. Please share more details.",
);

const ICONS = { instagram: Instagram, tiktok: Music2, facebook: Facebook, linkedin: Linkedin };

export function SocialLinks({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {SOCIALS.map((s) => {
        const Icon = ICONS[s.key];
        return (
          <a
            key={s.key}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            className="group relative grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white/70 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:text-accent hover:shadow-[0_0_18px_-4px_var(--accent)]"
          >
            <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
          </a>
        );
      })}
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12 grid gap-10 md:grid-cols-3">
        <div>
          <h3 className="display-font text-xl font-bold accent-red mb-3 tracking-wide">AYAD AUTOMOTIVES</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Premium Japanese imports and executive vehicles. Trusted dealership on Ngong Road, Nairobi.
          </p>
          <SocialLinks className="mt-5" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-3">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="text-muted-foreground hover:text-accent">About Us</Link></li>
            <li><Link to="/services" className="text-muted-foreground hover:text-accent">Services</Link></li>
            <li><Link to="/inventory" className="text-muted-foreground hover:text-accent">Inventory</Link></li>
            <li><Link to="/financing" className="text-muted-foreground hover:text-accent">Financing</Link></li>
            <li><Link to="/testimonials" className="text-muted-foreground hover:text-accent">Testimonials</Link></li>
            <li><Link to="/faqs" className="text-muted-foreground hover:text-accent">FAQs</Link></li>
            <li><Link to="/contact" className="text-muted-foreground hover:text-accent">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-3">Contact</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><MapPin className="w-4 h-4 accent-red mt-0.5 shrink-0" /><span>{LOCATION_DISPLAY}</span></li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4 accent-red shrink-0" /><a href="tel:+254768487356" className="hover:text-accent">{PHONE_DISPLAY}</a></li>
            <li className="flex items-center gap-2"><MessageCircle className="w-4 h-4 accent-red shrink-0" /><a href={waLink('Hello Ayad Automotives!')} target="_blank" rel="noopener noreferrer" className="hover:text-accent">WhatsApp</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-5 flex flex-col items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <p>
            Designed &amp; Powered by{' '}
            <a
              href={NEXAS_WA}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/90 hover:text-accent font-semibold tracking-[0.2em]"
            >
              AYAD NEXAS
            </a>
          </p>
          <p>© {year} Ayad Automotives. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
