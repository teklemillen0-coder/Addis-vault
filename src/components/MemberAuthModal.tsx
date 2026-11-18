import React, { useState } from 'react';
import {
  CheckCircle2,
  LogOut,
  ShieldCheck,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';
import { ETHIOPIAN_REGIONS } from '../constants/educationRegions';
import { UI_TRANSLATIONS } from '../i18n/translations';
import { Language, MemberProfile, MemberRole } from '../types';
import { sanitizeUserInput } from '../utils/appSecurity';
import { supabase } from '@/integrations/supabase/client';

interface MemberAuthModalProps {
  isOpen: boolean;
  lang: Language;
  currentMember: MemberProfile | null;
  ordersCount: number;
  onClose: () => void;
  onLogout: () => void;
}

const ROLES: MemberRole[] = ['Student', 'Professional', 'Business Owner', 'Lawyer', 'Artisan'];

export const MemberAuthModal: React.FC<MemberAuthModalProps> = ({
  isOpen,
  lang,
  currentMember,
  ordersCount,
  onClose,
  onLogout,
}) => {
  const t = UI_TRANSLATIONS[lang];
  const [mode, setMode] = useState<'signup' | 'login' | 'forgot'>('signup');
  const [phone, setPhone] = useState('');
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [region, setRegion] = useState('Addis Ababa');
  const [role, setRole] = useState<MemberRole>('Student');
  const [sharePhone, setSharePhone] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    const cleanEmail = sanitizeUserInput(contact, 120).trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanName = sanitizeUserInput(fullName, 100).trim();
    const cleanPhone = sanitizeUserInput(phone, 24).trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (mode === 'forgot') {
      setIsBusy(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
          setErrorMsg(error.message);
          return;
        }
        setInfoMsg('If an account exists for this email, a password reset link is on its way.');
      } finally {
        setIsBusy(false);
      }
      return;
    }
    if (mode === 'signup' && (!cleanName || cleanPassword.length < 6)) {
      setErrorMsg('Please enter your name, email, and a password of at least 6 characters.');
      return;
    }
    if (mode === 'login' && !cleanPassword) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    setIsBusy(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: cleanName,
              phone: cleanPhone,
              region,
              member_role: role,
              share_phone: sharePhone,
            },
          },
        });
        if (error) {
          setErrorMsg(error.message);
          return;
        }
        if (!data.session) {
          setInfoMsg('Almost done! Check your email and click the confirmation link, then log in here.');
          setMode('login');
          setPassword('');
          return;
        }
        onClose();
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });
      if (error) {
        setErrorMsg(
          /confirm/i.test(error.message)
            ? 'Please confirm your email first — check your inbox for the confirmation link.'
            : 'Incorrect email or password.'
        );
        return;
      }
      // Daily login activity bonus (+10, once per day)
      await supabase.rpc('claim_login_bonus');
      setPassword('');
      onClose();
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-auth-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-zinc-800">
          <h2 id="member-auth-title" className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
            {t.memberModalTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeBtn}
            className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {currentMember ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    {currentMember.id}
                  </span>
                  {(currentMember.verifiedBuyer || ordersCount > 0) && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{t.memberVerifiedBuyer}</span>
                    </span>
                  )}
                </div>
                <div className="mt-1.5 font-display text-lg font-extrabold text-stone-900 dark:text-stone-100">
                  {currentMember.fullName}
                </div>
                <div className="text-xs text-stone-600 dark:text-stone-400">
                  {currentMember.role} · {currentMember.region}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
              >
                <LogOut className="h-4 w-4" />
                <span>{t.memberLogoutBtn}</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tab Switcher */}
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-stone-100 p-1 dark:bg-zinc-900">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                    setInfoMsg(null);
                  }}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-colors ${
                    mode === 'signup'
                      ? 'bg-white text-stone-900 shadow-sm dark:bg-zinc-800 dark:text-stone-100'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>{t.memberSignUpTab}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                    setInfoMsg(null);
                  }}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-colors ${
                    mode === 'login'
                      ? 'bg-white text-stone-900 shadow-sm dark:bg-zinc-800 dark:text-stone-100'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>{t.memberLoginTab}</span>
                </button>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {t.memberFullNameLabel}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Abebe Bikila"
                    className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  {t.memberContactLabel}
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="name@domain.com"
                  className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                />
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09XXXXXXXX"
                    className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                  />
                </div>
              )}

              {mode !== 'forgot' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  {t.memberPasswordLabel}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  placeholder="Minimum 6 characters"
                  className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                />
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg(null);
                      setInfoMsg(null);
                    }}
                    className="mt-1.5 text-[11px] font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              )}

              {mode === 'signup' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                        {t.memberRegionLabel}
                      </label>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-2.5 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                      >
                        {ETHIOPIAN_REGIONS.map((reg) => (
                          <option key={reg.id} value={reg.shortTag}>
                            {reg.shortTag}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                        {t.memberRoleLabel}
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as MemberRole)}
                        className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-2.5 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <label className="flex items-start gap-2 rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-300">
                    <input
                      type="checkbox"
                      checked={sharePhone}
                      onChange={(e) => setSharePhone(e.target.checked)}
                      className="mt-0.5 rounded border-stone-300 text-emerald-700"
                    />
                    <span>{t.memberSharePhoneLabel}</span>
                  </label>
                </>
              )}

              {infoMsg && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                  {infoMsg}
                </div>
              )}

              {errorMsg && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isBusy}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-60 dark:bg-emerald-600"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>
                  {mode === 'signup'
                    ? t.memberCreateAccountBtn
                    : mode === 'forgot'
                      ? 'Send reset link'
                      : t.memberLoginBtn}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
