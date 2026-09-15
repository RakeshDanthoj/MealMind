"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { useApp } from "@/context/AppContext";
import type { MealSlot } from "@/types";

export default function PlanPage() {
  const {
    plan,
    profile,
    trial,
    busy,
    swap,
    dislike,
    regenerate,
    logMeal,
    toggleCheat,
    toggleFestive,
    canUsePlanActions,
  } = useApp();
  const [selected, setSelected] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const day = plan?.days[selected];
  const locked = !canUsePlanActions();

  const banner = useMemo(() => {
    if (profile?.medical_conditions?.length && !profile.medical_disclaimer_acked) {
      return "Limited plan — medical disclaimer applies.";
    }
    if (trial.reason === "trial" && trial.is_active) {
      return `${trial.days_left} day${trial.days_left === 1 ? "" : "s"} left in your free trial.`;
    }
    if (trial.reason === "expired") {
      return "Trial ended. Upgrade to swap, regenerate, or unlock full recipes.";
    }
    return null;
  }, [profile, trial]);

  async function runAction(action: () => Promise<void>, success: string) {
    try {
      setMessage(null);
      await action();
      setMessage(success);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Action failed");
    }
  }

  if (!plan || !day) {
    return <p className="text-[var(--ink-muted)]">Generating your plan…</p>;
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--forest)]">
            Your plan
          </h1>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            {plan.daily_kcal_target} kcal/day target · {plan.mode} mode
          </p>
        </div>
        {locked && (
          <Link href="/pricing" className="rounded-full bg-[var(--citrus)] px-4 py-2 text-sm font-semibold">
            Upgrade
          </Link>
        )}
      </div>

      {banner && (
        <div className="mt-4 rounded-2xl border border-[var(--forest)]/15 bg-white/70 px-4 py-3 text-sm text-[var(--forest)]">
          {banner}
        </div>
      )}

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
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

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="ghost" disabled={busy} onClick={() => toggleCheat(day.date)}>
          {day.flags.cheat ? "Unmark cheat day" : "Mark cheat day"}
        </Button>
        <Button variant="ghost" disabled={busy} onClick={() => toggleFestive(day.date)}>
          {day.flags.festive ? "Unmark festive" : "Mark festive"}
        </Button>
        <Button
          variant="secondary"
          disabled={busy || locked}
          onClick={() =>
            runAction(() => regenerate(day.date), "Day regenerated")
          }
        >
          Regenerate day
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        {day.meals.map((meal) => (
          <MealCard
            key={meal.slot}
            slot={meal.slot}
            name={meal.name}
            kcal={meal.kcal}
            status={meal.status}
            dishId={meal.dish_id}
            disabled={busy || locked}
            onSwap={() => runAction(() => swap(day.date, meal.slot), "Meal swapped")}
            onDislike={() =>
              runAction(() => dislike(day.date, meal.slot), "We'll avoid this next time")
            }
            onLog={(status) => logMeal(day.date, meal.slot, status)}
          />
        ))}
      </div>

      {message && <p className="mt-4 text-sm text-[var(--ink-muted)]">{message}</p>}
    </div>
  );
}

function MealCard({
  slot,
  name,
  kcal,
  status,
  dishId,
  disabled,
  onSwap,
  onDislike,
  onLog,
}: {
  slot: MealSlot;
  name: string;
  kcal: number;
  status: string;
  dishId: string;
  disabled: boolean;
  onSwap: () => void;
  onDislike: () => void;
  onLog: (status: "ate" | "swapped" | "skipped") => void;
}) {
  return (
    <article className="rounded-3xl border border-[var(--forest)]/10 bg-white/70 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">{slot}</p>
          <h2 className="mt-1 text-xl font-semibold text-[var(--ink)]">{name}</h2>
          <p className="text-sm text-[var(--ink-muted)]">
            {kcal} kcal · {status}
          </p>
        </div>
        <Link href={`/library?dish=${dishId}`} className="text-sm text-[var(--forest)] underline">
          Recipe
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="ghost" disabled={disabled} onClick={onSwap}>
          Swap
        </Button>
        <Button variant="ghost" disabled={disabled} onClick={onDislike}>
          Don&apos;t like
        </Button>
        <Button variant="secondary" disabled={disabled} onClick={() => onLog("ate")}>
          Ate
        </Button>
        <Button variant="ghost" disabled={disabled} onClick={() => onLog("swapped")}>
          Swapped
        </Button>
        <Button variant="ghost" disabled={disabled} onClick={() => onLog("skipped")}>
          Skipped
        </Button>
      </div>
    </article>
  );
}
