"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { useApp } from "@/context/AppContext";
import { OFFERINGS } from "@/services/entitlements";
import type { Entitlement } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const { email, profile, trial, entitlements, signOut, grantLocalEntitlement } = useApp();
  const [busyMsg, setBusyMsg] = useState<string | null>(null);

  async function buy(offering: keyof typeof OFFERINGS) {
    setBusyMsg("Starting checkout…");
    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offering }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      if (data.demo) {
        const now = new Date();
        const ends = new Date(now);
        if (offering === "pro_monthly" || offering === "plan_monthly") {
          ends.setDate(ends.getDate() + 30);
        } else if (offering === "plan_weekly") {
          ends.setDate(ends.getDate() + 7);
        }
        const entitlement: Entitlement = {
          id: `local_${Date.now()}`,
          user_id: profile?.user_id || "local",
          kind:
            offering === "pro_monthly"
              ? "pro_monthly"
              : offering === "plan_weekly"
                ? "plan_weekly"
                : "plan_monthly",
          starts_at: now.toISOString(),
          ends_at: ends.toISOString(),
          source: "demo_checkout",
        };
        grantLocalEntitlement(entitlement);
        setBusyMsg(`${OFFERINGS[offering].label} unlocked (demo mode).`);
        return;
      }

      setBusyMsg(`Order ${data.orderId} created. Complete Razorpay payment to activate.`);
    } catch (e) {
      setBusyMsg(e instanceof Error ? e.message : "Checkout failed");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--forest)]">
          Profile
        </h1>
        <p className="mt-2 text-[var(--ink-muted)]">{email || "Signed in"}</p>
      </div>

      <section className="rounded-3xl bg-white/70 p-5">
        <h2 className="font-semibold">Access</h2>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          Trial: {trial.reason}
          {trial.is_active ? ` · ${trial.days_left} days left` : ""}
        </p>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Active entitlements: {entitlements.length || 0}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => buy("pro_monthly")}>Buy Pro ₹1,299</Button>
          <Button variant="secondary" onClick={() => buy("plan_weekly")}>
            Weekly plan ₹599
          </Button>
          <Button variant="ghost" onClick={() => buy("plan_monthly")}>
            Monthly plan ₹1,499
          </Button>
        </div>
        {busyMsg && <p className="mt-3 text-sm text-[var(--ink-muted)]">{busyMsg}</p>}
      </section>

      <section className="rounded-3xl bg-white/70 p-5 text-sm text-[var(--ink-muted)]">
        <h2 className="font-semibold text-[var(--ink)]">Preferences</h2>
        <p className="mt-2">Goal: {profile?.goal?.replaceAll("_", " ")}</p>
        <p>Diet: {profile?.diet_type?.replaceAll("_", " ")}</p>
        <p>Cuisines: {profile?.cuisines?.map((c) => c.replaceAll("_", " ")).join(", ")}</p>
        <Link href="/onboarding" className="mt-3 inline-block text-[var(--forest)] underline">
          Edit onboarding answers
        </Link>
      </section>

      <Button
        variant="ghost"
        onClick={() => {
          signOut();
          router.push("/");
        }}
      >
        Sign out
      </Button>
    </div>
  );
}
