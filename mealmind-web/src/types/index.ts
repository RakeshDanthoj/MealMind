export type PrimaryGoal =
  | "healthy_lifestyle"
  | "weight_loss"
  | "muscle_gain"
  | "maintenance"
  | "other";

export type DailyRoutine = "hectic" | "some_time" | "flexible";

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active";

export type CookingSkill = "beginner" | "comfortable" | "advanced";

export type CuisineType =
  | "indian_general"
  | "north_indian"
  | "south_indian"
  | "chinese"
  | "asian";

export type MealSlot = "breakfast" | "lunch" | "snack" | "dinner";

export type MealStatus = "planned" | "ate" | "swapped" | "skipped";

export type PlanMode = "full" | "limited";

export type DietType = "vegetarian" | "eggetarian" | "non_vegetarian";

export type MeatAvoid = "beef" | "pork" | "mutton" | "seafood";

export interface UserProfile {
  user_id: string;
  goal: PrimaryGoal;
  routine: DailyRoutine;
  age: number;
  gender: Gender;
  height_cm: number;
  weight_kg: number;
  activity: ActivityLevel;
  medical_conditions: string[];
  medical_disclaimer_acked: boolean;
  cooking_skill: CookingSkill;
  diet_type: DietType;
  meats_avoided: MeatAvoid[];
  cuisines: CuisineType[];
  allergens: string[];
  privacy_consent_given: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface MacroBands {
  protein_g: [number, number];
  carbs_g: [number, number];
  fat_g: [number, number];
}

export interface DayFlags {
  cheat: boolean;
  festive: boolean;
  festive_label: string | null;
}

export interface MealItem {
  slot: MealSlot;
  dish_id: string;
  name: string;
  kcal: number;
  cuisine: CuisineType;
  status: MealStatus;
  prep_minutes?: number;
  photo_url?: string | null;
}

export interface DayPlan {
  date: string;
  day_index: number;
  flags: DayFlags;
  meals: MealItem[];
}

export interface WeeklyPlan {
  plan_id: string;
  user_id: string;
  week_start: string;
  catalog_version: number;
  mode: PlanMode;
  daily_kcal_target: number;
  macro_bands: MacroBands;
  days: DayPlan[];
  generated_at: string;
  generator: string;
}

export interface DishCatalogItem {
  dish_id: string;
  name: string;
  cuisines: CuisineType[];
  meal_slots: MealSlot[];
  ingredients: string[];
  allergens: string[];
  diet_tags: string[];
  prep_complexity: CookingSkill;
  prep_minutes: number;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  cheat_suitable: boolean;
  festive_tags: string[];
  photo_url: string | null;
  recipe_preview: string;
  recipe_steps_ref: string | null;
  recipe_steps?: string | null;
  active: boolean;
  dietician_reviewed: boolean;
  version: number;
}

export type EntitlementKind =
  | "pro_monthly"
  | "plan_weekly"
  | "plan_monthly"
  | "recipe_unlock";

export interface Entitlement {
  id: string;
  user_id: string;
  kind: EntitlementKind;
  dish_id?: string | null;
  starts_at: string;
  ends_at: string | null;
  source: string;
}

export interface TrialState {
  started_at: string | null;
  ends_at: string | null;
  days_left: number;
  is_active: boolean;
  has_access: boolean;
  reason: "trial" | "pro" | "plan" | "expired" | "none";
}

export type CheckoutOffering =
  | "pro_monthly"
  | "plan_weekly"
  | "plan_monthly"
  | "recipe";
