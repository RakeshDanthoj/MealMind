"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { useApp } from "@/context/AppContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { ready, profile, plan, ensureGuestSession } = useApp();

  useEffect(() => {
    if (!ready) return;
    // MVP: no login gate — ensure a local guest session and continue the plan flow.
    ensureGuestSession();
    if (!profile?.onboarding_completed) {
      router.replace("/onboarding");
      return;
    }
    if (!plan) {
      router.replace("/generating-plan");
    }
  }, [ready, profile, plan, router, ensureGuestSession]);

  if (!ready) {
    return <div className="p-10 text-[var(--ink-muted)]">Loading…</div>;
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pt-16">
      <AppNav />
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-6">{children}</div>
    </div>
  );
}
