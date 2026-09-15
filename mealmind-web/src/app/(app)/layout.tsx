"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { useApp } from "@/context/AppContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { ready, userId, profile, plan } = useApp();

  useEffect(() => {
    if (!ready) return;
    if (!userId) {
      router.replace("/auth");
      return;
    }
    if (!profile?.privacy_consent_given) {
      router.replace("/privacy-consent");
      return;
    }
    if (!profile?.onboarding_completed) {
      router.replace("/onboarding");
      return;
    }
    if (!plan) {
      router.replace("/generating-plan");
    }
  }, [ready, userId, profile, plan, router]);

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
