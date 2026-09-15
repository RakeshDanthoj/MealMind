"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

const TIPS = [
  "Balancing your week…",
  "Matching cuisines to your skill level…",
  "Keeping allergens out of the mix…",
  "Building breakfast through dinner…",
];

export default function GeneratingPlanPage() {
  const router = useRouter();
  const { generatePlan, profile } = useApp();
  const [tipIndex, setTipIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tipTimer = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), 1600);
    return () => clearInterval(tipTimer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!profile) {
        router.replace("/onboarding");
        return;
      }
      try {
        await generatePlan();
        if (!cancelled) router.replace("/plan-reveal");
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Generation failed");
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [generatePlan, profile, router]);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="mb-8 h-16 w-16 animate-pulse rounded-full bg-[var(--citrus)]" />
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--forest)]">
        Crafting your week
      </h1>
      <p className="mt-4 text-[var(--ink-muted)]">{error || TIPS[tipIndex]}</p>
      {error && (
        <button
          className="mt-6 rounded-full bg-[var(--forest)] px-5 py-2 text-sm text-white"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      )}
    </div>
  );
}
