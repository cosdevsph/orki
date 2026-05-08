"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/providers/notification-provider";
import { loginWithBackend } from "@/shared/api/auth";
import { routes } from "@/shared/config/routes";
import { signInWithEmail, signInWithGoogle } from "@/shared/firebase/auth";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function SignInForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const { notify } = useNotification();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Exchange a Firebase credential for a backend server session. */
  async function exchangeToken(getIdToken: () => Promise<string>) {
    const idToken = await getIdToken();
    const { user } = await loginWithBackend(idToken);
    setUser(user);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const credential = await signInWithEmail(email, password);
      await exchangeToken(() => credential.user.getIdToken());
      notify("You are logged in", "success");
      router.replace(routes.onboarding);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Sign-in failed. Please check your credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      const credential = await signInWithGoogle();
      await exchangeToken(() => credential.user.getIdToken());
      notify("You are logged in", "success");
      router.replace(routes.onboarding);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const isDisabled = isLoading || isGoogleLoading;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="signin-email">
          Email address
        </label>
        <input
          id="signin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
          className="w-full rounded-xl border border-border bg-slate-50/60 px-4 py-3.5 text-sm text-foreground placeholder:text-muted/50 outline-none transition-all duration-200 focus:border-primary/60 focus:bg-white focus:ring-3 focus:ring-primary/10"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground" htmlFor="signin-password">
            Password
          </label>
          <button
            type="button"
            className="text-xs font-medium text-primary transition-colors hover:text-primary/75"
          >
            Forgot password?
          </button>
        </div>
        <input
          id="signin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
          className="w-full rounded-xl border border-border bg-slate-50/60 px-4 py-3.5 text-sm text-foreground placeholder:text-muted/50 outline-none transition-all duration-200 focus:border-primary/60 focus:bg-white focus:ring-3 focus:ring-primary/10"
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isDisabled}
        className="w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {isLoading ? "Signing in…" : "Sign In"}
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isDisabled}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-white px-4 py-3.5 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleIcon />
        {isGoogleLoading ? "Connecting…" : "Continue with Google"}
      </button>
    </form>
  );
}
