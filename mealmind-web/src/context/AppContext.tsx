"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Entitlement,
  MealSlot,
  MealStatus,
  TrialState,
  UserProfile,
  WeeklyPlan,
} from "@/types";
import { localStore } from "@/lib/local-store";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  canAccessRecipeSteps,
  canMutatePlan,
  getTrialState,
} from "@/services/entitlements";
import {
  generateWeeklyPlan,
  regenerateDay,
  setDayFlags,
  setMealStatus,
  swapMeal,
} from "@/services/plan-engine";
import { MOCK_DISH_CATALOG } from "@/data/mock-catalog";

interface AppState {
  ready: boolean;
  userId: string | null;
  email: string | null;
  profile: UserProfile | null;
  plan: WeeklyPlan | null;
  avoidances: string[];
  entitlements: Entitlement[];
  firstPlanViewedAt: string | null;
  trial: TrialState;
  busy: boolean;
  error: string | null;
}

interface AppActions {
  signInLocal: (email: string) => void;
  /** MVP: create an anonymous local session so questionnaire works without login. */
  ensureGuestSession: () => void;
  signOut: () => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  saveOnboarding: (answers: Partial<UserProfile>) => void;
  acknowledgeMedical: () => void;
  generatePlan: () => Promise<WeeklyPlan>;
  markFirstPlanViewed: () => void;
  swap: (date: string, slot: MealSlot) => Promise<void>;
  dislike: (date: string, slot: MealSlot) => Promise<void>;
  regenerate: (date: string) => Promise<void>;
  logMeal: (date: string, slot: MealSlot, status: MealStatus) => void;
  toggleCheat: (date: string) => void;
  toggleFestive: (date: string) => void;
  grantLocalEntitlement: (entitlement: Entitlement) => void;
  canUsePlanActions: () => boolean;
  canViewRecipeSteps: (dishId: string) => boolean;
  catalog: typeof MOCK_DISH_CATALOG;
  supabaseConfigured: boolean;
}

const AppContext = createContext<(AppState & AppActions) | null>(null);

