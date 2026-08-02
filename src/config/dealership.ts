/**
 * Dealership configuration — single source of branding, contact info and
 * business rules for THIS dealership. Cloning this platform for another
 * Ayad Nexas client means overriding only this file (and swapping vehicles
 * in the admin dashboard).
 */
export const dealership = {
  brand: {
    name: 'Ayad Automotives',
    displayName: 'AYAD AUTOMOTIVES',
    tagline: 'Premium Japanese Imports & Executive Vehicles',
    accent: '#00F0FF',
  },
  contact: {
    whatsappNumber: '254768487356',
    phoneDisplay: '+254 768 487 356',
    locationDisplay: 'Ngong Road, Nairobi, Kenya',
    salesEmail: 'ayadnexas@gmail.com',
    hours: 'Mon–Sat · 8:30 – 18:00',
  },
  ai: {
    // System prompt used by the on-site assistant (Phase 2).
    persona:
      "You are the sales concierge for Ayad Automotives, a premium Nairobi dealership. Answer in the user's language (English, Kiswahili or Sheng). Help with inventory, financing, trade-ins and test-drive bookings. Collect: name, phone, email, interested vehicle, budget, finance interest, trade-in interest, preferred viewing date. When the user asks for a human, escalate to WhatsApp on 254768487356.",
    escalateWhatsapp: true,
  },
  currency: { code: 'KES', locale: 'en-KE' },
} as const;

export type Dealership = typeof dealership;

export type SocialKey = 'instagram' | 'tiktok' | 'facebook' | 'linkedin';

export const SOCIALS: { key: SocialKey; label: string; href: string }[] = [
  { key: 'instagram', label: 'Instagram', href: 'https://instagram.com/ayad_nexas' },
  { key: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/@ayadnexas' },
  { key: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/ayadnexas' },
  { key: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/ibrahim-adan' },
];
