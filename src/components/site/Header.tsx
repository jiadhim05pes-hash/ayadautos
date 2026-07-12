import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Menu, X, MessageCircle } from 'lucide-react';
import { waLink } from '@/lib/inventory-data';

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/inventory', label: 'Inventory' },
  { to: '/financing', label: 'Financing' },
  { to: '/testimonials', label: 'Testimonials' },
  { to: '/faqs', label: 'FAQs' },
  { to: '/contact', label: 'Contact' },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const wa = waLink('Hello Ayad Automotives! I would like to learn more about your vehicles.');
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${
        scrolled ? 'bg-black/70 border-white/10' : 'bg-black/40 border-white/5'
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="text-lg md:text-2xl font-bold display-font accent-red shrink-0 tracking-wide"
          onClick={() => setOpen(false)}
        >
          AYAD AUTOMOTIVES
        </Link>
        <nav className="hidden lg:flex items-center gap-6 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === '/' }}
              activeProps={{ className: 'text-accent font-semibold' }}
              className="text-white/80 hover:text-accent transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2" ref={menuRef}>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground text-sm font-semibold px-4 py-2 rounded-md transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
          <div className="relative lg:hidden">
            <button
              onClick={() => setOpen((o) => !o)}
              className="p-2 rounded-md text-white/90 hover:bg-white/10 transition-colors"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            {open && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-black/85 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden animate-fade-in"
              >
                <nav className="py-1">
                  {NAV.map((n) => (
                    <Link
                      key={n.to}
                      to={n.to}
                      activeOptions={{ exact: n.to === '/' }}
                      activeProps={{ className: 'text-accent bg-white/5' }}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2 text-sm text-white/85 hover:bg-white/10 hover:text-accent transition-colors"
                    >
                      {n.label}
                    </Link>
                  ))}
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-accent border-t border-white/10 hover:bg-white/10"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
