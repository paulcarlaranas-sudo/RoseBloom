import React, { useState } from 'react';
import { Heart, Sparkles, Lock, Mail, User, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, ExternalLink } from 'lucide-react';
import { authService } from '../services/authService';
import { GlowingDustOverlay } from '../components/GlowingDustOverlay';
import { GoogleSignInModal } from '../components/GoogleSignInModal';

interface AuthPageProps {
  onSignedIn: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSignedIn }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showGoogleModal, setShowGoogleModal] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await authService.signInWithEmail(email, password);
      } else {
        await authService.signUpWithEmail(name, email, password);
      }
      onSignedIn();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#FAF7F5] via-[#FFF3F6] to-[#FDEEF2] overflow-hidden">
      {/* Floating Glowing Stardust Overlay */}
      <GlowingDustOverlay density={60} />

      {/* Ambient background bloom glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-rose-200/40 via-pink-100/30 to-amber-100/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-100/90 transition-all font-sans-custom">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 border border-rose-200/80 text-rose-500 shadow-xs mb-3">
            <Heart className="w-6 h-6 fill-rose-300 text-rose-500" />
          </div>
          <h1 className="font-cormorant text-3xl sm:text-4xl font-semibold text-rose-950 tracking-tight">
            Rosebloom Monthsary
          </h1>
          <p className="text-xs text-stone-600 mt-1 font-sans-custom">
            Sign in with your Google Account or email to create your private romantic website
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-rose-50/80 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-white text-rose-950 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-rose-950 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Google Sign In One-Click Button */}
        <button
          type="button"
          onClick={() => setShowGoogleModal(true)}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 hover:border-stone-400 text-stone-800 text-xs font-semibold shadow-xs transition-all cursor-pointer mb-5"
        >
          {/* Google Icon SVG */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-2 mb-5">
          <div className="flex-1 h-[1px] bg-stone-200" />
          <span className="text-[11px] text-stone-500 uppercase tracking-widest font-sans-custom">
            or sign in with email
          </span>
          <div className="flex-1 h-[1px] bg-stone-200" />
        </div>

        {/* Error message */}
        {error && (
          error.includes('unauthorized-domain') ? (
            <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
              <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Domain Not Authorized in Firebase Yet</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Your third-party domain <strong className="font-mono">{window.location.hostname}</strong> needs to be added to Authorized Domains in the Firebase Console.
              </p>
              <div className="pt-1 flex items-center justify-between">
                <a
                  href="https://console.firebase.google.com/project/skilful-theorem-5v4kj/authentication/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-amber-800 hover:text-amber-950 underline underline-offset-2 text-[11px]"
                >
                  <span>Open Firebase Settings</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(true)}
                  className="text-xs text-rose-700 font-medium hover:underline cursor-pointer"
                >
                  Enter Account Manually →
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 leading-tight">
              {error}
            </div>
          )
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans-custom">
          {mode === 'signup' && (
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Your Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya or Liam"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
                />
                <User className="w-4 h-4 text-rose-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
              />
              <Mail className="w-4 h-4 text-rose-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
              />
              <Lock className="w-4 h-4 text-rose-400 absolute left-3 top-3 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium shadow-md shadow-rose-300/40 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>{loading ? 'Entering...' : mode === 'signin' ? 'Sign In & Enter Dashboard' : 'Create & Enter'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Google Sign In Chooser / Entry Modal */}
      <GoogleSignInModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSuccess={() => onSignedIn()}
      />
    </div>
  );
};
