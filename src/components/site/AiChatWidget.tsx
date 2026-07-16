import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X, Sparkles } from 'lucide-react';
import { dealership } from '@/config/dealership';
import { waLink } from '@/lib/inventory-data';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const SESSION_KEY = 'ayad-ai-session';
const HISTORY_KEY = 'ayad-ai-history';

const GREETING =
  "Karibu Ayad Automotives! I'm your AI concierge — ask me about our imports, financing or booking a viewing. English, Kiswahili au Sheng — yote sawa.";

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

  useEffect(() => {
    setMounted(true);
    setSessionId(getSessionId());
    try {
      const raw = window.localStorage.getItem(HISTORY_KEY);
      if (raw) setMessages(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-30)));
    } catch {}
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, mounted]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, messages: next }),
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
          aria-label="Open AI concierge"
          className="fixed bottom-5 right-5 z-50 group"
        >
          <span className="absolute inset-0 rounded-full bg-accent/60 opacity-60 animate-ping" />
          <span className="relative flex items-center gap-2 pl-3 pr-4 py-3 rounded-full bg-gradient-to-br from-accent to-accent/70 text-accent-foreground shadow-xl shadow-accent/30 hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-semibold hidden sm:inline">Ask AI Concierge</span>
            <span className="text-sm font-semibold sm:hidden">AI</span>
          </span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          className="fixed inset-x-0 bottom-0 sm:inset-x-auto sm:right-5 sm:bottom-5 z-50 sm:w-[380px] max-h-[85vh] sm:max-h-[600px] flex flex-col rounded-t-2xl sm:rounded-2xl border border-border bg-background/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden animate-in slide-in-from-bottom duration-200"
          role="dialog"
          aria-label="AI Concierge chat"
        >
          <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-gradient-to-r from-accent/20 to-transparent">
            <span className="w-9 h-9 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-accent" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">{dealership.brand.name} AI</p>
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
                send();
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message…"
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
