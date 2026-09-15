import type {
  CookingSkill,
  CuisineType,
  DayPlan,
  DietType,
  DishCatalogItem,
  MealItem,
  MealSlot,
  MealStatus,
  PlanMode,
  UserProfile,
  WeeklyPlan,
} from "@/types";
import { MOCK_DISH_CATALOG } from "@/data/mock-catalog";

const MEAL_SLOTS: MealSlot[] = ["breakfast", "lunch", "snack", "dinner"];

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function matchesDiet(dish: DishCatalogItem, dietType: DietType): boolean {
  const tags = dish.diet_tags.map((t) => t.toLowerCase());
  const ingredients = dish.ingredients.map((i) => i.toLowerCase());
  const hasEgg = tags.includes("contains_egg") || ingredients.some((i) => i.includes("egg"));
  const hasMeat =
    tags.includes("non_vegetarian") ||
    tags.includes("contains_meat") ||
    ingredients.some((i) =>
      ["chicken", "mutton", "beef", "pork", "fish", "prawn", "seafood", "lamb"].some((m) =>
        i.includes(m)
      )
    );

  if (dietType === "vegetarian") {
    return !hasEgg && !hasMeat && (tags.includes("vegetarian") || !tags.includes("non_vegetarian"));
  }
  if (dietType === "eggetarian") {
    return !hasMeat;
  }
  return true;
}

export function filterDishesForUser(
  catalog: DishCatalogItem[],
  slot: MealSlot,
  cuisines: CuisineType[],
  allergens: string[],
  cookingSkill: CookingSkill,
  dietType: DietType,
  avoidDishIds: string[] = []
): DishCatalogItem[] {
  const complexityOrder: CookingSkill[] = ["beginner", "comfortable", "advanced"];
  const maxComplexityIndex = complexityOrder.indexOf(cookingSkill);
  const allergenSet = allergens.map((a) => a.toLowerCase());

  return catalog.filter((dish) => {
    if (!dish.active) return false;
    if (!dish.meal_slots.includes(slot)) return false;
    if (!dish.cuisines.some((c) => cuisines.includes(c))) return false;
    if (dish.allergens.some((a) => allergenSet.includes(a.toLowerCase()))) return false;
    if (complexityOrder.indexOf(dish.prep_complexity) > maxComplexityIndex) return false;
    if (avoidDishIds.includes(dish.dish_id)) return false;
    if (!matchesDiet(dish, dietType)) return false;
    return true;
  });
}

function calculateDailyKcalTarget(profile: Partial<UserProfile>): number {
  const weight = profile.weight_kg || 70;
  const height = profile.height_cm || 170;
  const age = profile.age || 30;
  const gender = profile.gender || "male";

  const bmr =
    gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
  };

  const tdee = bmr * activityMultipliers[profile.activity || "sedentary"];
  const goalAdjustments = {
    weight_loss: -500,
    muscle_gain: 300,
    maintenance: 0,
    healthy_lifestyle: -200,
    other: 0,
  };

  const target = tdee + goalAdjustments[profile.goal || "healthy_lifestyle"];
  return Math.round(target / 50) * 50;
}

