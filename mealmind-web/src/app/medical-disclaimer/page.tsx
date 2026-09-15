"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { useApp } from "@/context/AppContext";

export default function MedicalDisclaimerPage() {
  const router = useRouter();
  const { acknowledgeMedical } = useApp();

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--forest)]">
        Medical disclaimer
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-[var(--ink)]">
        This app does not provide medical advice. Please consult your doctor before following this
        plan.
      </p>
      <p className="mt-4 text-sm text-[var(--ink-muted)]">
        Until you acknowledge, MealMind will show a limited plan with a persistent banner.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <Button
          onClick={() => {
            acknowledgeMedical();
            router.push("/generating-plan");
          }}
        >
          I understand — continue
        </Button>
        <Button variant="ghost" onClick={() => router.push("/onboarding")}>
          Edit conditions
        </Button>
      </div>
    </div>
  );
}
