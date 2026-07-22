/**
 * Global bridge that lets any component open Blaze (the AI concierge)
 * with a pre-filled prompt. Fired as a browser CustomEvent so the widget
 * itself remains the only subscriber and no React context is required.
 */
export type BlazeIntent =
  | 'test_drive'
  | 'trade_in'
  | 'finance'
  | 'inquiry'
  | 'general';

export interface OpenBlazeOptions {
  prompt: string;
  intent?: BlazeIntent;
  autoSend?: boolean;
}

const EVENT = 'blaze:open';

export function openBlaze(opts: OpenBlazeOptions) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<OpenBlazeOptions>(EVENT, { detail: opts }));
}

export function onBlazeOpen(handler: (opts: OpenBlazeOptions) => void) {
  if (typeof window === 'undefined') return () => {};
  const listener = (e: Event) => handler((e as CustomEvent<OpenBlazeOptions>).detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
