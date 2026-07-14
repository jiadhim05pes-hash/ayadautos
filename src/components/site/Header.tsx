import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Menu, X, MessageCircle, Heart, GitCompare } from 'lucide-react';
import { waLink } from '@/lib/inventory-data';
import { useVehicleList } from '@/hooks/use-vehicle-lists';

const PRIMARY = [
  { to: '/inventory', label: 'Inventory' },
  { to: '/financing', label: 'Financing' },
  { to: '/trade-in', label: 'Trade-In' },
] as const;

const SECONDARY = [
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/testimonials', label: 'Testimonials' },
  { to: '/faqs', label: 'FAQs' },
  { to: '/contact', label: 'Contact' },
  { to: '/favorites', label: 'Favourites & Compare' },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const wa = waLink('Hello Ayad Automotives! I would like to learn more about your vehicles.');
  const menuRef = useRef<HTMLDivElement | null>(null);
  const favs = useVehicleList('favorites');
  const comp = useVehicleList('compare');

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
        scrolled ? 'bg-black/80 border-white/10' : 'bg-black/50 border-white/5'
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link
          to="/"
          aria-label="AYAD Automotives — Home"
          className="text-lg md:text-2xl font-bold display-font tracking-[0.18em] text-white hover:text-accent transition-colors shrink-0"
          onClick={() => setOpen(false)}
        >
          AYAD <span className="text-accent">AUTOMOTIVES</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          {PRIMARY.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeProps={{ className: 'text-accent' }}
              className="text-white/85 uppercase tracking-[0.2em] text-[0.72rem] font-semibold hover:text-accent transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2" ref={menuRef}>
          <Link
            to="/favorites"
            aria-label="Favourites and compare"
            className="relative hidden sm:inline-grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/80 hover:text-accent hover:border-accent transition-colors"
          >
            <Heart className="w-4 h-4" />
            {favs.count > 0 && <Badge n={favs.count} />}
          </Link>
          <Link
            to="/favorites"
            aria-label="Compare list"
            className="relative hidden sm:inline-grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/80 hover:text-accent hover:border-accent transition-colors"
          >
            <GitCompare className="w-4 h-4" />
            {comp.count > 0 && <Badge n={comp.count} />}
          </Link>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground text-xs uppercase tracking-[0.2em] font-semibold px-4 py-2 rounded-md transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
          <div className="relative">
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
                className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden animate-fade-in"
              >
                <nav className="py-2">
                  <div className="md:hidden">
                    {PRIMARY.map((n) => (
                      <MenuLink key={n.to} to={n.to} onClick={() => setOpen(false)}>
                        {n.label}
                      </MenuLink>
                    ))}
                    <Separator />
                  </div>
                  {SECONDARY.map((n) => (
                    <MenuLink key={n.to} to={n.to} onClick={() => setOpen(false)}>
                      {n.label}
                    </MenuLink>
                  ))}
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-[0.22em] font-semibold text-accent border-t border-white/10 hover:bg-white/10"
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

function MenuLink({
  to,
  onClick,
  children,
}: {
  to: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      activeProps={{ className: 'text-accent bg-white/5' }}
      onClick={onClick}
      className="block px-4 py-2.5 text-[0.72rem] uppercase tracking-[0.22em] font-semibold text-white/80 hover:bg-white/10 hover:text-accent transition-colors"
    >
      {children}
    </Link>
  );
}

function Separator() {
  return <div className="my-1 border-t border-white/10" />;
}

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute -top-1.5 -right-1.5 min-w-[1.1rem] h-[1.1rem] px-1 grid place-items-center rounded-full bg-accent text-[0.6rem] font-bold text-accent-foreground">
      {n}
    </span>
  );
}
