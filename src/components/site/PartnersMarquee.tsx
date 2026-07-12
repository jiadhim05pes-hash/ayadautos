const PARTNERS = [
  'KCB Bank',
  'Equity Bank',
  'Stanbic Bank',
  'NCBA',
  'Absa',
  'Co-op Bank',
  'Mwalimu SACCO',
  'Stima SACCO',
  'Unaitas',
  'Kenya Police SACCO',
];

export function PartnersMarquee() {
  const row = [...PARTNERS, ...PARTNERS];
  return (
    <section
      aria-label="Trusted by top asset finance partners"
      className="border-y border-white/10 bg-black/60 py-6 overflow-hidden"
    >
      <p className="text-center text-xs uppercase tracking-[0.3em] text-white/50 mb-4">
        Trusted by top asset finance partners
      </p>
      <div className="relative">
        <div className="flex gap-12 animate-marquee whitespace-nowrap will-change-transform">
          {row.map((p, i) => (
            <span
              key={`${p}-${i}`}
              className="text-white/70 hover:text-accent transition-colors font-semibold tracking-wide text-sm md:text-base uppercase"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
