import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, UserIcon, Loader2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUserStore } from '../utils/store';
import { fetchJSON } from '../utils/fetchJSON';
import { BRAND_NAME } from '../brand';

const API_BASE = import.meta.env.VITE_NOTIFICATION_API_URL || '';

type Mode = 'login' | 'signup';

export default function AuthModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess?: () => void }) {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useUserStore();

  const reset = () => { setName(''); setEmail(''); setPassword(''); setError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'signup' && !name.trim()) { setError('Name is required'); return; }
    if (!email.trim()) { setError('Email is required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login' ? { email, password } : { name, email, password };
      const data = await fetchJSON<{ success: boolean; token?: string; user?: { name: string; email: string }; error?: string }>(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!data.success) throw new Error(data.error || 'Authentication failed');

      const { user: _u, token } = data;
      setAuth(
        { id: _u!.email, name: _u!.name, email: _u!.email, createdAt: new Date().toISOString() },
        token!
      );
      toast.success(mode === 'login' ? 'Welcome back!' : 'Account created!');
      reset();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8">
            <button onClick={onClose} disabled={loading} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"><X className="w-5 h-5" /></button>

            <h2 className="text-xl font-bold mb-1">{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              {mode === 'login' ? `Sign in to ${BRAND_NAME} to continue` : 'Create an account to place orders and track them'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <label className="block">
                  <span className="text-[10px] font-black uppercase text-zinc-400 mb-1.5 block">Name</span>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input value={name} onChange={e => setName(e.target.value)} disabled={loading} className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 pl-10 pr-4 text-sm outline-none bg-transparent focus:border-[#925FE2] transition-colors" placeholder="Your name" />
                  </div>
                </label>
              )}

              <label className="block">
                <span className="text-[10px] font-black uppercase text-zinc-400 mb-1.5 block">Email</span>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 pl-10 pr-4 text-sm outline-none bg-transparent focus:border-[#925FE2] transition-colors" placeholder="you@example.com" />
                </div>
              </label>

              <label className="block">
                <span className="text-[10px] font-black uppercase text-zinc-400 mb-1.5 block">Password</span>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 pl-10 pr-4 text-sm outline-none bg-transparent focus:border-[#925FE2] transition-colors" placeholder="At least 6 characters" />
                </div>
              </label>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" disabled={loading} className="do-btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : null}
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-zinc-500 mt-6">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button type="button" onClick={switchMode} disabled={loading} className="font-bold text-[#111] dark:text-white hover:text-[#925FE2] dark:hover:text-[#925FE2] transition-colors underline underline-offset-2">
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
