import { MessageCircle } from 'lucide-react';
import { waLink } from '@/lib/inventory-data';

export function WhatsAppFab() {
  const href = waLink('Hello Ayad Automotives! I would like to learn more about your vehicles.');
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 group"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-ping" />
      <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1da851] text-white shadow-xl shadow-black/40 transition-transform group-hover:scale-105">
        <MessageCircle className="w-6 h-6" />
      </span>
    </a>
  );
}
