"use client";

import { useMemo } from "react";
import { useApp } from "@/context/AppContext";

export default function ProgressPage() {
  const { plan } = useApp();

  const stats = useMemo(() => {
    const meals = plan?.days.flatMap((d) => d.meals) || [];
    return {
      planned: meals.filter((m) => m.status === "planned").length,
      ate: meals.filter((m) => m.status === "ate").length,
      swapped: meals.filter((m) => m.status === "swapped").length,
      skipped: meals.filter((m) => m.status === "skipped").length,
      total: meals.length,
    };
  }, [plan]);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--forest)]">
        Progress
      </h1>
      <p className="mt-2 text-[var(--ink-muted)]">Meal logging for your current week.</p>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          ["Ate", stats.ate],
          ["Swapped", stats.swapped],
          ["Skipped", stats.skipped],
          ["Still planned", stats.planned],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-3xl bg-white/70 p-5">
            <p className="text-sm text-[var(--ink-muted)]">{label}</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--forest)]">
              {value}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-[var(--ink-muted)]">
        {stats.total ? Math.round((stats.ate / stats.total) * 100) : 0}% of meals logged as ate.
      </p>
    </div>
  );
}
