"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { useApp } from "@/context/AppContext";

export default function PlanRevealPage() {
  const router = useRouter();
  const { plan, profile, markFirstPlanViewed } = useApp();
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (plan) markFirstPlanViewed();
  }, [plan, markFirstPlanViewed]);

  const goalEcho = useMemo(() => {
    if (!profile) return "Built for your lifestyle";
    const goal = profile.goal.replaceAll("_", " ");
    const cuisines = profile.cuisines.map((c) => c.replaceAll("_", " ")).join(" + ");
    return `Built for ${goal}${cuisines ? ` · ${cuisines}` : ""}`;
  }, [profile]);

  if (!plan) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <p className="text-[var(--ink-muted)]">No plan yet.</p>
        <Link href="/generating-plan" className="mt-4 text-[var(--forest)] underline">
          Generate plan
        </Link>
      </div>
    );
  }

  const day = plan.days[selected];

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-10">
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--forest)]">
        Your week is ready
      </h1>
      <p className="mt-3 text-[var(--ink-muted)]">{goalEcho}</p>

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
        {plan.days.map((d, index) => (
          <button
            key={d.date}
            type="button"
            onClick={() => setSelected(index)}
            className={`min-w-14 rounded-2xl px-3 py-3 text-sm ${
              selected === index
                ? "bg-[var(--forest)] text-[var(--cream-soft)]"
                : "bg-white/70 text-[var(--ink)]"
            }`}
          >
            D{index + 1}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {day.meals.map((meal) => (
          <div
            key={meal.slot}
            className="rounded-3xl border border-[var(--forest)]/10 bg-white/65 px-5 py-4"
          >
            <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">{meal.slot}</p>
            <p className="mt-1 text-lg font-semibold text-[var(--ink)]">{meal.name}</p>
            <p className="text-sm text-[var(--ink-muted)]">
              {meal.kcal} kcal · {meal.prep_minutes || 20} min
            </p>
          </div>
        ))}
      </div>

      <Button className="mt-8" onClick={() => router.push("/plan")}>
        See today&apos;s meals
      </Button>
    </div>
  );
}
