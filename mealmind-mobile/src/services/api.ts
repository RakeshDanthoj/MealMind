import { v4 as uuidv4 } from 'uuid';
import {
  WeeklyPlan,
  UserProfile,
  DayPlan,
  MealItem,
  MealSlot,
  CuisineType,
  MealStatus,
  PlanMode,
  DishCatalogItem,
  CookingSkill,
} from '../types';
import { isSupabaseConfigured } from '../lib/supabase';
import * as repositories from '../data/repositories';
import {
  filterDishesForUser as filterMockDishes,
  getDishById as getMockDishById,
  MOCK_DISH_CATALOG,
} from './mock-catalog';

const DEV_SKIP_USER = 'dev-skip-user';

const MEAL_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'snack', 'dinner'];

function isRealUser(userId: string | undefined | null): boolean {
  if (!userId) return false;
  if (userId === DEV_SKIP_USER) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(userId);
}

function shouldPersistToSupabase(userId: string | undefined | null): boolean {
  return isSupabaseConfigured() && isRealUser(userId);
}

let cachedDishes: DishCatalogItem[] | null = null;

async function getCatalog(): Promise<DishCatalogItem[]> {
  if (cachedDishes !== null) {
    return cachedDishes;
  }

  if (isSupabaseConfigured()) {
    try {
      const dishes = await repositories.listActiveDishes();
      if (dishes.length > 0) {
        cachedDishes = dishes;
        return dishes;
      }
    } catch (e) {
      console.warn('Failed to load catalog from Supabase, using mock:', e);
    }
  }

  cachedDishes = MOCK_DISH_CATALOG;
  return MOCK_DISH_CATALOG;
}

export function clearCatalogCache(): void {
  cachedDishes = null;
}

async function filterDishesForUserFromCatalog(
  slot: MealSlot,
  cuisines: CuisineType[],
  allergens: string[],
  cookingSkill: CookingSkill,
  avoidDishIds: string[] = []
): Promise<DishCatalogItem[]> {
  const catalog = await getCatalog();
  
  if (catalog === MOCK_DISH_CATALOG) {
    return filterMockDishes(slot, cuisines, allergens, cookingSkill, avoidDishIds);
  }

  const complexityOrder: CookingSkill[] = ['beginner', 'comfortable', 'advanced'];
  const maxComplexityIndex = complexityOrder.indexOf(cookingSkill);

  return catalog.filter((dish) => {
    if (!dish.active) return false;
    if (!dish.meal_slots.includes(slot)) return false;
    if (!dish.cuisines.some((c) => cuisines.includes(c))) return false;
    if (dish.allergens.some((a) => allergens.includes(a.toLowerCase()))) return false;
    if (complexityOrder.indexOf(dish.prep_complexity) > maxComplexityIndex) return false;
    if (avoidDishIds.includes(dish.dish_id)) return false;
    return true;
  });
}

async function getDishByIdFromCatalog(dishId: string): Promise<DishCatalogItem | undefined> {
  const catalog = await getCatalog();
  return catalog.find((d) => d.dish_id === dishId);
}

