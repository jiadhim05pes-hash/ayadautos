import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { InventorySearchBar } from './InventorySearchBar';

const FRAME_COUNT = 240;
// Show the hero immediately once this many frames are ready — the rest load in
// the background. Massively cuts perceived load time on repeat visits.
const READY_THRESHOLD = 24;

const framePath = (i: number) =>
  `/frames/ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`;

const ramp = (p: number, a: number, b: number) => {
  const t = Math.min(1, Math.max(0, (p - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Module-level frame cache — persists across route navigations so returning
// to the homepage is instant instead of re-downloading 240 images.
type CacheEntry = { images: HTMLImageElement[]; loaded: number; done: boolean };
let frameCache: CacheEntry | null = null;

function ensurePreload(onProgress: (loaded: number, done: boolean) => void) {
  if (frameCache) {
    onProgress(frameCache.loaded, frameCache.done);
    if (frameCache.done) return () => {};
  } else {
    frameCache = { images: new Array(FRAME_COUNT), loaded: 0, done: false };
    // Kick off priority batch first (fills first-paint window), then the rest.
    const cache = frameCache;
    const load = (i: number, priority: 'high' | 'low') => {
      const img = new Image();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (img as any).fetchPriority = priority;
      img.decoding = 'async';
      img.src = framePath(i);
      const done = () => {
        cache.loaded += 1;
        if (cache.loaded === FRAME_COUNT) cache.done = true;
        onProgress(cache.loaded, cache.done);
      };
      img.onload = done;
      img.onerror = done;
      cache.images[i] = img;
    };
    for (let i = 0; i < READY_THRESHOLD && i < FRAME_COUNT; i++) load(i, 'high');
    // Defer the rest so they never block first paint / hero interactivity.
    const rest = () => {
      for (let i = READY_THRESHOLD; i < FRAME_COUNT; i++) load(i, 'low');
    };
    if ('requestIdleCallback' in window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).requestIdleCallback(rest, { timeout: 1500 });
    } else {
      setTimeout(rest, 400);
    }
  }

  let cancelled = false;
  const poll = () => {
    if (cancelled || !frameCache) return;
    onProgress(frameCache.loaded, frameCache.done);
    if (!frameCache.done) setTimeout(poll, 120);
  };
  setTimeout(poll, 60);
  return () => {
    cancelled = true;
  };
}

const STORY = [
  { at: [0, 0.45] as const, title: '', sub: '' },
  { at: [0.45, 1] as const, title: 'YOUR NEXT RIDE AWAITS', sub: 'Step into the AYAD showroom.' },
];

export function ShowroomHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const storyRefs = useRef<Array<HTMLDivElement | null>>([]);

  const [ready, setReady] = useState(() => Boolean(frameCache?.loaded && frameCache.loaded >= READY_THRESHOLD));
  const [progress, setProgress] = useState(() =>
    frameCache ? Math.round((frameCache.loaded / FRAME_COUNT) * 100) : 0,
  );
  const currentFrame = useRef(0);

  // 1. PRELOAD (cached across mounts)
  useEffect(() => {
    return ensurePreload((loaded) => {
      setProgress(Math.round((loaded / FRAME_COUNT) * 100));
      if (loaded >= READY_THRESHOLD) setReady(true);
    });
  }, []);

  // 2. CANVAS + GSAP
  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true }) as CanvasRenderingContext2D | null;
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      drawFrame(currentFrame.current);
    };

    const drawFrame = (index: number) => {
      const img = frameCache?.images[index];
      if (!img || !img.complete || img.naturalWidth === 0) {
        // Fall back to the nearest available loaded frame.
        for (let d = 1; d < 12 && frameCache; d++) {
          const c = frameCache.images[Math.max(0, index - d)];
          if (c && c.complete && c.naturalWidth > 0) return paint(c);
        }
        return;
      }
      paint(img);
    };
    const paint = (img: HTMLImageElement) => {
      const cw = canvas.width;
      const ch = canvas.height;
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = cw / ch;
      let dw: number;
      let dh: number;
      if (cr > ir) { dw = cw; dh = cw / ir; } else { dh = ch; dw = ch * ir; }
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;
      ctx.fillStyle = '#060608';
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    };

    const updateStory = (p: number) => {
      STORY.forEach((s, i) => {
        const el = storyRefs.current[i];
        if (!el) return;
        const [a, b] = s.at;
        const span = b - a;
        const fadeIn = i === 0 ? 1 : ramp(p, a, a + span * 0.35);
        const fadeOut = 1 - ramp(p, b - span * 0.35, b);
        const active = i === STORY.length - 1 ? fadeIn : fadeIn * fadeOut;
        el.style.opacity = String(active);
        el.style.transform = `translateY(${(1 - active) * 20}px)`;
      });
    };

    // Apply safe initial states synchronously (before the async GSAP import)
    // so nothing flashes visible during the plugin load or on route return.
    const applyInitialState = () => {
      updateStory(0);
      if (scrollHintRef.current) scrollHintRef.current.style.opacity = '1';
      if (ctaRef.current) ctaRef.current.style.opacity = '0';
      if (taglineRef.current) {
        taglineRef.current.style.opacity = '0';
        taglineRef.current.style.transform = 'translateY(14px)';
      }
      if (searchRef.current) {
        searchRef.current.style.opacity = '0';
        searchRef.current.style.transform = 'translateY(24px)';
        searchRef.current.style.pointerEvents = 'none';
      }
    };
    applyInitialState();

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
          const idx = Math.min(FRAME_COUNT - 1, Math.round(p * (FRAME_COUNT - 1)));
          if (idx !== currentFrame.current) {
            currentFrame.current = idx;
            drawFrame(idx);
          }
          updateStory(p);
          if (scrollHintRef.current)
            scrollHintRef.current.style.opacity = String(1 - ramp(p, 0.02, 0.12));
          if (ctaRef.current) {
            const appear = ramp(p, 0, 0.15);
            ctaRef.current.style.opacity = String(appear * (1 - ramp(p, 0.6, 0.8)));
          }
          if (taglineRef.current) {
            // Appears in sync with the CTAs, then fades out as the next story beat arrives.
            const tag = ramp(p, 0, 0.15) * (1 - ramp(p, 0.42, 0.58));
            taglineRef.current.style.opacity = String(tag);
            taglineRef.current.style.transform = `translateY(${(1 - tag) * 14}px)`;
          }
          if (searchRef.current) {
            // Search toolbar reveals once the hero animation is essentially done.
            const reveal = ramp(p, 0.82, 0.98);
            searchRef.current.style.opacity = String(reveal);
            searchRef.current.style.transform = `translateY(${(1 - reveal) * 24}px)`;
            searchRef.current.style.pointerEvents = reveal > 0.4 ? 'auto' : 'none';
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
      {!ready && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
          <p className="serif-display metallic-text text-2xl sm:text-3xl tracking-[0.35em] mb-6 text-center px-4">
            AYAD AUTOMOTIVES
          </p>
          <p className="text-[0.7rem] uppercase tracking-[0.4em] text-muted-foreground mb-5">
            Preparing showroom… {progress}%
          </p>
          <div className="h-px w-56 sm:w-72 bg-border overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-transparent via-accent to-transparent transition-[width] duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Reduced height for faster scroll payoff — 300vh instead of 500vh */}
      <section ref={containerRef} className="relative h-[300vh] bg-background">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <canvas ref={canvasRef} className="block h-full w-full" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/70 via-background/10 to-background/90" />

          {/* SIMPLIFIED overlay: minimal copy, dual CTAs */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center pointer-events-none">
            <div className="relative w-full max-w-4xl h-[8rem] sm:h-[10rem] md:h-[12rem]">
              {STORY.map((s, i) => (
                <div
                  key={s.title}
                  ref={(el) => { storyRefs.current[i] = el; }}
                  style={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center will-change-[opacity,transform]"
                >
                  <p className="text-[0.6rem] sm:text-xs uppercase tracking-[0.5em] text-accent mb-3">
                    Welcome
                  </p>
                  <h1 className="serif-display metallic-text text-4xl sm:text-6xl md:text-7xl font-medium leading-[1.05] tracking-[0.06em]">
                    {s.title}
                  </h1>
                  <p className="mt-3 text-xs sm:text-sm tracking-[0.28em] uppercase text-secondary-foreground/70">
                    {s.sub}
                  </p>
                </div>
              ))}
            </div>

            <div
              ref={ctaRef}
              style={{ opacity: 0 }}
              className="mt-8 flex flex-col items-center justify-center gap-4 pointer-events-auto will-change-[opacity]"
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/inventory"
                  className="group inline-flex items-center gap-3 px-8 py-3.5 text-xs uppercase tracking-[0.28em] font-semibold rounded-md transition-all hover:shadow-[0_0_28px_-4px_rgba(226,232,240,0.6)]"
                  style={{ backgroundColor: 'var(--platinum)', color: 'var(--background)' }}
                >
                  Explore Inventory
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/trade-in"
                  className="neon-outline inline-flex items-center gap-3 bg-transparent px-8 py-3.5 text-xs uppercase tracking-[0.28em] font-semibold rounded-md text-foreground"
                >
                  Value Your Trade-In
                </Link>
              </div>
              <p
                ref={taglineRef}
                style={{ opacity: 0 }}
                className="text-xs sm:text-sm uppercase tracking-[0.3em] font-medium text-foreground/90 text-center will-change-[opacity,transform]"
              >
                Executive imports for the discerning few.
              </p>
            </div>
          </div>

          {/* FLOATING SEARCH TOOLBAR — reveals near end of hero */}
          <div
            ref={searchRef}
            className="absolute inset-x-0 bottom-8 mx-auto max-w-6xl px-4 opacity-0 transition-transform"
            style={{ pointerEvents: 'none' }}
          >
            <InventorySearchBar floating />
          </div>

          <div
            ref={scrollHintRef}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 will-change-[opacity]"
          >
            <span className="text-[0.6rem] uppercase tracking-[0.4em] text-muted-foreground">Scroll</span>
            <span className="h-10 w-px bg-gradient-to-b from-accent to-transparent" />
          </div>
        </div>
      </section>
    </>
  );
}
