"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/Button";
import { useApp } from "@/context/AppContext";
import { OFFERINGS } from "@/services/entitlements";
import type { Entitlement } from "@/types";

function LibraryInner() {
  const params = useSearchParams();
  const selectedId = params.get("dish");
  const { catalog, canViewRecipeSteps, grantLocalEntitlement, trial } = useApp();
  const [activeId, setActiveId] = useState(selectedId || catalog[0]?.dish_id);
  const dish = useMemo(
    () => catalog.find((d) => d.dish_id === activeId) || catalog[0],
    [catalog, activeId]
  );
  const unlocked = dish ? canViewRecipeSteps(dish.dish_id) : false;
  const [status, setStatus] = useState<string | null>(null);

  async function unlockRecipe() {
    if (!dish) return;
    setStatus("Creating Razorpay order…");
    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offering: "recipe", dishId: dish.dish_id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      // Demo grant when Razorpay keys are absent (local/test without keys)
      if (data.demo) {
        const entitlement: Entitlement = {
          id: `local_${Date.now()}`,
          user_id: "local",
          kind: "recipe_unlock",
          dish_id: dish.dish_id,
          starts_at: new Date().toISOString(),
          ends_at: null,
          source: "demo_checkout",
        };
        grantLocalEntitlement(entitlement);
        setStatus("Recipe unlocked (demo mode).");
        return;
      }

      setStatus(`Order ${data.orderId} created for ₹${OFFERINGS.recipe.amountPaise / 100}. Complete payment in Razorpay Checkout.`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Unlock failed");
    }
  }

  if (!dish) return <p>No dishes in catalog.</p>;

  return (
    <div className="grid gap-6 md:grid-cols-[240px_1fr]">
      <aside className="max-h-[70vh] space-y-2 overflow-y-auto">
        {catalog.map((item) => (
          <button
            key={item.dish_id}
            type="button"
            onClick={() => setActiveId(item.dish_id)}
            className={`block w-full rounded-2xl px-3 py-3 text-left text-sm ${
              item.dish_id === dish.dish_id
                ? "bg-[var(--forest)] text-[var(--cream-soft)]"
                : "bg-white/70 text-[var(--ink)]"
            }`}
          >
            {item.name}
          </button>
        ))}
      </aside>

      <article className="rounded-3xl border border-[var(--forest)]/10 bg-white/70 p-6">
        <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">
          {dish.meal_slots.join(" · ")}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--forest)]">
          {dish.name}
        </h1>
        <p className="mt-3 text-[var(--ink-muted)]">{dish.recipe_preview}</p>
        <div className="mt-5">
          <h2 className="font-semibold text-[var(--ink)]">Ingredients</h2>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            {dish.ingredients.map((i) => i.replaceAll("_", " ")).join(", ")}
          </p>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold text-[var(--ink)]">Step-by-step</h2>
          {unlocked ? (
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--ink-muted)]">
              {(
                dish.recipe_steps?.split("\n").filter(Boolean) || [
                  "Prep ingredients and set out spices.",
                  "Cook according to your preferred heat and texture.",
                  "Plate and enjoy — adjust salt last.",
                ]
              ).map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          ) : (
            <div className="mt-3 rounded-2xl border border-dashed border-[var(--forest)]/25 bg-[var(--mist)] p-4">
              <p className="text-sm text-[var(--ink-muted)]">
                Full instructions are gated. Trial reason: {trial.reason}. Unlock for ₹99 or subscribe
                to Pro.
              </p>
              <Button className="mt-4" onClick={unlockRecipe}>
                Unlock for ₹99
              </Button>
            </div>
          )}
        </div>
        {status && <p className="mt-4 text-sm text-[var(--ink-muted)]">{status}</p>}
      </article>
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<p>Loading library…</p>}>
      <LibraryInner />
    </Suspense>
  );
}