function calculateDailyKcalTarget(profile: Partial<UserProfile>): number {
  const weight = profile.weight_kg || 70;
  const height = profile.height_cm || 170;
  const age = profile.age || 30;
  const gender = profile.gender || 'male';

  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
  };

  const tdee = bmr * (activityMultipliers[profile.activity || 'sedentary']);

  const goalAdjustments = {
    weight_loss: -500,
    muscle_gain: 300,
    maintenance: 0,
    healthy_lifestyle: -200,
    other: 0,
  };

  const target = tdee + (goalAdjustments[profile.goal || 'healthy_lifestyle']);
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
  dayIndex: number,
  weekStartDate: Date,
  profile: Partial<UserProfile>,
  usedDishIds: Set<string>,
  mode: PlanMode
): Promise<DayPlan> {
  const date = new Date(weekStartDate);
  date.setDate(date.getDate() + dayIndex);
  const dateStr = date.toISOString().split('T')[0];

  const cuisines = profile.cuisines || ['indian_general'];
  const allergens = profile.allergens || [];
  const skill = profile.cooking_skill || 'comfortable';

  const meals: MealItem[] = [];

  for (const slot of MEAL_SLOTS) {
    let availableDishes = await filterDishesForUserFromCatalog(
      slot,
      cuisines as CuisineType[],
      allergens,
      skill,
      Array.from(usedDishIds)
    );

    if (mode === 'limited') {
      availableDishes = availableDishes.filter(
        (d) => d.prep_complexity === 'beginner' || d.prep_complexity === 'comfortable'
      );
    }

    if (availableDishes.length === 0) {
      availableDishes = await filterDishesForUserFromCatalog(slot, cuisines as CuisineType[], allergens, skill, []);
    }

    const catalog = await getCatalog();
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
        cuisine: dish.cuisines[0] as CuisineType,
        status: 'planned' as MealStatus,
        prep_minutes: dish.prep_minutes,
        photo_url: dish.photo_url,
      });
    } else {
      meals.push({
        slot,
        dish_id: 'default_' + slot,
        name: 'Balanced ' + slot.charAt(0).toUpperCase() + slot.slice(1),
        kcal: 300,
        cuisine: 'indian_general' as CuisineType,
        status: 'planned' as MealStatus,
      });
    }
  }

  return {
    date: dateStr,
    day_index: dayIndex,
    flags: {
      cheat: false,
      festive: false,
      festive_label: null,
    },
    meals,
  };
}

export async function generateWeeklyPlan(
  profile: Partial<UserProfile>
): Promise<WeeklyPlan> {
  await new Promise((resolve) => setTimeout(resolve, 3000 + Math.random() * 2000));

  const planId = uuidv4();
  const userId = profile.user_id || uuidv4();
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString().split('T')[0];

  const hasMedical = (profile.medical_conditions?.length || 0) > 0;
  const disclaimerAcked = profile.medical_disclaimer_acked || false;
  const mode: PlanMode = hasMedical && !disclaimerAcked ? 'limited' : 'full';

  const dailyKcalTarget = calculateDailyKcalTarget(profile);
  const usedDishIds = new Set<string>();

  const days: DayPlan[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(await generateDayPlan(i, weekStart, profile, usedDishIds, mode));
  }

  const proteinTarget = profile.goal === 'muscle_gain'
    ? [Math.round(dailyKcalTarget * 0.25 / 4), Math.round(dailyKcalTarget * 0.35 / 4)]
    : [Math.round(dailyKcalTarget * 0.15 / 4), Math.round(dailyKcalTarget * 0.25 / 4)];

  const plan: WeeklyPlan = {
    plan_id: planId,
    user_id: userId,
    week_start: weekStartStr,
    catalog_version: 1,
    mode,
    daily_kcal_target: dailyKcalTarget,
    macro_bands: {
      protein_g: proteinTarget as [number, number],
      carbs_g: [
        Math.round(dailyKcalTarget * 0.45 / 4),
        Math.round(dailyKcalTarget * 0.55 / 4),
      ],
      fat_g: [
        Math.round(dailyKcalTarget * 0.2 / 9),
        Math.round(dailyKcalTarget * 0.35 / 9),
      ],
    },
    days,
    generated_at: new Date().toISOString(),
    generator: 'static_kb_v1',
  };

  if (shouldPersistToSupabase(userId)) {
    try {
      await repositories.saveWeeklyPlan(plan);
    } catch (e) {
      console.warn('Failed to persist plan to Supabase:', e);
    }
  }

  return plan;
}

