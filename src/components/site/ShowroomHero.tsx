import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';

const FRAME_COUNT = 240;
const framePath = (i: number) =>
  `/frames/ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`;

// Smoothstep-style ramp mapping a value within [a,b] to 0..1.
const ramp = (p: number, a: number, b: number) => {
  const t = Math.min(1, Math.max(0, (p - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Story-scroll copy synced to scroll percentage zones.
const STORY = [
  { at: [0, 0.33] as const, title: 'ENGINEERED PERFECTION', sub: 'Precision-built machines for the discerning few.' },
  { at: [0.34, 0.66] as const, title: 'CURATED LUXURY SELECTION', sub: 'Hand-picked imports. Executive-grade excellence.' },
  { at: [0.67, 1] as const, title: 'YOUR NEXT RIDE AWAITS', sub: 'Step into the AYAD showroom experience.' },
];

export function ShowroomHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const storyRefs = useRef<Array<HTMLDivElement | null>>([]);

  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrame = useRef(0);

  // 1. PRELOADING ENGINE
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

  // 2. CANVAS + GSAP SCROLLTRIGGER
  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

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

    // Responsive object-fit: cover math, centered.
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
      ctx.fillStyle = '#060608';
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    };

    // Story-scroll text state machine — one active block at a time.
    const updateStory = (p: number) => {
      STORY.forEach((s, i) => {
        const el = storyRefs.current[i];
        if (!el) return;
        const [a, b] = s.at;
        // Fade in over first 6% of the zone, out over the last 6%.
        const span = b - a;
        const fadeIn = ramp(p, a, a + span * 0.28);
        const fadeOut = 1 - ramp(p, b - span * 0.28, b);
        const active = i === STORY.length - 1 ? fadeIn : fadeIn * fadeOut;
        el.style.opacity = String(active);
        el.style.transform = `translateY(${(1 - active) * 20}px)`;
      });
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

          const idx = Math.min(
            FRAME_COUNT - 1,
            Math.round(p * (FRAME_COUNT - 1)),
          );
          if (idx !== currentFrame.current) {
            currentFrame.current = idx;
            drawFrame(idx);
          }

          updateStory(p);

          if (scrollHintRef.current) {
            scrollHintRef.current.style.opacity = String(1 - ramp(p, 0.02, 0.12));
          }
          if (ctaRef.current) {
            // CTAs stay visible; gently settle in with the first story block.
            const appear = ramp(p, 0, 0.15);
            ctaRef.current.style.opacity = String(appear * (1 - ramp(p, 0.72, 0.9)));
          }
        },
      });

      drawFrame(0);
      updateStory(0);
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
              className="h-full bg-gradient-to-r from-transparent via-accent to-transparent transition-[width] duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* HERO — 500vh scroll container */}
      <section ref={containerRef} className="relative h-[500vh] bg-background">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <canvas ref={canvasRef} className="block h-full w-full" />

          {/* Cinematic vignette */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/70 via-background/20 to-background/85" />

          {/* UNIFIED TEXT WRAPPER — story-scroll blocks stacked, one visible at a time */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center pointer-events-none">
            <div className="relative w-full max-w-5xl h-[9rem] sm:h-[11rem] md:h-[13rem]">
              {STORY.map((s, i) => (
                <div
                  key={s.title}
                  ref={(el) => { storyRefs.current[i] = el; }}
                  className="absolute inset-0 flex flex-col items-center justify-center will-change-[opacity,transform]"
                >
                  <p className="text-[0.65rem] sm:text-xs uppercase tracking-[0.5em] text-accent mb-4">
                    Ngong Road · Nairobi
                  </p>
                  <h1 className="serif-display metallic-text text-4xl sm:text-6xl md:text-7xl lg:text-[5rem] font-medium leading-[1.05] tracking-[0.06em]">
                    {s.title}
                  </h1>
                  <p className="mt-4 text-sm sm:text-lg tracking-[0.28em] uppercase text-secondary-foreground/80">
                    {s.sub}
                  </p>
                </div>
              ))}
            </div>

            {/* DUAL HERO CTAs */}
            <div
              ref={ctaRef}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto will-change-[opacity]"
            >
              <Link
                to="/inventory"
                className="group inline-flex items-center gap-3 bg-platinum text-background px-8 py-4 text-sm uppercase tracking-[0.25em] font-semibold rounded-md transition-all hover:shadow-[0_0_28px_-4px_rgba(226,232,240,0.6)]"
                style={{ backgroundColor: 'var(--platinum)' }}
              >
                Explore Inventory
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/trade-in"
                className="neon-outline inline-flex items-center gap-3 bg-transparent px-8 py-4 text-sm uppercase tracking-[0.25em] font-semibold rounded-md text-foreground"
              >
                Value Your Trade-In
              </Link>
            </div>
          </div>

          {/* Scroll hint */}
          <div
            ref={scrollHintRef}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 will-change-[opacity]"
          >
            <span className="text-[0.6rem] uppercase tracking-[0.4em] text-muted-foreground">
              Scroll
            </span>
            <span className="h-10 w-px bg-gradient-to-b from-accent to-transparent" />
          </div>
        </div>
      </section>
    </>
  );
}
