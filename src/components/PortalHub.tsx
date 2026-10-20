import React from 'react';
import {
  Edit3,
  KeyRound,
  Sparkles,
  Heart,
  ArrowRight,
  FolderHeart,
  User,
  Eye,
  Calendar,
  Lock,
  Music,
  Download,
  Clock,
} from 'lucide-react';
import { CoupleData, UserProfile, calculateDaysBetween, RecipientPronoun } from '../types';

interface PortalHubProps {
  currentUser: UserProfile | null;
  activeData: CoupleData;
  onWriteLetter: () => void;
  onOpenWithPasskey: () => void;
  onExploreDemo: () => void;
  onNavigateMySites: () => void;
  onNavigateAccount: () => void;
  onPreviewReceiver: () => void;
  onDownloadHtml: () => void;
}

export const PortalHub: React.FC<PortalHubProps> = ({
  currentUser,
  activeData,
  onWriteLetter,
  onOpenWithPasskey,
  onExploreDemo,
  onNavigateMySites,
  onNavigateAccount,
  onPreviewReceiver,
  onDownloadHtml,
}) => {
  const timeTogether = calculateDaysBetween(
    activeData.relationshipStartDate || activeData.startMonth,
    activeData.currentCelebrationDate || activeData.currentMonth,
    activeData.customDaysCount
  );

  const getPronounLabel = (pronoun?: RecipientPronoun) => {
    switch (pronoun) {
      case 'his':
        return 'for Him';
      case 'their':
        return 'for Partner';
      default:
        return 'for Her';
    }
  };

  const recipientDisplayName = activeData.girlfriendName || 'My Love';
  const authorDisplayName = activeData.senderName || 'Me';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 font-sans-custom">
      {/* Welcome Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-rose-200/80 shadow-xs mb-4 text-xs font-semibold text-rose-800">
          <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-500 animate-pulse" />
          <span>Romantic Monthsary Sanctuary</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        </div>

        <h1 className="font-cormorant text-3xl sm:text-5xl md:text-6xl font-bold text-rose-950 tracking-tight leading-[1.15] mb-3">
          Welcome back,{' '}
          <span className="italic font-normal text-rose-700">
            {currentUser?.name || 'Sweetheart'}
          </span>
        </h1>
        <p className="text-stone-600 text-xs sm:text-sm md:text-base leading-relaxed max-w-lg mx-auto">
          Choose how you would like to proceed: craft your romantic surprise, unlock a received letter with a secret passkey, or preview the sample demo.
        </p>
      </div>

      {/* Main 3 Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-12">
        {/* CARD 1: WRITE / EDIT LETTER */}
        <div className="relative group flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white/95 backdrop-blur-md border border-rose-200/90 hover:border-rose-300 shadow-sm hover:shadow-xl hover:shadow-rose-100/60 transition-all duration-300 hover:-translate-y-1">
          {/* Subtle Top Accent Glow */}
          <div className="absolute top-0 inset-x-8 h-1 bg-gradient-to-r from-rose-400 via-rose-500 to-pink-400 rounded-b-full opacity-80" />

          <div>
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100/80 border border-rose-200/70 flex items-center justify-center mb-5 text-rose-600 shadow-2xs group-hover:scale-105 transition-transform">
              <Edit3 className="w-6 h-6" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-[11px] font-semibold text-rose-700 mb-2 border border-rose-100">
              <span>Creator Studio</span>
            </div>

            <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-rose-950 mb-2.5">
              Write a Love Letter
            </h2>

            <p className="text-xs text-stone-600 leading-relaxed mb-6">
              Create or edit your anniversary letter {getPronounLabel(activeData.recipientPronoun)}. Personalize the message, cherished photos, anniversary timeline, and music playlist.
            </p>

            <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100/80 mb-6 text-xs text-stone-700 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-stone-500">
                <span>Active Project</span>
                <span className="font-medium text-rose-700">Ready</span>
              </div>
              <div className="font-semibold text-rose-950 truncate">
                {authorDisplayName} &amp; {recipientDisplayName}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onWriteLetter}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-semibold text-xs tracking-wide shadow-md shadow-rose-200/80 hover:shadow-lg hover:shadow-rose-300/80 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Enter Letter Studio</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* CARD 2: OPEN WITH 5-CHARACTER LETTER CODE */}
        <div className="relative group flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white/95 backdrop-blur-md border border-amber-200/90 hover:border-amber-300 shadow-sm hover:shadow-xl hover:shadow-amber-100/50 transition-all duration-300 hover:-translate-y-1">
          {/* Subtle Top Accent Glow */}
          <div className="absolute top-0 inset-x-8 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-rose-400 rounded-b-full opacity-80" />

          <div>
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/80 border border-amber-200/70 flex items-center justify-center mb-5 text-amber-600 shadow-2xs group-hover:scale-105 transition-transform">
              <KeyRound className="w-6 h-6" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-[11px] font-semibold text-amber-800 mb-2 border border-amber-100">
              <Lock className="w-3 h-3 text-amber-600" />
              <span>For Recipients</span>
            </div>

            <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-stone-900 mb-2.5">
              Open with Letter Code
            </h2>

            <p className="text-xs text-stone-600 leading-relaxed mb-6">
              Received a 5-character letter code from your love? Enter your code to unlock the private love letter and blooming rose across any device.
            </p>

            <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100/80 mb-6 text-xs text-stone-700 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-stone-500">
                <span>Unique Letter Code</span>
                <span className="font-medium text-amber-700 font-mono">
                  5-Characters
                </span>
              </div>
              <div className="text-stone-600 italic truncate text-[11px]">
                {activeData.passcode?.enabled
                  ? 'Includes 4-digit secret passcode prompt'
                  : 'Instant romantic unlock'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenWithPasskey}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-stone-900 to-stone-800 hover:from-black hover:to-stone-900 text-amber-300 font-semibold text-xs tracking-wide shadow-md shadow-stone-300 active:scale-[0.98] transition-all cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Enter Letter Code &amp; Open</span>
          </button>
        </div>

        {/* CARD 3: EXPLORE SAMPLE DEMO */}
        <div className="relative group flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white/95 backdrop-blur-md border border-rose-200/90 hover:border-pink-300 shadow-sm hover:shadow-xl hover:shadow-pink-100/50 transition-all duration-300 hover:-translate-y-1">
          {/* Subtle Top Accent Glow */}
          <div className="absolute top-0 inset-x-8 h-1 bg-gradient-to-r from-pink-400 via-rose-400 to-rose-300 rounded-b-full opacity-80" />

          <div>
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100/80 border border-pink-200/70 flex items-center justify-center mb-5 text-rose-600 shadow-2xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-50 text-[11px] font-semibold text-pink-700 mb-2 border border-pink-100">
              <span>Interactive Showcase</span>
            </div>

            <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-rose-950 mb-2.5">
              Explore Sample Demo
            </h2>

            <p className="text-xs text-stone-600 leading-relaxed mb-6">
              Experience the complete romantic celebration with Maya &amp; Liam's 2-Year monthsary, realistic pink rose bloom, and soft background music.
            </p>

            <div className="p-3 rounded-xl bg-pink-50/50 border border-pink-100/80 mb-6 text-xs text-stone-700 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-stone-500">
                <span>Featured Demo</span>
                <span className="font-medium text-pink-700">Maya &amp; Liam</span>
              </div>
              <div className="text-stone-600 text-[11px] truncate">
                725 Days · 4 Photos · Romantic Serenade
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onExploreDemo}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-xs tracking-wide shadow-md shadow-pink-200/70 hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Launch Sample Demo 🌹</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Quick Navigation & Active Letter Status Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white/85 backdrop-blur-md border border-rose-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <Heart className="w-5 h-5 fill-rose-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-rose-950">
                {authorDisplayName} &amp; {recipientDisplayName}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-medium border border-rose-100">
                {timeTogether.days} Days
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              Celebration Date: {activeData.monthsaryDate || 'October 24, 2024'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 w-full md:w-auto text-xs">
          <button
            type="button"
            onClick={onNavigateMySites}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-stone-700 hover:text-rose-900 border border-stone-200 hover:border-rose-200 transition-colors cursor-pointer font-medium"
          >
            <FolderHeart className="w-3.5 h-3.5 text-rose-500" />
            <span>My Letters</span>
          </button>

          <button
            type="button"
            onClick={onPreviewReceiver}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-stone-700 hover:text-rose-900 border border-stone-200 hover:border-rose-200 transition-colors cursor-pointer font-medium"
          >
            <Eye className="w-3.5 h-3.5 text-rose-500" />
            <span>Receiver View</span>
          </button>

          <button
            type="button"
            onClick={onNavigateAccount}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-stone-700 hover:text-rose-900 border border-stone-200 hover:border-rose-200 transition-colors cursor-pointer font-medium"
          >
            <User className="w-3.5 h-3.5 text-stone-500" />
            <span>Account</span>
          </button>

          <button
            type="button"
            onClick={onDownloadHtml}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors cursor-pointer font-medium"
            title="Download standalone HTML copy for offline keepsakes"
          >
            <Download className="w-3.5 h-3.5 text-rose-600" />
            <span>Save HTML</span>
          </button>
        </div>
      </div>
    </div>
  );
};