function createEmptyProfile(userId: string): UserProfile {
  const now = new Date().toISOString();
  return {
    user_id: userId,
    goal: "healthy_lifestyle",
    routine: "some_time",
    age: 30,
    gender: "prefer_not_to_say",
    height_cm: 170,
    weight_kg: 70,
    activity: "moderately_active",
    medical_conditions: [],
    medical_disclaimer_acked: false,
    cooking_skill: "comfortable",
    diet_type: "vegetarian",
    meats_avoided: [],
    cuisines: ["indian_general"],
    allergens: [],
    privacy_consent_given: false,
    onboarding_completed: false,
    created_at: now,
    updated_at: now,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [avoidances, setAvoidances] = useState<string[]>([]);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [firstPlanViewedAt, setFirstPlanViewedAt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = localStore.getSession();
    if (session) {
      setUserId(session.user_id);
      setEmail(session.email);
    }
    setProfile(localStore.getProfile());
    setPlan(localStore.getPlan());
    setAvoidances(localStore.getAvoidances());
    setEntitlements(localStore.getEntitlements());
    setFirstPlanViewedAt(localStore.getFirstPlanViewedAt());
    setReady(true);
  }, []);

  const trial = useMemo(
    () => getTrialState(firstPlanViewedAt, entitlements),
    [firstPlanViewedAt, entitlements]
  );

  const signInLocal = useCallback((nextEmail: string) => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `local_${Date.now()}`;
    const session = { user_id: id, email: nextEmail };
    localStore.setSession(session);
    setUserId(id);
    setEmail(nextEmail);
    const existing = localStore.getProfile();
    if (!existing) {
      const p = createEmptyProfile(id);
      localStore.setProfile(p);
      setProfile(p);
    } else {
      setProfile(existing);
    }
  }, []);

  const ensureGuestSession = useCallback(() => {
    const existingSession = localStore.getSession();
    if (existingSession) {
      if (!userId) {
        setUserId(existingSession.user_id);
        setEmail(existingSession.email);
      }
      if (!profile) {
        const existingProfile = localStore.getProfile();
        if (existingProfile) {
          setProfile(existingProfile);
        } else {
          const p = createEmptyProfile(existingSession.user_id);
          localStore.setProfile(p);
          setProfile(p);
        }
      }
      return;
    }
    signInLocal("guest@mealmind.app");
  }, [userId, profile, signInLocal]);

  const signOut = useCallback(() => {
    localStore.clearAll();
    setUserId(null);
    setEmail(null);
    setProfile(null);
    setPlan(null);
    setAvoidances([]);
    setEntitlements([]);
    setFirstPlanViewedAt(null);
  }, []);

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch, updated_at: new Date().toISOString() };
      localStore.setProfile(next);
      return next;
    });
  }, []);

  const saveOnboarding = useCallback((answers: Partial<UserProfile>) => {
    setProfile((prev) => {
      const base = prev || createEmptyProfile(userId || "anonymous");
      const next: UserProfile = {
        ...base,
        ...answers,
        user_id: base.user_id,
        onboarding_completed: true,
        privacy_consent_given: true,
        updated_at: new Date().toISOString(),
      };
      localStore.setProfile(next);
      return next;
    });
  }, [userId]);

  const acknowledgeMedical = useCallback(() => {
    updateProfile({ medical_disclaimer_acked: true });
  }, [updateProfile]);

  const generatePlan = useCallback(async () => {
    if (!profile) throw new Error("Profile required");
    setBusy(true);
    setError(null);
    try {
      const next = await generateWeeklyPlan(profile, MOCK_DISH_CATALOG);
      localStore.setPlan(next);
      setPlan(next);
      return next;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Plan generation failed";
      setError(message);
      throw e;
    } finally {
      setBusy(false);
    }
  }, [profile]);

  const markFirstPlanViewed = useCallback(() => {
    if (firstPlanViewedAt) return;
    const iso = new Date().toISOString();
    localStore.setFirstPlanViewedAt(iso);
    setFirstPlanViewedAt(iso);
  }, [firstPlanViewedAt]);

  const ensureAccess = useCallback(() => {
    if (!canMutatePlan(trial)) {
      throw new Error("Trial ended. Upgrade to continue meal actions.");
    }
  }, [trial]);

  const swap = useCallback(
    async (date: string, slot: MealSlot) => {
      if (!plan || !profile) return;
      ensureAccess();
      setBusy(true);
      try {
        const next = await swapMeal(plan, date, slot, profile, avoidances, MOCK_DISH_CATALOG);
        localStore.setPlan(next);
        setPlan(next);
      } finally {
        setBusy(false);
      }
    },
    [plan, profile, avoidances, ensureAccess]
  );

  const dislike = useCallback(
    async (date: string, slot: MealSlot) => {
      if (!plan || !profile) return;
      ensureAccess();
      const meal = plan.days.find((d) => d.date === date)?.meals.find((m) => m.slot === slot);
      if (!meal) return;
      const nextAvoid = Array.from(new Set([...avoidances, meal.dish_id]));
      localStore.setAvoidances(nextAvoid);
      setAvoidances(nextAvoid);
      await swap(date, slot);
    },
    [plan, profile, avoidances, swap, ensureAccess]
  );

  const regenerate = useCallback(
    async (date: string) => {
      if (!plan || !profile) return;
      ensureAccess();
      setBusy(true);
      try {
        const next = await regenerateDay(plan, date, profile, avoidances, MOCK_DISH_CATALOG);
        localStore.setPlan(next);
        setPlan(next);
      } finally {
        setBusy(false);
      }
    },
    [plan, profile, avoidances, ensureAccess]
  );

  const logMeal = useCallback(
    (date: string, slot: MealSlot, status: MealStatus) => {
      if (!plan) return;
      const next = setMealStatus(plan, date, slot, status);
      localStore.setPlan(next);
      setPlan(next);
    },
    [plan]
  );

  const toggleCheat = useCallback(
    (date: string) => {
      if (!plan) return;
      const day = plan.days.find((d) => d.date === date);
      if (!day) return;
      const next = setDayFlags(plan, date, { cheat: !day.flags.cheat });
      localStore.setPlan(next);
      setPlan(next);
    },
    [plan]
  );

  const toggleFestive = useCallback(
    (date: string) => {
      if (!plan) return;
      const day = plan.days.find((d) => d.date === date);
      if (!day) return;
      const next = setDayFlags(plan, date, {
        festive: !day.flags.festive,
        festive_label: !day.flags.festive ? "Festive" : null,
      });
      localStore.setPlan(next);
      setPlan(next);
    },
    [plan]
  );

  const grantLocalEntitlement = useCallback((entitlement: Entitlement) => {
    setEntitlements((prev) => {
      const next = [...prev, entitlement];
      localStore.setEntitlements(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      ready,
      userId,
      email,
      profile,
      plan,
      avoidances,
      entitlements,
      firstPlanViewedAt,
      trial,
      busy,
      error,
      signInLocal,
      ensureGuestSession,
      signOut,
      updateProfile,
      saveOnboarding,
      acknowledgeMedical,
      generatePlan,
      markFirstPlanViewed,
      swap,
      dislike,
      regenerate,
      logMeal,
      toggleCheat,
      toggleFestive,
      grantLocalEntitlement,
      canUsePlanActions: () => canMutatePlan(trial),
      canViewRecipeSteps: (dishId: string) =>
        canAccessRecipeSteps(dishId, trial, entitlements),
      catalog: MOCK_DISH_CATALOG,
      supabaseConfigured: isSupabaseConfigured(),
    }),
    [
      ready,
      userId,
      email,
      profile,
      plan,
      avoidances,
      entitlements,
      firstPlanViewedAt,
      trial,
      busy,
      error,
      signInLocal,
      ensureGuestSession,
      signOut,
      updateProfile,
      saveOnboarding,
      acknowledgeMedical,
      generatePlan,
      markFirstPlanViewed,
      swap,
      dislike,
      regenerate,
      logMeal,
      toggleCheat,
      toggleFestive,
      grantLocalEntitlement,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
