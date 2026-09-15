import type { Entitlement, TrialState } from "@/types";

const TRIAL_DAYS = 3;

export function getTrialState(
  firstPlanViewedAt: string | null,
  entitlements: Entitlement[],
  now = new Date()
): TrialState {
  const activePro = entitlements.find(
    (e) =>
      e.kind === "pro_monthly" &&
      new Date(e.starts_at) <= now &&
      (!e.ends_at || new Date(e.ends_at) > now)
  );

  if (activePro) {
    return {
      started_at: firstPlanViewedAt,
      ends_at: activePro.ends_at,
      days_left: 0,
      is_active: false,
      has_access: true,
      reason: "pro",
    };
  }

  const activePlan = entitlements.find(
    (e) =>
      (e.kind === "plan_weekly" || e.kind === "plan_monthly") &&
      new Date(e.starts_at) <= now &&
      (!e.ends_at || new Date(e.ends_at) > now)
  );

  if (activePlan) {
    return {
      started_at: firstPlanViewedAt,
      ends_at: activePlan.ends_at,
      days_left: 0,
      is_active: false,
      has_access: true,
      reason: "plan",
    };
  }

  if (!firstPlanViewedAt) {
    return {
      started_at: null,
      ends_at: null,
      days_left: TRIAL_DAYS,
      is_active: false,
      has_access: true,
      reason: "none",
    };
  }

  const start = new Date(firstPlanViewedAt);
  const end = new Date(start);
  end.setDate(end.getDate() + TRIAL_DAYS);
  const msLeft = end.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
  const isActive = msLeft > 0;

  return {
    started_at: firstPlanViewedAt,
    ends_at: end.toISOString(),
    days_left: daysLeft,
    is_active: isActive,
    has_access: isActive,
    reason: isActive ? "trial" : "expired",
  };
}

export function canAccessRecipeSteps(
  dishId: string,
  trial: TrialState,
  entitlements: Entitlement[],
  now = new Date()
): boolean {
  if (trial.reason === "pro" || trial.reason === "trial" || trial.reason === "none") {
    return true;
  }

  return entitlements.some((e) => {
    const active = new Date(e.starts_at) <= now && (!e.ends_at || new Date(e.ends_at) > now);
    if (!active) return false;
    if (e.kind === "pro_monthly") return true;
    return e.kind === "recipe_unlock" && e.dish_id === dishId;
  });
}

export function canMutatePlan(trial: TrialState): boolean {
  return trial.has_access;
}

export const OFFERINGS = {
  pro_monthly: { amountPaise: 129900, label: "Monthly Pro", description: "Full access + all recipes" },
  plan_weekly: { amountPaise: 59900, label: "One-time weekly plan", description: "No commitment weekly plan" },
  plan_monthly: { amountPaise: 149900, label: "One-time monthly plan", description: "Recipes billed separately" },
  recipe: { amountPaise: 9900, label: "Recipe unlock", description: "À la carte recipe steps" },
} as const;
