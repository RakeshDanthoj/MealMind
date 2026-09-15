import type { Entitlement, UserProfile, WeeklyPlan } from "@/types";

const PREFIX = "mealmind_web_";

function key(name: string) {
  return `${PREFIX}${name}`;
}

export const localStore = {
  getProfile(): UserProfile | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(key("profile"));
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  },
  setProfile(profile: UserProfile) {
    localStorage.setItem(key("profile"), JSON.stringify(profile));
  },
  getPlan(): WeeklyPlan | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(key("plan"));
    return raw ? (JSON.parse(raw) as WeeklyPlan) : null;
  },
  setPlan(plan: WeeklyPlan) {
    localStorage.setItem(key("plan"), JSON.stringify(plan));
  },
  getAvoidances(): string[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(key("avoid"));
    return raw ? (JSON.parse(raw) as string[]) : [];
  },
  setAvoidances(ids: string[]) {
    localStorage.setItem(key("avoid"), JSON.stringify(ids));
  },
  getSession(): { user_id: string; email: string } | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(key("session"));
    return raw ? (JSON.parse(raw) as { user_id: string; email: string }) : null;
  },
  setSession(session: { user_id: string; email: string } | null) {
    if (!session) {
      localStorage.removeItem(key("session"));
      return;
    }
    localStorage.setItem(key("session"), JSON.stringify(session));
  },
  getFirstPlanViewedAt(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key("first_plan_viewed_at"));
  },
  setFirstPlanViewedAt(iso: string) {
    localStorage.setItem(key("first_plan_viewed_at"), iso);
  },
  getEntitlements(): Entitlement[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(key("entitlements"));
    return raw ? (JSON.parse(raw) as Entitlement[]) : [];
  },
  setEntitlements(items: Entitlement[]) {
    localStorage.setItem(key("entitlements"), JSON.stringify(items));
  },
  clearAll() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  },
};
