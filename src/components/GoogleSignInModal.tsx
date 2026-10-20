import React, { useState, useEffect, useRef } from 'react';
import { X, UserPlus, Check, Trash2, Shield, ArrowRight, Sparkles, AlertCircle, ExternalLink, Copy } from 'lucide-react';
import { authService, parseJwt } from '../services/authService';
import { SavedGoogleAccount, UserProfile } from '../types';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  mode?: 'signin' | 'link';
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: string;
              size?: string;
              type?: string;
              text?: string;
              shape?: string;
              logo_alignment?: string;
              width?: number;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode = 'signin',
}) => {
  const [savedAccounts, setSavedAccounts] = useState<SavedGoogleAccount[]>([]);
  const [view, setView] = useState<'chooser' | 'new_account'>('chooser');
  const [emailInput, setEmailInput] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [gisAvailable, setGisAvailable] = useState<boolean>(false);
  const [copiedDomain, setCopiedDomain] = useState<boolean>(false);

  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  // Load saved Google accounts on device
  const refreshAccounts = () => {
    const list = authService.getSavedGoogleAccounts();
    setSavedAccounts(list);
    if (list.length === 0) {
      setView('new_account');
    }
  };

  useEffect(() => {
    if (isOpen) {
      setError(null);
      refreshAccounts();
    }
  }, [isOpen]);

  // Attempt to mount Google Identity Services if client ID is provided in env
  useEffect(() => {
    if (!isOpen) return;

    const clientId = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GOOGLE_CLIENT_ID;
    if (window.google?.accounts?.id && clientId && googleBtnContainerRef.current) {
      setGisAvailable(true);
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (response.credential) {
              setLoading(true);
              try {
                const user = await authService.signInWithGoogleJwt(response.credential);
                onSuccess(user);
                onClose();
              } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Google authentication failed');
              } finally {
                setLoading(false);
              }
            }
          },
        });

        googleBtnContainerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'signin_with',
          logo_alignment: 'left',
          width: 320,
        });
      } catch (err) {
        console.warn('GIS button render error:', err);
      }
    }
  }, [isOpen, view]);

  if (!isOpen) return null;

  const handleLaunchGooglePopup = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await authService.signInWithGooglePopup();
      onSuccess(user);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in cancelled or failed.';
      if (msg.includes('popup-closed-by-user')) {
        setError('Google sign-in popup was closed.');
      } else if (msg.includes('unauthorized-domain')) {
        setError(`unauthorized-domain:${window.location.hostname}`);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccount = async (account: SavedGoogleAccount) => {
    setError(null);
    setLoading(true);
    try {
      if (mode === 'link') {
        const user = await authService.linkGoogleAccount(account.email, account.name, account.avatarUrl);
        onSuccess(user);
      } else {
        const user = await authService.signInWithGoogleAccount({
          email: account.email,
          name: account.name,
          avatarUrl: account.avatarUrl,
          sub: account.sub,
        });
        onSuccess(user);
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google account.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewGoogleAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanName = nameInput.trim() || cleanEmail.split('@')[0];

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid Google email address (e.g. name@gmail.com).');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (mode === 'link') {
        const user = await authService.linkGoogleAccount(cleanEmail, cleanName);
        onSuccess(user);
      } else {
        const user = await authService.signInWithGoogleAccount({
          email: cleanEmail,
          name: cleanName,
        });
        onSuccess(user);
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to connect Google account.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAccount = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    authService.removeSavedGoogleAccount(email);
    refreshAccounts();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-[440px] bg-white rounded-3xl shadow-2xl border border-stone-200/80 overflow-hidden font-sans-custom">
        {/* Top Header bar */}
        <div className="p-6 pb-4 border-b border-stone-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Google Colorful G Logo */}
            <div className="w-10 h-10 rounded-full border border-stone-100 shadow-2xs flex items-center justify-center bg-white shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            </div>
            <div>
              <h3 className="text-base font-semibold text-stone-900 leading-tight">
                {mode === 'link' ? 'Connect Google Account' : 'Sign in with Google'}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                to continue to <span className="font-medium text-rose-950 font-cormorant text-sm">Rosebloom Monthsary</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            error.startsWith('unauthorized-domain:') ? (
              <div className="mb-4 p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 space-y-2.5">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-amber-900">Third-Party Domain Authorization Needed</div>
                    <p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
                      Firebase blocks Google sign-in on new third-party domains by default until added to <strong>Authorized Domains</strong> in the Firebase Console.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-white/95 rounded-xl border border-amber-200 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Your Domain:</div>
                    <div className="font-mono text-xs font-semibold text-stone-900 truncate">
                      {window.location.hostname}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.hostname);
                      setCopiedDomain(true);
                      setTimeout(() => setCopiedDomain(false), 2000);
                    }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200/90 px-2.5 py-1 rounded-lg cursor-pointer transition-colors shrink-0"
                  >
                    {copiedDomain ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDomain ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                  <a
                    href="https://console.firebase.google.com/project/skilful-theorem-5v4kj/authentication/settings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    <span>Add in Firebase Console</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setView('new_account');
                    }}
                    className="text-xs text-amber-900 font-semibold underline underline-offset-2 hover:text-amber-700 cursor-pointer"
                  >
                    Or Enter Details Manually →
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 leading-tight">
                {error}
              </div>
            )
          )}

          {/* GIS native button container if client ID is configured */}
          {gisAvailable && (
            <div className="mb-4 flex flex-col items-center">
              <div ref={googleBtnContainerRef} />
              <div className="my-3 flex items-center gap-2 w-full">
                <div className="h-[1px] flex-1 bg-stone-200" />
                <span className="text-[10px] text-stone-400 uppercase tracking-wider">or select below</span>
                <div className="h-[1px] flex-1 bg-stone-200" />
              </div>
            </div>
          )}

          {/* Primary One-Click Google OAuth Popup via Firebase */}
          <button
            type="button"
            onClick={handleLaunchGooglePopup}
            disabled={loading}
            className="w-full mb-4 py-2.5 px-4 rounded-2xl bg-white border border-stone-300 hover:border-stone-400 hover:bg-stone-50 shadow-xs flex items-center justify-center gap-3 text-xs font-semibold text-stone-800 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{loading ? 'Opening Google...' : 'Open Official Google Sign-In Popup'}</span>
          </button>

          {view === 'chooser' ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-[1px] flex-1 bg-stone-200" />
                <span className="text-[10px] text-stone-400 uppercase tracking-wider">or choose saved account</span>
                <div className="h-[1px] flex-1 bg-stone-200" />
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {savedAccounts.map((acc) => (
                  <div
                    key={acc.email}
                    onClick={() => handleSelectAccount(acc)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl border border-stone-200 hover:border-rose-300 hover:bg-rose-50/30 transition-all cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-rose-100 border border-rose-200 shrink-0 flex items-center justify-center font-bold text-rose-700 text-sm">
                        {acc.avatarUrl ? (
                          <img src={acc.avatarUrl} alt={acc.name} className="w-full h-full object-cover" />
                        ) : (
                          acc.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-stone-900 truncate flex items-center gap-1.5">
                          <span>{acc.name}</span>
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-full font-normal">
                            Google
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono truncate">{acc.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleRemoveAccount(e, acc.email)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                        title="Remove from this device"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-rose-600 transition-colors shrink-0" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Action to add another account */}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setEmailInput('');
                  setNameInput('');
                  setView('new_account');
                }}
                className="w-full mt-2 py-3 px-4 rounded-2xl border border-dashed border-stone-300 hover:border-rose-400 hover:bg-rose-50/20 text-xs font-medium text-stone-700 hover:text-rose-900 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-rose-500" />
                <span>Use another Google account</span>
              </button>
            </div>
          ) : (
            /* New Google Account Entry form */
            <div>
              <div className="mb-4">
                <p className="text-xs text-stone-600 font-medium">
                  Enter your Google Account details:
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Any visitor or partner can enter their real Google Account to create their personal love letter workspace.
                </p>
              </div>

              <form onSubmit={handleCreateNewGoogleAccount} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Google Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="yourname@gmail.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Name (Display Name)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex or Maya"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    This name will appear as the author on your romantic letters and website.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  {savedAccounts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setView('chooser')}
                      className="px-3 py-2 text-xs text-stone-600 hover:text-stone-900 cursor-pointer font-medium"
                    >
                      ← Back to saved accounts
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !emailInput}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-semibold shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{loading ? 'Authenticating...' : mode === 'link' ? 'Link Account' : 'Continue with Google'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer info notice */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Private &amp; Secure Account Isolation</span>
          </div>
          <span className="text-[10px] text-stone-400">OAuth Compatible</span>
        </div>
      </div>
    </div>
  );
};
