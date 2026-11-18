import { useState } from "react";
import type { FormEvent } from "react";
import { KeyRound, Loader2, ShieldCheck, X } from "lucide-react";
import { loadAccount, type AccountState } from "@/lib/community-data";
import { isSupabaseConfigured } from "@/integrations/supabase/is-configured";
import { supabase } from "@/integrations/supabase/client";

interface OwnerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOwnerVerified: (account: AccountState) => void;
}

export function OwnerLoginModal({ isOpen, onClose, onOwnerVerified }: OwnerLoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRecovering, setIsRecovering] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!isSupabaseConfigured()) {
      setError("Owner login is unavailable until Supabase authentication is configured.");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Enter the email address for your owner account.");
      return;
    }

    setIsBusy(true);
    try {
      if (isRecovering) {
        const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (recoveryError) {
          setError(recoveryError.message);
          return;
        }
        setMessage(
          "If an account exists for this email, a secure password reset link is on its way.",
        );
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (signInError) {
        setError("Unable to sign in with those owner credentials.");
        return;
      }

      const account = await loadAccount();
      if (!account?.isAdmin) {
        await supabase.auth.signOut();
        setError("This account does not have the verified Owner admin role.");
        return;
      }

      setEmail("");
      setPassword("");
      onOwnerVerified(account);
      onClose();
    } catch {
      setError("Owner sign-in could not be verified. Check your connection and try again.");
    } finally {
      setIsBusy(false);
    }
  };

  const close = () => {
    setError(null);
    setMessage(null);
    setIsRecovering(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="owner-login-title"
    >
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <KeyRound className="h-4 w-4" />
            <h2
              id="owner-login-title"
              className="font-display text-base font-bold text-stone-900 dark:text-stone-100"
            >
              {isRecovering ? "Recover Owner Login" : "Owner Login"}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close Owner Login"
            className="rounded-lg p-1 text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
          Sign in with the owner account. Access is granted only after the server-verified admin
          role is confirmed.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Owner email
            </span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="h-11 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 text-sm text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
            />
          </label>

          {!isRecovering && (
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Password
              </span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="h-11 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 text-sm text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
              />
            </label>
          )}

          {error && (
            <p role="alert" className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              {error}
            </p>
          )}
          {message && (
            <p
              role="status"
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400"
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isBusy}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-600 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {isBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            <span>
              {isBusy ? "Verifying…" : isRecovering ? "Send recovery link" : "Sign in as Owner"}
            </span>
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsRecovering((previous) => !previous);
            setError(null);
            setMessage(null);
          }}
          className="mt-3 min-h-9 w-full text-xs font-semibold text-emerald-800 hover:underline dark:text-emerald-400"
        >
          {isRecovering ? "Back to Owner Login" : "Forgot your password? Recover by email"}
        </button>
      </div>
    </div>
  );
}