export async function swapMeal(
  plan: WeeklyPlan,
  date: string,
  slot: MealSlot,
  profile: Partial<UserProfile>,
  avoidDishIds: string[] = []
): Promise<WeeklyPlan> {
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));

  const dayIndex = plan.days.findIndex((d) => d.date === date);
  if (dayIndex === -1) throw new Error('Day not found');

  const currentDish = plan.days[dayIndex].meals.find((m) => m.slot === slot);
  const currentDishId = currentDish?.dish_id || '';

  const allAvoid = [...avoidDishIds, currentDishId];
  const planDishIds = plan.days
    .flatMap((d) => d.meals.map((m) => m.dish_id))
    .filter((id) => id !== currentDishId);

  const cuisines = profile.cuisines || ['indian_general'];
  const allergens = profile.allergens || [];
  const skill = profile.cooking_skill || 'comfortable';

  let availableDishes = await filterDishesForUserFromCatalog(
    slot,
    cuisines as CuisineType[],
    allergens,
    skill,
    allAvoid
  );

  availableDishes = availableDishes.filter((d) => !planDishIds.includes(d.dish_id));

  if (availableDishes.length === 0) {
    availableDishes = await filterDishesForUserFromCatalog(slot, cuisines as CuisineType[], allergens, skill, allAvoid);
  }

  const catalog = await getCatalog();
  if (availableDishes.length === 0) {
    availableDishes = catalog.filter(
      (d) => d.meal_slots.includes(slot) && d.active && d.dish_id !== currentDishId
    );
  }

  const newDish = availableDishes[Math.floor(Math.random() * availableDishes.length)];

  if (!newDish) {
    throw new Error('No alternative dish available');
  }

  const updatedPlan = { ...plan };
  updatedPlan.days = plan.days.map((day, idx) => {
    if (idx !== dayIndex) return day;

    return {
      ...day,
      meals: day.meals.map((meal) => {
        if (meal.slot !== slot) return meal;
        return {
          ...meal,
          dish_id: newDish.dish_id,
          name: newDish.name,
          kcal: newDish.kcal,
          cuisine: newDish.cuisines[0] as CuisineType,
          status: 'swapped' as MealStatus,
          prep_minutes: newDish.prep_minutes,
          photo_url: newDish.photo_url,
        };
      }),
    };
  });

  if (shouldPersistToSupabase(plan.user_id)) {
    try {
      await repositories.replaceMealOnPlan(plan.plan_id, date, slot, {
        dish_id: newDish.dish_id,
        name: newDish.name,
        kcal: newDish.kcal,
        cuisine: newDish.cuisines[0] as CuisineType,
        prep_minutes: newDish.prep_minutes,
        photo_url: newDish.photo_url,
      });
    } catch (e) {
      console.warn('Failed to persist meal swap to Supabase:', e);
    }
  }

  return updatedPlan;
}

export async function dislikeMeal(
  plan: WeeklyPlan,
  date: string,
  slot: MealSlot,
  profile: Partial<UserProfile>,
  userAvoidanceList: string[]
): Promise<{ plan: WeeklyPlan; addedToAvoidance: string }> {
  const dayIndex = plan.days.findIndex((d) => d.date === date);
  if (dayIndex === -1) throw new Error('Day not found');

  const currentMeal = plan.days[dayIndex].meals.find((m) => m.slot === slot);
  if (!currentMeal) throw new Error('Meal not found');

  const addedToAvoidance = currentMeal.dish_id;

  if (shouldPersistToSupabase(plan.user_id)) {
    try {
      await repositories.addAvoidance(plan.user_id, addedToAvoidance, 'disliked');
    } catch (e) {
      console.warn('Failed to persist avoidance to Supabase:', e);
    }
  }

  const updatedPlan = await swapMeal(
    plan,
    date,
    slot,
    profile,
    [...userAvoidanceList, addedToAvoidance]
  );

  return { plan: updatedPlan, addedToAvoidance };
}

