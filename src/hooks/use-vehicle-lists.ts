import { useCallback, useEffect, useSyncExternalStore } from 'react';

/**
 * Shared favourites + compare lists persisted in localStorage.
 * Uses a module-scoped store + useSyncExternalStore so every card,
 * badge, and page stays in sync with zero re-render waste.
 */

type Kind = 'favorites' | 'compare';

const KEYS: Record<Kind, string> = {
  favorites: 'ayad.favorites',
  compare: 'ayad.compare',
};

const MAX_COMPARE = 4;

type Store = Record<Kind, Set<string>>;
const store: Store = { favorites: new Set(), compare: new Set() };
const listeners = new Set<() => void>();
let hydrated = false;

function hydrate() {
  if (hydrated || typeof window === 'undefined') return;
  try {
    for (const k of Object.keys(KEYS) as Kind[]) {
      const raw = window.localStorage.getItem(KEYS[k]);
      if (raw) store[k] = new Set(JSON.parse(raw) as string[]);
    }
  } catch {
    /* ignore */
  }
  hydrated = true;
}

function persist(kind: Kind) {
  try {
    window.localStorage.setItem(KEYS[kind], JSON.stringify(Array.from(store[kind])));
  } catch {
    /* ignore */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  hydrate();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function snapshot(kind: Kind) {
  return store[kind];
}
const emptySet = new Set<string>();
function serverSnapshot() {
  return emptySet;
}

export function useVehicleList(kind: Kind) {
  const set = useSyncExternalStore(
    subscribe,
    () => snapshot(kind),
    serverSnapshot,
  );

  const toggle = useCallback(
    (id: string) => {
      hydrate();
      const s = store[kind];
      if (s.has(id)) {
        s.delete(id);
      } else {
        if (kind === 'compare' && s.size >= MAX_COMPARE) return;
        s.add(id);
      }
      store[kind] = new Set(s); // new ref for snapshot equality
      persist(kind);
      emit();
    },
    [kind],
  );

  const clear = useCallback(() => {
    store[kind] = new Set();
    persist(kind);
    emit();
  }, [kind]);

  return { ids: set, toggle, clear, has: (id: string) => set.has(id), count: set.size };
}

export function useHydrated() {
  const s = useSyncExternalStore(
    (cb) => {
      const id = requestAnimationFrame(cb);
      return () => cancelAnimationFrame(id);
    },
    () => true,
    () => false,
  );
  // avoid unused ref warning; also re-run once client mounts.
  useEffect(() => void s, [s]);
  return s;
}
