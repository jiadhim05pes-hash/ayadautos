interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export function PageHero({ eyebrow, title, subtitle }: PageHeroProps) {
  return (
    <section className="pt-28 pb-12 md:pt-36 md:pb-16 border-b border-border bg-gradient-to-b from-card to-background">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        {eyebrow && <p className="text-xs md:text-sm uppercase tracking-widest accent-red font-semibold mb-3">{eyebrow}</p>}
        <h1 className="display-font text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">{title}</h1>
        {subtitle && <p className="mt-4 text-base md:text-lg text-muted-foreground">{subtitle}</p>}
      </div>
    </section>
  );
}