export async function regenerateDay(
  plan: WeeklyPlan,
  date: string,
  profile: Partial<UserProfile>
): Promise<WeeklyPlan> {
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

  const dayIndex = plan.days.findIndex((d) => d.date === date);
  if (dayIndex === -1) throw new Error('Day not found');

  const otherDaysDishIds = plan.days
    .filter((_, idx) => Math.abs(idx - dayIndex) <= 1 && idx !== dayIndex)
    .flatMap((d) => d.meals.map((m) => m.dish_id));

  const usedDishIds = new Set(otherDaysDishIds);
  const weekStart = new Date(plan.week_start);

  const hasMedical = (profile.medical_conditions?.length || 0) > 0;
  const disclaimerAcked = profile.medical_disclaimer_acked || false;
  const mode: PlanMode = hasMedical && !disclaimerAcked ? 'limited' : 'full';

  const newDay = await generateDayPlan(dayIndex, weekStart, profile, usedDishIds, mode);
  newDay.flags = plan.days[dayIndex].flags;

  const updatedPlan = { ...plan };
  updatedPlan.days = plan.days.map((day, idx) => (idx === dayIndex ? newDay : day));

  if (shouldPersistToSupabase(plan.user_id)) {
    try {
      for (const meal of newDay.meals) {
        await repositories.replaceMealOnPlan(plan.plan_id, date, meal.slot, {
          dish_id: meal.dish_id,
          name: meal.name,
          kcal: meal.kcal,
          cuisine: meal.cuisine,
          prep_minutes: meal.prep_minutes,
          photo_url: meal.photo_url,
        });
      }
    } catch (e) {
      console.warn('Failed to persist regenerated day to Supabase:', e);
    }
  }

  return updatedPlan;
}

export async function setDayFlags(
  plan: WeeklyPlan,
  date: string,
  flags: Partial<{ cheat: boolean; festive: boolean; festive_label: string | null }>
): Promise<WeeklyPlan> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const dayIndex = plan.days.findIndex((d) => d.date === date);
  if (dayIndex === -1) throw new Error('Day not found');

  const updatedPlan = { ...plan };
  updatedPlan.days = plan.days.map((day, idx) => {
    if (idx !== dayIndex) return day;
    return {
      ...day,
      flags: {
        ...day.flags,
        ...flags,
      },
    };
  });

  if (shouldPersistToSupabase(plan.user_id)) {
    try {
      await repositories.updateDayFlags(plan.plan_id, date, flags);
    } catch (e) {
      console.warn('Failed to persist day flags to Supabase:', e);
    }
  }

  return updatedPlan;
}

export async function logMealStatus(
  plan: WeeklyPlan,
  date: string,
  slot: MealSlot,
  status: MealStatus
): Promise<WeeklyPlan> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const dayIndex = plan.days.findIndex((d) => d.date === date);
  if (dayIndex === -1) throw new Error('Day not found');

  const updatedPlan = { ...plan };
  updatedPlan.days = plan.days.map((day, idx) => {
    if (idx !== dayIndex) return day;
    return {
      ...day,
      meals: day.meals.map((meal) => {
        if (meal.slot !== slot) return meal;
        return { ...meal, status };
      }),
    };
  });

  if (shouldPersistToSupabase(plan.user_id)) {
    try {
      await repositories.updateMealStatus(plan.plan_id, date, slot, status);
    } catch (e) {
      console.warn('Failed to persist meal status to Supabase:', e);
    }
  }

  return updatedPlan;
}

export async function getAvoidanceList(userId: string): Promise<string[]> {
  if (shouldPersistToSupabase(userId)) {
    try {
      return await repositories.listAvoidedDishIds(userId);
    } catch (e) {
      console.warn('Failed to fetch avoidance list from Supabase:', e);
    }
  }
  return [];
}

export async function getLatestPlan(userId: string): Promise<WeeklyPlan | null> {
  if (shouldPersistToSupabase(userId)) {
    try {
      return await repositories.getLatestPlan(userId);
    } catch (e) {
      console.warn('Failed to fetch latest plan from Supabase:', e);
    }
  }
  return null;
}

export { getDishByIdFromCatalog as getDishById, getCatalog as getDishCatalog };
