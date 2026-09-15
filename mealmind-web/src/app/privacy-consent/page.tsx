"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { useApp } from "@/context/AppContext";

export default function PrivacyConsentPage() {
  const router = useRouter();
  const { updateProfile, userId, signInLocal } = useApp();
  const [checked, setChecked] = useState(false);

  function continueFlow() {
    if (!userId) {
      signInLocal("demo@mealmind.app");
    }
    updateProfile({ privacy_consent_given: true });
    router.push("/onboarding");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--forest)]">
        Privacy & data consent
      </h1>
      <p className="mt-4 text-[var(--ink-muted)] leading-relaxed">
        We collect age, height, weight, activity, optional medical info, allergens, and food
        preferences to personalize your weekly plan. You can withdraw consent anytime from Profile.
      </p>
      <p className="mt-3 text-sm text-[var(--ink-muted)]">
        Read the full <Link href="/privacy" className="underline">privacy policy</Link>.
      </p>
      <label className="mt-8 flex items-start gap-3 text-sm text-[var(--ink)]">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-1"
        />
        <span>I consent to MealMind processing my personal data to generate meal plans (DPDP).</span>
      </label>
      <Button className="mt-6" disabled={!checked} onClick={continueFlow}>
        Continue
      </Button>
    </div>
  );
}
