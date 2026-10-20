import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  X,
  Home,
  Eye,
  Edit3,
  Share2,
  Sparkles,
  Download,
  Layers,
  User,
  LogOut,
  Lock,
  KeyRound,
  Heart,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Check,
  Sparkle,
} from 'lucide-react';
import { AppRoute, UserProfile } from '../types';

interface TopNavProps {
  currentRoute: AppRoute;
  currentUser: UserProfile | null;
  isReceiverMode: boolean;
  girlfriendName?: string;
  senderName?: string;
  passcodeEnabled?: boolean;
  onNavigate: (route: AppRoute) => void;
  onToggleReceiverMode: () => void;
  onOpenCustomizer: () => void;
  onOpenShareModal: () => void;
  onOpenPasscodeModal?: () => void;
  onOpenReceiverCodeModal?: () => void;
  onOpenAndroidModal?: () => void;
  onDownloadWebsite: () => void;
  onSignOut: () => void;
  onReplayBloom?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentRoute,
  currentUser,
  isReceiverMode,
  girlfriendName = 'My Love',
  senderName = 'Me',
  passcodeEnabled = false,
  onNavigate,
  onToggleReceiverMode,
  onOpenCustomizer,
  onOpenShareModal,
  onOpenPasscodeModal,
  onOpenReceiverCodeModal,
  onOpenAndroidModal,
  onDownloadWebsite,
  onSignOut,
  onReplayBloom,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handlePointerDown);
      document.addEventListener('touchstart', handlePointerDown);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleAction = (action: () => void) => {
    setIsMenuOpen(false);
    action();
  };

  if (isReceiverMode) {
    // Dedicated, intimate romantic receiver mode header
    return (
      <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-rose-100/80 transition-all font-sans-custom py-2 px-4 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => {
                onToggleReceiverMode();
                onNavigate('portal');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200/80 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              title="Return to Home Portal"
            >
              <Home className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Home</span>
            </button>
            <span className="text-base select-none">🌹</span>
            <div className="truncate">
              <span className="font-cormorant text-base sm:text-lg font-bold text-rose-950 truncate">
                A Private Love Letter for {girlfriendName}
              </span>
              <span className="hidden sm:inline text-xs text-rose-600 italic ml-2">
                from {senderName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenAndroidModal && (
              <button
                type="button"
                onClick={onOpenAndroidModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-xs text-emerald-800 border border-emerald-200/80 shadow-2xs transition-all cursor-pointer font-medium"
                title="Download & Install Android App"
              >
                <Smartphone className="w-3 h-3 text-emerald-600" />
                <span className="hidden sm:inline">Android App</span>
              </button>
            )}
            {onReplayBloom && (
              <button
                type="button"
                onClick={onReplayBloom}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-xs text-rose-800 hover:text-rose-950 border border-rose-200/80 shadow-2xs transition-all cursor-pointer font-medium"
                title="Replay the romantic rose bloom ceremony"
              >
                <span>🌹 Replay Rose</span>
              </button>
            )}
            <button
              type="button"
              onClick={onToggleReceiverMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-stone-50 text-xs text-stone-600 hover:text-stone-900 border border-stone-200 shadow-2xs transition-all cursor-pointer"
              title="Return to editing interface"
            >
              <Edit3 className="w-3 h-3 text-rose-500" />
              <span>Back to Editor</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-rose-100 transition-all font-sans-custom">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand wordmark & Home Navigation */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('portal')}
            className="font-cormorant text-xl font-bold tracking-tight text-rose-950 whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer text-left group"
            title="Go to Home Portal"
          >
            <span className="group-hover:text-rose-700 transition-colors">Rosebloom</span>
            <span className="text-xs font-sans-custom font-normal text-rose-500 italic bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
              Monthsary
            </span>
          </button>

          {/* Dedicated Home icon button right next to brand */}
          <button
            type="button"
            onClick={() => onNavigate('portal')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              currentRoute === 'portal'
                ? 'bg-rose-100/90 text-rose-950 font-semibold border border-rose-200 shadow-2xs'
                : 'text-stone-600 hover:text-rose-950 hover:bg-rose-50 border border-transparent'
            }`}
            title="Go to Home Portal"
          >
            <Home className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Home</span>
          </button>
        </div>

        {/* Primary Right Actions & 3-Bar Hamburger Menu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Publish & Share button */}
          <button
            type="button"
            onClick={onOpenShareModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] rounded-xl shadow-xs shadow-rose-200 transition-all whitespace-nowrap cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Publish &amp; Share</span>
            <span className="sm:hidden">Share</span>
          </button>

          {/* Quick View as Receiver Preview */}
          <button
            type="button"
            onClick={onToggleReceiverMode}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-rose-50/70 hover:bg-rose-100 rounded-xl border border-rose-200/80 transition-all whitespace-nowrap cursor-pointer"
            title="Preview the website without any editing tools"
          >
            <Eye className="w-3.5 h-3.5 text-rose-600" />
            <span>Preview</span>
          </button>

          {/* 3-Bar (Hamburger) Dropdown Trigger */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Navigation & options menu"
              aria-expanded={isMenuOpen}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                isMenuOpen
                  ? 'bg-rose-100/80 border-rose-300 text-rose-950 shadow-xs'
                  : 'bg-white hover:bg-rose-50/70 border-rose-200/90 text-stone-700 hover:text-rose-950 shadow-2xs'
              }`}
            >
              {/* 3 Horizontal Bars with Smooth Morph Animation */}
              <div className="w-4 h-3.5 flex flex-col justify-between py-0.5" aria-hidden="true">
                <span
                  className={`h-0.5 w-full bg-rose-700 rounded-full transition-all duration-200 origin-center ${
                    isMenuOpen ? 'rotate-45 translate-y-1' : ''
                  }`}
                />
                <span
                  className={`h-0.5 w-full bg-rose-700 rounded-full transition-all duration-150 ${
                    isMenuOpen ? 'opacity-0 scale-x-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`h-0.5 w-full bg-rose-700 rounded-full transition-all duration-200 origin-center ${
                    isMenuOpen ? '-rotate-45 -translate-y-1' : ''
                  }`}
                />
              </div>

              <span className="text-xs font-semibold text-stone-800">Menu</span>

              {/* User Avatar badge in trigger */}
              {currentUser && (
                <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold flex items-center justify-center overflow-hidden border border-rose-200 shrink-0">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    currentUser.name.charAt(0).toUpperCase()
                  )}
                </div>
              )}
            </button>

            {/* 3-Bar Dropdown Menu Popup */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-xs sm:w-80 bg-white/98 backdrop-blur-xl rounded-2xl shadow-xl shadow-rose-950/10 border border-rose-100/90 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 divide-y divide-rose-50">
                {/* User Profile Card Header */}
                {currentUser && (
                  <div className="p-3.5 bg-gradient-to-r from-rose-50/70 via-rose-50/40 to-white flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleAction(() => onNavigate('account'))}
                      className="flex items-center gap-2.5 text-left min-w-0 cursor-pointer group"
                    >
                      <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold overflow-hidden border border-rose-200 shadow-2xs group-hover:scale-105 transition-transform">
                          {currentUser.avatarUrl ? (
                            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                          ) : (
                            currentUser.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        {currentUser.googleLinked && (
                          <span
                            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-2xs flex items-center justify-center p-0.5"
                            title="Google Account"
                          >
                            <svg className="w-full h-full" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-stone-900 truncate group-hover:text-rose-700 transition-colors">
                          {currentUser.name}
                        </div>
                        <div className="text-[11px] text-stone-500 truncate">
                          {currentUser.email}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAction(onSignOut)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-700 hover:bg-rose-100/60 transition-colors cursor-pointer"
                      title="Sign out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Section: Main Navigation */}
                <div className="p-2">
                  <div className="px-2 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Pages
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAction(() => onNavigate('portal'))}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      currentRoute === 'portal'
                        ? 'bg-rose-50 text-rose-900 font-semibold'
                        : 'text-stone-700 hover:bg-rose-50/60 hover:text-stone-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Home className={`w-4 h-4 ${currentRoute === 'portal' ? 'text-rose-600' : 'text-stone-400'}`} />
                      <span>Home Portal</span>
                    </div>
                    {currentRoute === 'portal' && (
                      <span className="text-[10px] font-semibold text-rose-600 bg-rose-100/80 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAction(() => onNavigate('home'))}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      currentRoute === 'home'
                        ? 'bg-rose-50 text-rose-900 font-semibold'
                        : 'text-stone-700 hover:bg-rose-50/60 hover:text-stone-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Edit3 className={`w-4 h-4 ${currentRoute === 'home' ? 'text-rose-600' : 'text-stone-400'}`} />
                      <span>Editor</span>
                    </div>
                    {currentRoute === 'home' && (
                      <span className="text-[10px] font-semibold text-rose-600 bg-rose-100/80 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAction(() => onNavigate('my-work'))}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      currentRoute === 'my-work'
                        ? 'bg-rose-50 text-rose-900 font-semibold'
                        : 'text-stone-700 hover:bg-rose-50/60 hover:text-stone-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers className={`w-4 h-4 ${currentRoute === 'my-work' ? 'text-rose-600' : 'text-stone-400'}`} />
                      <span>My Work</span>
                    </div>
                    {currentRoute === 'my-work' && (
                      <span className="text-[10px] font-semibold text-rose-600 bg-rose-100/80 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAction(() => onNavigate('account'))}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      currentRoute === 'account'
                        ? 'bg-rose-50 text-rose-900 font-semibold'
                        : 'text-stone-700 hover:bg-rose-50/60 hover:text-stone-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <User className={`w-4 h-4 ${currentRoute === 'account' ? 'text-rose-600' : 'text-stone-400'}`} />
                      <span>Account Settings</span>
                    </div>
                    {currentRoute === 'account' && (
                      <span className="text-[10px] font-semibold text-rose-600 bg-rose-100/80 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </button>
                </div>

                {/* Section: Romantic Creation Tools */}
                <div className="p-2">
                  <div className="px-2 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Letter Tools &amp; Actions
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAction(onOpenCustomizer)}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-stone-700 hover:bg-rose-50/60 hover:text-rose-900 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-rose-500" />
                      <span>Customize Letter &amp; Theme</span>
                    </div>
                  </button>

                  {onOpenPasscodeModal && (
                    <button
                      type="button"
                      onClick={() => handleAction(onOpenPasscodeModal)}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-stone-700 hover:bg-rose-50/60 hover:text-rose-900 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Lock className="w-4 h-4 text-rose-500" />
                        <span>Passcode Protection</span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        passcodeEnabled
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-500'
                      }`}>
                        {passcodeEnabled ? 'Active ✓' : 'Off'}
                      </span>
                    </button>
                  )}

                  {onReplayBloom && (
                    <button
                      type="button"
                      onClick={() => handleAction(onReplayBloom)}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-stone-700 hover:bg-rose-50/60 hover:text-rose-900 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm select-none">🌹</span>
                        <span>Replay Rose Bloom</span>
                      </div>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleAction(onDownloadWebsite)}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-stone-700 hover:bg-rose-50/60 hover:text-rose-900 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Download className="w-4 h-4 text-rose-500" />
                      <span>Download Website (HTML)</span>
                    </div>
                  </button>

                  {onOpenAndroidModal && (
                    <button
                      type="button"
                      onClick={() => handleAction(onOpenAndroidModal)}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100/70 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                        <span>Download Android App (.apk)</span>
                      </div>
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-sm">
                        APK
                      </span>
                    </button>
                  )}

                  {onOpenReceiverCodeModal && (
                    <button
                      type="button"
                      onClick={() => handleAction(onOpenReceiverCodeModal)}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-stone-700 hover:bg-rose-50/60 hover:text-rose-900 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <KeyRound className="w-4 h-4 text-rose-500" />
                        <span>Enter Recipient Code</span>
                      </div>
                    </button>
                  )}
                </div>

                {/* Section: Preview & Share */}
                <div className="p-2 bg-stone-50/50">
                  <button
                    type="button"
                    onClick={() => handleAction(onToggleReceiverMode)}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-stone-800 hover:bg-white hover:text-rose-900 transition-colors cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <Eye className="w-4 h-4 text-rose-600" />
                      <span>View as Receiver</span>
                    </div>
                    <span className="text-[11px] text-stone-400">Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAction(onOpenShareModal)}
                    className="w-full mt-1.5 flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer shadow-xs shadow-rose-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <Share2 className="w-4 h-4" />
                      <span>Publish &amp; Share</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-rose-200" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
