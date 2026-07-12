import { PageHero } from './PageHero';

interface LegalLayoutProps {
  title: string;
  updated: string;
  children: React.ReactNode;
}

export function LegalLayout({ title, updated, children }: LegalLayoutProps) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title} subtitle={`Last updated: ${updated}`} />
      <section className="py-12 bg-background">
        <article className="container mx-auto px-4 max-w-3xl prose-legal">
          {children}
        </article>
      </section>
      <style>{`
        .prose-legal h2 { font-family: 'Montserrat', sans-serif; font-size: 1.5rem; font-weight: 700; margin-top: 2rem; margin-bottom: 0.75rem; color: var(--foreground); }
        .prose-legal h3 { font-family: 'Montserrat', sans-serif; font-size: 1.15rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; color: var(--foreground); }
        .prose-legal p, .prose-legal li { color: var(--muted-foreground); line-height: 1.7; margin-bottom: 0.75rem; font-size: 0.95rem; }
        .prose-legal ul { padding-left: 1.25rem; list-style: disc; margin-bottom: 1rem; }
        .prose-legal a { color: var(--accent); text-decoration: underline; }
      `}</style>
    </>
  );
}
