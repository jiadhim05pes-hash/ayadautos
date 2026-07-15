import { useState, type FormEvent } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PageHero } from '@/components/site/PageHero';

export const Route = createFileRoute('/auth')({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === 'string' ? (s.redirect as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: 'Sign in — Ayad Automotives' },
      { name: 'description', content: 'Sign in to the Ayad Automotives dealership dashboard.' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const { redirect } = Route.useSearch();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const inputCls =
    'w-full bg-input border border-border rounded-md px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent';

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success('Account created. You can now sign in.');
        setMode('signin');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Signed in');
        nav({ to: redirect ?? '/admin' });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Dashboard"
        title={mode === 'signin' ? 'Sign in' : 'Create your account'}
        subtitle="Dealership team access."
      />
      <section className="py-14 bg-background">
        <div className="container mx-auto px-4 max-w-md">
          <form onSubmit={submit} className="edge-card rounded-xl p-6 space-y-4">
            {mode === 'signup' && (
              <input
                className={inputCls}
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <input
              className={inputCls}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className={inputCls}
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 py-3 rounded-md transition-all disabled:opacity-60"
            >
              {busy ? '…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
            <p className="text-sm text-center text-muted-foreground">
              {mode === 'signin' ? "New to the team?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-accent hover:underline"
              >
                {mode === 'signin' ? 'Create an account' : 'Sign in'}
              </button>
            </p>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-6">
            <Link to="/" className="hover:text-accent">← Back to site</Link>
          </p>
        </div>
      </section>
    </>
  );
}