function pickRandomDish(
  dishes: DishCatalogItem[],
  usedDishIds: Set<string>
): DishCatalogItem | undefined {
  const available = dishes.filter((d) => !usedDishIds.has(d.dish_id));
  if (available.length === 0) {
    return dishes[Math.floor(Math.random() * dishes.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}

async function generateDayPlan(
  catalog: DishCatalogItem[],
  dayIndex: number,
  weekStartDate: Date,
  profile: Partial<UserProfile>,
  usedDishIds: Set<string>,
  mode: PlanMode
): Promise<DayPlan> {
  const date = new Date(weekStartDate);
  date.setDate(date.getDate() + dayIndex);
  const dateStr = date.toISOString().split("T")[0];

  const cuisines = profile.cuisines || ["indian_general"];
  const allergens = profile.allergens || [];
  const skill = profile.cooking_skill || "comfortable";
  const dietType = profile.diet_type || "vegetarian";

  const meals: MealItem[] = [];

  for (const slot of MEAL_SLOTS) {
    let availableDishes = filterDishesForUser(
      catalog,
      slot,
      cuisines,
      allergens,
      skill,
      dietType,
      Array.from(usedDishIds)
    );

    if (mode === "limited") {
      availableDishes = availableDishes.filter(
        (d) => d.prep_complexity === "beginner" || d.prep_complexity === "comfortable"
      );
    }

    if (availableDishes.length === 0) {
      availableDishes = filterDishesForUser(catalog, slot, cuisines, allergens, skill, dietType, []);
    }

    if (availableDishes.length === 0) {
      availableDishes = catalog.filter((d) => d.meal_slots.includes(slot) && d.active);
    }

    const dish = pickRandomDish(availableDishes, usedDishIds);

    if (dish) {
      usedDishIds.add(dish.dish_id);
      meals.push({
        slot,
        dish_id: dish.dish_id,
        name: dish.name,
        kcal: dish.kcal,
        cuisine: dish.cuisines[0],
        status: "planned",
        prep_minutes: dish.prep_minutes,
        photo_url: dish.photo_url,
      });
    } else {
      meals.push({
        slot,
        dish_id: `default_${slot}`,
        name: `Balanced ${slot.charAt(0).toUpperCase()}${slot.slice(1)}`,
        kcal: 300,
        cuisine: "indian_general",
        status: "planned",
      });
    }
  }

  return {
    date: dateStr,
    day_index: dayIndex,
    flags: { cheat: false, festive: false, festive_label: null },
    meals,
  };
}

export async function generateWeeklyPlan(
  profile: Partial<UserProfile>,
  catalog: DishCatalogItem[] = MOCK_DISH_CATALOG
): Promise<WeeklyPlan> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const planId = generateId();
  const userId = profile.user_id || generateId();
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString().split("T")[0];

  const hasMedical = (profile.medical_conditions?.length || 0) > 0;
  const disclaimerAcked = profile.medical_disclaimer_acked || false;
  const mode: PlanMode = hasMedical && !disclaimerAcked ? "limited" : "full";

  const dailyKcalTarget = calculateDailyKcalTarget(profile);
  const usedDishIds = new Set<string>();

  const days: DayPlan[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(await generateDayPlan(catalog, i, weekStart, profile, usedDishIds, mode));
  }

  const proteinTarget =
    profile.goal === "muscle_gain"
      ? [Math.round((dailyKcalTarget * 0.25) / 4), Math.round((dailyKcalTarget * 0.35) / 4)]
      : [Math.round((dailyKcalTarget * 0.15) / 4), Math.round((dailyKcalTarget * 0.25) / 4)];

  return {
    plan_id: planId,
    user_id: userId,
    week_start: weekStartStr,
    catalog_version: 1,
    mode,
    daily_kcal_target: dailyKcalTarget,
    macro_bands: {
      protein_g: proteinTarget as [number, number],
      carbs_g: [
        Math.round((dailyKcalTarget * 0.45) / 4),
        Math.round((dailyKcalTarget * 0.55) / 4),
      ],
      fat_g: [
        Math.round((dailyKcalTarget * 0.2) / 9),
        Math.round((dailyKcalTarget * 0.35) / 9),
      ],
    },
    days,
    generated_at: new Date().toISOString(),
    generator: "static_kb_v1",
  };
}

export async function swapMeal(
  plan: WeeklyPlan,
  date: string,
  slot: MealSlot,
  profile: Partial<UserProfile>,
  avoidDishIds: string[] = [],
  catalog: DishCatalogItem[] = MOCK_DISH_CATALOG
): Promise<WeeklyPlan> {
  const dayIndex = plan.days.findIndex((d) => d.date === date);
  if (dayIndex === -1) throw new Error("Day not found");

  const currentDish = plan.days[dayIndex].meals.find((m) => m.slot === slot);
  const currentDishId = currentDish?.dish_id || "";
  const allAvoid = [...avoidDishIds, currentDishId];

  let available = filterDishesForUser(
    catalog,
    slot,
    profile.cuisines || ["indian_general"],
    profile.allergens || [],
    profile.cooking_skill || "comfortable",
    profile.diet_type || "vegetarian",
    allAvoid
  );

  if (available.length === 0) {
    available = catalog.filter((d) => d.meal_slots.includes(slot) && d.active);
  }

  const dish = pickRandomDish(available, new Set(allAvoid));
  if (!dish) throw new Error("No alternative dish found");

  const nextDays = plan.days.map((day, idx) => {
    if (idx !== dayIndex) return day;
    return {
      ...day,
      meals: day.meals.map((meal) =>
        meal.slot === slot
          ? {
              slot,
              dish_id: dish.dish_id,
              name: dish.name,
              kcal: dish.kcal,
              cuisine: dish.cuisines[0],
              status: "swapped" as MealStatus,
              prep_minutes: dish.prep_minutes,
              photo_url: dish.photo_url,
            }
          : meal
      ),
    };
  });

  return { ...plan, days: nextDays };
}

export async function regenerateDay(
  plan: WeeklyPlan,
  date: string,
  profile: Partial<UserProfile>,
  avoidDishIds: string[] = [],
  catalog: DishCatalogItem[] = MOCK_DISH_CATALOG
): Promise<WeeklyPlan> {
  const dayIndex = plan.days.findIndex((d) => d.date === date);
  if (dayIndex === -1) throw new Error("Day not found");

  const used = new Set(
    plan.days
      .filter((d) => d.date !== date)
      .flatMap((d) => d.meals.map((m) => m.dish_id))
      .concat(avoidDishIds)
  );

  const weekStart = new Date(plan.week_start);
  const newDay = await generateDayPlan(catalog, dayIndex, weekStart, profile, used, plan.mode);
  newDay.date = date;
  newDay.flags = plan.days[dayIndex].flags;

  const nextDays = [...plan.days];
  nextDays[dayIndex] = newDay;
  return { ...plan, days: nextDays };
}

export function setMealStatus(
  plan: WeeklyPlan,
  date: string,
  slot: MealSlot,
  status: MealStatus
): WeeklyPlan {
  return {
    ...plan,
    days: plan.days.map((day) =>
      day.date !== date
        ? day
        : {
            ...day,
            meals: day.meals.map((meal) => (meal.slot === slot ? { ...meal, status } : meal)),
          }
    ),
  };
}

export function setDayFlags(
  plan: WeeklyPlan,
  date: string,
  flags: Partial<DayPlan["flags"]>
): WeeklyPlan {
  return {
    ...plan,
    days: plan.days.map((day) =>
      day.date !== date ? day : { ...day, flags: { ...day.flags, ...flags } }
    ),
  };
}

export function getDishById(
  dishId: string,
  catalog: DishCatalogItem[] = MOCK_DISH_CATALOG
): DishCatalogItem | undefined {
  return catalog.find((d) => d.dish_id === dishId);
}
