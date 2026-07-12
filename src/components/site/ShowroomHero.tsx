import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Car, TrendingUp } from 'lucide-react';

const FRAME_COUNT = 240;
const framePath = (i: number) =>
  `/frames/ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`;

// Smoothstep-style ramp mapping a value within [a,b] to 0..1.
const ramp = (p: number, a: number, b: number) => {
  const t = Math.min(1, Math.max(0, (p - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function ShowroomHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  // Frame images kept in a ref so effects don't re-run when they load.
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrame = useRef(0);

  // 1. PRELOADING ENGINE — cache every frame in memory, track progress.
  useEffect(() => {
    let cancelled = false;
    let loaded = 0;
    const images: HTMLImageElement[] = new Array(FRAME_COUNT);

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = framePath(i);
      const done = () => {
        if (cancelled) return;
        loaded += 1;
        setProgress(Math.round((loaded / FRAME_COUNT) * 100));
        if (loaded === FRAME_COUNT) setReady(true);
      };
      img.onload = done;
      img.onerror = done;
      images[i] = img;
    }
    imagesRef.current = images;

    return () => {
      cancelled = true;
    };
  }, []);

  // 2. CANVAS + GSAP SCROLLTRIGGER — only after frames are cached.
  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // 3. HARDWARE ACCELERATION
    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
    }) as CanvasRenderingContext2D | null;
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      drawFrame(currentFrame.current);
    };

    // ASPECT RATIO COVERAGE — object-fit: cover math, centered.
    const drawFrame = (index: number) => {
      const img = imagesRef.current[index];
      if (!img || !img.complete || img.naturalWidth === 0) return;
      const cw = canvas.width;
      const ch = canvas.height;
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = cw / ch;
      let dw: number;
      let dh: number;
      if (cr > ir) {
        dw = cw;
        dh = cw / ir;
      } else {
        dh = ch;
        dw = ch * ir;
      }
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;
      ctx.fillStyle = '#0B0C10';
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    };

    let st: { kill: () => void } | undefined;
    let disposed = false;

    (async () => {
      const gsapMod = await import('gsap');
      const stMod = await import('gsap/ScrollTrigger');
      if (disposed) return;
      const gsap = gsapMod.gsap ?? gsapMod.default;
      const ScrollTrigger = stMod.ScrollTrigger ?? stMod.default;
      gsap.registerPlugin(ScrollTrigger);

      resize();
      window.addEventListener('resize', resize);

      st = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        onUpdate: (self: { progress: number }) => {
          const p = self.progress;

          // 1. CANVAS DRAW LOOP — map scroll to frame index.
          const idx = Math.min(
            FRAME_COUNT - 1,
            Math.round(p * (FRAME_COUNT - 1)),
          );
          if (idx !== currentFrame.current) {
            currentFrame.current = idx;
            drawFrame(idx);
          }

          // 4. CONTENT ZONES TIMELINE — fade text with scroll percentage.
          if (heroTextRef.current) {
            heroTextRef.current.style.opacity = String(1 - ramp(p, 0.1, 0.28));
          }
          if (scrollHintRef.current) {
            scrollHintRef.current.style.opacity = String(1 - ramp(p, 0.02, 0.12));
          }
          if (cardsRef.current) {
            const appear = ramp(p, 0.52, 0.7);
            const leave = ramp(p, 0.9, 1);
            cardsRef.current.style.opacity = String(appear * (1 - leave));
            cardsRef.current.style.transform = `translateY(${(1 - appear) * 40}px)`;
          }
        },
      });

      drawFrame(0);
      ScrollTrigger.refresh();
    })();

    return () => {
      disposed = true;
      window.removeEventListener('resize', resize);
      st?.kill();
    };
  }, [ready]);

  return (
    <>
      {/* Minimalist metallic preloader */}
      {!ready && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
          <p className="serif-display metallic-text text-2xl sm:text-3xl tracking-[0.35em] mb-6 text-center px-4">
            AYAD AUTOMOTIVES
          </p>
          <p className="text-[0.7rem] sm:text-xs uppercase tracking-[0.4em] text-muted-foreground mb-5">
            Initializing Showroom… {progress}%
          </p>
          <div className="h-px w-56 sm:w-72 bg-border overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-transparent via-primary to-transparent transition-[width] duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* HERO CANVAS CONTAINMENT — 500vh scroll container */}
      <section ref={containerRef} className="relative h-[500vh] bg-background">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <canvas ref={canvasRef} className="block h-full w-full" />

          {/* Cinematic vignette for contrast */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/70 via-background/20 to-background/80" />

          {/* TEXT OVERLAY — hero */}
          <div
            ref={heroTextRef}
            className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center will-change-[opacity,transform]"
          >
            <p className="text-[0.65rem] sm:text-xs uppercase tracking-[0.5em] text-primary/80 mb-6">
              Ngong Road · Nairobi
            </p>
            <h1 className="serif-display metallic-text text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-medium leading-[1.05] tracking-[0.06em] max-w-5xl">
              PREMIUM JAPANESE IMPORTS
              <br className="hidden sm:block" /> &amp; EXECUTIVE VEHICLES
            </h1>
            <p className="mt-6 text-sm sm:text-lg tracking-[0.3em] uppercase text-secondary-foreground/80">
              Curated Luxury. Tailored Finance.
            </p>
          </div>

          {/* Scroll hint */}
          <div
            ref={scrollHintRef}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 will-change-[opacity]"
          >
            <span className="text-[0.6rem] uppercase tracking-[0.4em] text-muted-foreground">
              Scroll
            </span>
            <span className="h-10 w-px bg-gradient-to-b from-primary to-transparent" />
          </div>

          {/* CONTENT ZONES — premium service cards fade up over the canvas */}
          <div
            ref={cardsRef}
            className="absolute inset-0 flex items-center justify-center px-6 opacity-0 will-change-[opacity,transform]"
          >
            <div className="w-full max-w-4xl">
              <p className="text-center text-[0.65rem] uppercase tracking-[0.5em] text-primary/80 mb-8">
                The Ayad Standard
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                {[
                  {
                    icon: Car,
                    title: 'Direct Imports',
                    desc: 'Fresh, verified Japanese imports sourced and delivered to your door.',
                  },
                  {
                    icon: TrendingUp,
                    title: 'Executive SUVs',
                    desc: 'A curated fleet of premium SUVs for the most discerning clients.',
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="glass rounded-xl p-7 text-left backdrop-blur-xl"
                  >
                    <Icon className="mb-4 h-8 w-8 text-primary" />
                    <h3 className="serif-display text-2xl tracking-wide text-foreground mb-2">
                      {title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-10 flex justify-center">
                <Link
                  to="/inventory"
                  className="group inline-flex items-center gap-3 border border-primary/40 bg-primary/5 px-8 py-4 text-sm uppercase tracking-[0.25em] text-foreground transition-all hover:bg-primary hover:text-primary-foreground"
                >
                  Enter the Showroom
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
