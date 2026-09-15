"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";
import { useApp } from "@/context/AppContext";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function AuthPage() {
  const router = useRouter();
  const params = useSearchParams();
  const mode = params.get("mode") === "signup" ? "signup" : "login";
  const { signInLocal, profile } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabaseReady = useMemo(() => isSupabaseConfigured(), []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (supabaseReady) {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        if (mode === "signup") {
          const { error } = await supabase.auth.signUp({ email, password });
          if (error) throw error;
          setMessage("Check your email to confirm, or continue if confirmations are disabled.");
        } else {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
        }
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.email) {
          signInLocal(user.email);
        }
      } else {
        // Local demo auth until Supabase env is configured on Vercel
        signInLocal(email || "demo@mealmind.app");
      }

      const nextProfile = profile;
      if (!nextProfile?.privacy_consent_given) {
        router.push("/privacy-consent");
      } else if (!nextProfile?.onboarding_completed) {
        router.push("/onboarding");
      } else if (!nextProfile) {
        router.push("/privacy-consent");
      } else {
        router.push("/plan");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    if (!supabaseReady) {
      setMessage("Connect Supabase env vars to enable Google sign-in.");
      return;
    }
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/privacy-consent` },
    });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link href="/" className="mb-8 font-[family-name:var(--font-display)] text-3xl text-[var(--forest)]">
        MealMind
      </Link>
      <h1 className="text-2xl font-semibold text-[var(--ink)]">
        {mode === "signup" ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-sm text-[var(--ink-muted)]">
        Email + Google via Supabase Auth. {supabaseReady ? "Connected." : "Running in local demo mode."}
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block text-[var(--ink-muted)]">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-[var(--forest)]/15 bg-white/70 px-4 py-3 outline-none focus:border-[var(--forest)]"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-[var(--ink-muted)]">Password</span>
          <input
            type="password"
            required={supabaseReady}
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-[var(--forest)]/15 bg-white/70 px-4 py-3 outline-none focus:border-[var(--forest)]"
          />
        </label>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Working…" : mode === "signup" ? "Sign up" : "Log in"}
        </Button>
      </form>

      <Button type="button" variant="ghost" className="mt-3 w-full" onClick={signInWithGoogle}>
        Continue with Google
      </Button>

      {message && <p className="mt-4 text-sm text-[var(--ink-muted)]">{message}</p>}

      <p className="mt-6 text-sm text-[var(--ink-muted)]">
        {mode === "signup" ? (
          <>
            Already have an account? <Link href="/auth" className="text-[var(--forest)] underline">Log in</Link>
          </>
        ) : (
          <>
            New here? <Link href="/auth?mode=signup" className="text-[var(--forest)] underline">Sign up</Link>
          </>
        )}
      </p>
    </div>
  );
}
