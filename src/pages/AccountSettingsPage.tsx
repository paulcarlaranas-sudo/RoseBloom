import React, { useState } from 'react';
import { UserProfile, SavedGoogleAccount } from '../types';
import { authService } from '../services/authService';
import { GoogleSignInModal } from '../components/GoogleSignInModal';
import { User, Mail, Lock, ShieldCheck, Check, AlertCircle, ArrowLeft, LogOut, RefreshCw, UserPlus } from 'lucide-react';

interface AccountSettingsPageProps {
  user: UserProfile;
  onNavigateHome: () => void;
  onNavigateSites: () => void;
  onSignOut: () => void;
}

export const AccountSettingsPage: React.FC<AccountSettingsPageProps> = ({
  user,
  onNavigateHome,
  onNavigateSites,
  onSignOut,
}) => {
  // Profile name state
  const [displayName, setDisplayName] = useState<string>(user.name);
  const [profileStatus, setProfileStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);

  // Update Email state
  const [newEmail, setNewEmail] = useState<string>(user.email);
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [emailLoading, setEmailLoading] = useState<boolean>(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [nextPassword, setNextPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passStatus, setPassStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [passLoading, setPassLoading] = useState<boolean>(false);

  // Google modal state
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState<boolean>(false);
  const [googleStatus, setGoogleStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  const savedAccounts = authService.getSavedGoogleAccounts();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus(null);
    setProfileLoading(true);
    try {
      await authService.updateProfile(displayName);
      setProfileStatus({ type: 'success', msg: 'Profile display name updated successfully.' });
    } catch (err: unknown) {
      setProfileStatus({ type: 'error', msg: err instanceof Error ? err.message : 'Failed to update name.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailStatus(null);
    setEmailLoading(true);
    try {
      await authService.updateEmail(newEmail);
      setEmailStatus({ type: 'success', msg: 'Email address successfully updated.' });
    } catch (err: unknown) {
      setEmailStatus({ type: 'error', msg: err instanceof Error ? err.message : 'Failed to update email.' });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassStatus(null);
    if (nextPassword !== confirmPassword) {
      setPassStatus({ type: 'error', msg: 'New passwords do not match.' });
      return;
    }
    setPassLoading(true);
    try {
      await authService.changePassword(currentPassword, nextPassword);
      setPassStatus({ type: 'success', msg: 'Password changed successfully.' });
      setCurrentPassword('');
      setNextPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setPassStatus({ type: 'error', msg: err instanceof Error ? err.message : 'Failed to change password.' });
    } finally {
      setPassLoading(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    setGoogleStatus(null);
    setGoogleLoading(true);
    try {
      await authService.unlinkGoogleAccount();
      setGoogleStatus({ type: 'success', msg: 'Google account disconnected.' });
    } catch (err: unknown) {
      setGoogleStatus({ type: 'error', msg: err instanceof Error ? err.message : 'Could not unlink Google account.' });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSwitchAccount = async (acc: SavedGoogleAccount) => {
    setGoogleStatus(null);
    try {
      await authService.signInWithGoogleAccount({
        email: acc.email,
        name: acc.name,
        avatarUrl: acc.avatarUrl,
        sub: acc.sub,
      });
      setGoogleStatus({ type: 'success', msg: `Switched to ${acc.email}.` });
    } catch (err: unknown) {
      setGoogleStatus({ type: 'error', msg: err instanceof Error ? err.message : 'Failed to switch account.' });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 font-sans-custom">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-rose-100">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-medium text-stone-600 hover:text-rose-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Monthsary Home</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateSites}
            className="text-xs font-medium text-rose-700 hover:text-rose-900 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            My Work Dashboard
          </button>
          <button
            onClick={onSignOut}
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
            title="Sign out of your account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="font-cormorant text-3xl sm:text-4xl font-semibold text-rose-950">
          Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Manage your personal profile, credentials, and connected Google account
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-sm text-center">
            <div className="w-20 h-20 mx-auto rounded-full border-2 border-rose-200 overflow-hidden bg-rose-50 mb-3 shadow-sm flex items-center justify-center font-bold text-rose-700 text-xl">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <h3 className="font-cormorant text-xl font-bold text-rose-950">{user.name}</h3>
            <p className="text-xs text-stone-500 font-mono mt-0.5">{user.email}</p>

            {user.googleLinked && (
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Google Account</span>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-rose-50 text-[11px] text-stone-500 flex flex-col gap-1.5 text-left">
              <div className="flex justify-between">
                <span>Account ID:</span>
                <span className="font-mono text-stone-700 text-[10px] truncate max-w-[120px]">{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Member Since:</span>
                <span className="text-stone-700">{user.createdAt}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Settings Sections */}
        <div className="md:col-span-2 space-y-6">
          {/* Section 0: Display Name */}
          <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-rose-50">
              <User className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-semibold text-stone-900">Your Display Name</h2>
            </div>

            {profileStatus && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  profileStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {profileStatus.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{profileStatus.msg}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <div>
                <label className="block text-xs text-stone-600 mb-1 font-medium">
                  Author / Sender Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  This signature name appears on all your romantic letters and websites.
                </p>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={profileLoading || displayName === user.name}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl text-xs font-medium cursor-pointer shadow-xs transition-colors"
                >
                  {profileLoading ? 'Updating...' : 'Save Name'}
                </button>
              </div>
            </form>
          </div>

          {/* Section 1: Linked Google Account */}
          <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-rose-50">
              <ShieldCheck className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-semibold text-stone-900">Google Account Integration</h2>
            </div>

            {googleStatus && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  googleStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{googleStatus.msg}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200/80 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-xs">
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
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-900">Google Status</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        user.googleLinked ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {user.googleLinked ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5 font-mono">
                    {user.googleLinked ? user.googleEmail || user.email : 'No Google account connected'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {user.googleLinked ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsGoogleModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3 h-3 text-stone-500" />
                      <span>Switch Account</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDisconnectGoogle}
                      disabled={googleLoading}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-medium cursor-pointer shadow-xs transition-colors"
                    >
                      {googleLoading ? 'Disconnecting...' : 'Disconnect'}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsGoogleModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-medium cursor-pointer shadow-xs transition-colors"
                  >
                    Connect Google Account
                  </button>
                )}
              </div>
            </div>

            {/* List other saved accounts on this device */}
            {savedAccounts.length > 0 && (
              <div className="mt-4 pt-3 border-t border-stone-100">
                <span className="text-xs font-semibold text-stone-700 block mb-2">
                  Other Google Accounts on this Device:
                </span>
                <div className="space-y-2">
                  {savedAccounts.map((acc) => {
                    const isCurrent = (user.googleEmail || user.email).toLowerCase() === acc.email.toLowerCase();
                    return (
                      <div
                        key={acc.email}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                          isCurrent
                            ? 'bg-rose-50/50 border-rose-200'
                            : 'bg-white border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs overflow-hidden">
                            {acc.avatarUrl ? (
                              <img src={acc.avatarUrl} alt={acc.name} className="w-full h-full object-cover" />
                            ) : (
                              acc.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-stone-800">{acc.name}</span>
                            <span className="text-stone-400 text-[11px] ml-2 font-mono">{acc.email}</span>
                          </div>
                        </div>

                        {isCurrent ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                            Active
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSwitchAccount(acc)}
                            className="px-2.5 py-1 text-[11px] rounded-lg bg-stone-100 hover:bg-rose-100 text-stone-700 hover:text-rose-900 transition-colors cursor-pointer font-medium"
                          >
                            Switch to this
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Update Primary Email */}
          <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-rose-50">
              <Mail className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-semibold text-stone-900">Email Address</h2>
            </div>

            {emailStatus && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  emailStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {emailStatus.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{emailStatus.msg}</span>
              </div>
            )}

            <form onSubmit={handleUpdateEmail} className="space-y-3">
              <div>
                <label className="block text-xs text-stone-600 mb-1 font-medium">
                  Primary Email
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={emailLoading || newEmail === user.email}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl text-xs font-medium cursor-pointer shadow-xs transition-colors"
                >
                  {emailLoading ? 'Updating...' : 'Save Email Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Section 3: Change Password */}
          <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-rose-50">
              <Lock className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-semibold text-stone-900">Change Password</h2>
            </div>

            {passStatus && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  passStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {passStatus.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{passStatus.msg}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs text-stone-600 mb-1 font-medium">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-600 mb-1 font-medium">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={nextPassword}
                    onChange={(e) => setNextPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-600 mb-1 font-medium">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={passLoading || !nextPassword}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl text-xs font-medium cursor-pointer shadow-xs transition-colors"
                >
                  {passLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Google Sign-in / Switcher Modal */}
      <GoogleSignInModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={(updatedUser) => {
          setGoogleStatus({
            type: 'success',
            msg: `Successfully connected Google Account (${updatedUser.googleEmail || updatedUser.email}).`,
          });
        }}
        mode={user.googleLinked ? 'signin' : 'link'}
      />
    </div>
  );
};
