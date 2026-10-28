import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X, Flame } from 'lucide-react';
import { dealership } from '@/config/dealership';
import { waLink } from '@/lib/inventory-data';
import { onBlazeOpen } from '@/hooks/use-blaze-chat';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const SESSION_KEY = 'ayad-blaze-session';

const GREETING =
  "Karibu Ayad Automotives! I'm Blaze — ask me about our imports, financing, trade-ins or booking a test drive.";

function getSessionId() {
  if (typeof window === 'undefined') return '';
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoSendRef = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setSessionId(getSessionId());
    // Blaze keeps memory on the backend (per browser session), but every
    // refresh starts a visually clean chat — no restored local history.
    try {
      window.localStorage.removeItem('ayad-blaze-history');
    } catch {}
    setMessages([]);
  }, []);

  // Listen for global "open Blaze" events (from CTAs across the site).
  useEffect(() => {
    if (!mounted) return;
    return onBlazeOpen(({ prompt, autoSend }) => {
      setOpen(true);
      setInput(prompt);
      if (autoSend) autoSendRef.current = prompt;
      setTimeout(() => inputRef.current?.focus(), 60);
    });
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, mounted]);

  // Fire autoSend once the input state has been applied.
  useEffect(() => {
    if (autoSendRef.current && input === autoSendRef.current && !loading && sessionId) {
      const q = autoSendRef.current;
      autoSendRef.current = null;
      void send(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, sessionId]);

  async function send(override?: string) {
    const text = (override ?? input).trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((m) => [...m, { role: 'assistant', content: data.error ?? 'Sorry, something went wrong.' }]);
      } else {
        setMessages((m) => [...m, { role: 'assistant', content: data.reply || '…' }]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'Network error. You can reach us on WhatsApp instead.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <>
      {/* Floating trigger */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Blaze AI concierge"
          className="fixed bottom-5 right-5 z-50 group"
        >
          <span className="absolute inset-0 rounded-full bg-accent/50 opacity-50 blaze-ping" />
          <span className="relative flex items-center gap-2 pl-3 pr-4 py-3 rounded-full bg-gradient-to-br from-accent to-accent/70 text-accent-foreground shadow-xl shadow-accent/30 hover:scale-105 transition-transform">
            <Flame className="w-5 h-5" />
            <span className="text-sm font-semibold hidden sm:inline">Chat with Blaze</span>
            <span className="text-sm font-semibold sm:hidden">Blaze</span>
          </span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          className="fixed inset-x-0 bottom-0 sm:inset-x-auto sm:right-5 sm:bottom-5 z-50 sm:w-[380px] max-h-[85vh] sm:max-h-[600px] flex flex-col rounded-t-2xl sm:rounded-2xl border border-border bg-background/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden animate-in slide-in-from-bottom duration-200"
          role="dialog"
          aria-label="Blaze AI concierge"
        >
          <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-gradient-to-r from-accent/20 to-transparent">
            <span className="w-9 h-9 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center">
              <Flame className="w-4 h-4 text-accent" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">Blaze · {dealership.brand.name}</p>
              <p className="text-[0.65rem] uppercase tracking-wider text-accent">Online · Multilingual</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded hover:bg-white/10" aria-label="Close chat">
              <X className="w-4 h-4" />
            </button>
          </header>

          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 text-sm">
            <Bubble role="assistant" content={GREETING} />
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} />
            ))}
            {loading && (
              <div className="flex gap-1 items-center text-xs text-muted-foreground pl-2">
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            )}
          </div>

          <div className="border-t border-border p-3 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Blaze anything…"
                className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-accent text-accent-foreground rounded-lg px-3 py-2 disabled:opacity-40 hover:bg-accent/90"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <a
              href={waLink('Hello Ayad Automotives! I would like to speak with a sales person.')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-[0.7rem] uppercase tracking-wider text-muted-foreground hover:text-accent"
            >
              <MessageCircle className="w-3.5 h-3.5" /> Prefer a human? WhatsApp sales
            </a>
          </div>
        </div>
      )}
    </>
  );
}

function Bubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2 whitespace-pre-wrap leading-relaxed ${
          isUser
            ? 'bg-accent text-accent-foreground rounded-br-sm'
            : 'bg-white/5 border border-white/10 text-foreground rounded-bl-sm'
        }`}
      >
        {content}
      </div>
    </div>
  );
}
