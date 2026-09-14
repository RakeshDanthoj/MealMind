import { generateUUID } from '../utils/uuid';
import {
  WeeklyPlan,
  UserProfile,
  DayPlan,
  MealItem,
  MealSlot,
  CuisineType,
  MealStatus,
  PlanMode,
} from '../types';
import { filterDishesForUser, getDishById, MOCK_DISH_CATALOG } from './mock-catalog';

const MEAL_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'snack', 'dinner'];

const SLOT_KCAL_TARGETS: Record<MealSlot, { min: number; max: number }> = {
  breakfast: { min: 280, max: 450 },
  lunch: { min: 400, max: 600 },
  snack: { min: 100, max: 250 },
  dinner: { min: 350, max: 550 },
};

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
  dishes: ReturnType<typeof filterDishesForUser>,
  usedDishIds: Set<string>
): ReturnType<typeof getDishById> {
  const available = dishes.filter(d => !usedDishIds.has(d.dish_id));
  if (available.length === 0) {
    return dishes[Math.floor(Math.random() * dishes.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}

function generateDayPlan(
  dayIndex: number,
  weekStartDate: Date,
  profile: Partial<UserProfile>,
  usedDishIds: Set<string>,
  mode: PlanMode
): DayPlan {
  const date = new Date(weekStartDate);
  date.setDate(date.getDate() + dayIndex);
  const dateStr = date.toISOString().split('T')[0];

  const cuisines = profile.cuisines || ['indian_general'];
  const allergens = profile.allergens || [];
  const skill = profile.cooking_skill || 'comfortable';

  const meals: MealItem[] = MEAL_SLOTS.map(slot => {
    let availableDishes = filterDishesForUser(
      slot,
      cuisines as CuisineType[],
      allergens,
      skill,
      Array.from(usedDishIds)
    );

    if (mode === 'limited') {
      availableDishes = availableDishes.filter(
        d => d.prep_complexity === 'beginner' || d.prep_complexity === 'comfortable'
      );
    }

    if (availableDishes.length === 0) {
      availableDishes = filterDishesForUser(slot, cuisines as CuisineType[], allergens, skill, []);
    }

    if (availableDishes.length === 0) {
      availableDishes = MOCK_DISH_CATALOG.filter(d => d.meal_slots.includes(slot) && d.active);
    }

    const dish = pickRandomDish(availableDishes, usedDishIds);

    if (dish) {
      usedDishIds.add(dish.dish_id);
      return {
        slot,
        dish_id: dish.dish_id,
        name: dish.name,
        kcal: dish.kcal,
        cuisine: dish.cuisines[0] as CuisineType,
        status: 'planned' as MealStatus,
        prep_minutes: dish.prep_minutes,
        photo_url: dish.photo_url,
      };
    }

    return {
      slot,
      dish_id: 'default_' + slot,
      name: 'Balanced ' + slot.charAt(0).toUpperCase() + slot.slice(1),
      kcal: SLOT_KCAL_TARGETS[slot].min,
      cuisine: 'indian_general' as CuisineType,
      status: 'planned' as MealStatus,
    };
  });

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
  await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));

  const planId = generateUUID();
  const userId = profile.user_id || generateUUID();
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
    days.push(generateDayPlan(i, weekStart, profile, usedDishIds, mode));
  }

  const proteinTarget = profile.goal === 'muscle_gain' 
    ? [Math.round(dailyKcalTarget * 0.25 / 4), Math.round(dailyKcalTarget * 0.35 / 4)]
    : [Math.round(dailyKcalTarget * 0.15 / 4), Math.round(dailyKcalTarget * 0.25 / 4)];

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
}

export async function swapMeal(
  plan: WeeklyPlan,
  date: string,
  slot: MealSlot,
  profile: Partial<UserProfile>,
  avoidDishIds: string[] = []
): Promise<WeeklyPlan> {
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

  const dayIndex = plan.days.findIndex(d => d.date === date);
  if (dayIndex === -1) throw new Error('Day not found');

  const currentDish = plan.days[dayIndex].meals.find(m => m.slot === slot);
  const currentDishId = currentDish?.dish_id || '';

  const allAvoid = [...avoidDishIds, currentDishId];
  const planDishIds = plan.days
    .flatMap(d => d.meals.map(m => m.dish_id))
    .filter(id => id !== currentDishId);

  const cuisines = profile.cuisines || ['indian_general'];
  const allergens = profile.allergens || [];
  const skill = profile.cooking_skill || 'comfortable';

  let availableDishes = filterDishesForUser(
    slot,
    cuisines as CuisineType[],
    allergens,
    skill,
    allAvoid
  );

  availableDishes = availableDishes.filter(d => !planDishIds.includes(d.dish_id));

  if (availableDishes.length === 0) {
    availableDishes = filterDishesForUser(slot, cuisines as CuisineType[], allergens, skill, allAvoid);
  }

  if (availableDishes.length === 0) {
    availableDishes = MOCK_DISH_CATALOG.filter(
      d => d.meal_slots.includes(slot) && d.active && d.dish_id !== currentDishId
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
      meals: day.meals.map(meal => {
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

  return updatedPlan;
}

export async function dislikeMeal(
  plan: WeeklyPlan,
  date: string,
  slot: MealSlot,
  profile: Partial<UserProfile>,
  userAvoidanceList: string[]
): Promise<{ plan: WeeklyPlan; addedToAvoidance: string }> {
  const dayIndex = plan.days.findIndex(d => d.date === date);
  if (dayIndex === -1) throw new Error('Day not found');

  const currentMeal = plan.days[dayIndex].meals.find(m => m.slot === slot);
  if (!currentMeal) throw new Error('Meal not found');

  const addedToAvoidance = currentMeal.dish_id;

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
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

  const dayIndex = plan.days.findIndex(d => d.date === date);
  if (dayIndex === -1) throw new Error('Day not found');

  const otherDaysDishIds = plan.days
    .filter((_, idx) => Math.abs(idx - dayIndex) <= 1 && idx !== dayIndex)
    .flatMap(d => d.meals.map(m => m.dish_id));

  const usedDishIds = new Set(otherDaysDishIds);
  const weekStart = new Date(plan.week_start);

  const hasMedical = (profile.medical_conditions?.length || 0) > 0;
  const disclaimerAcked = profile.medical_disclaimer_acked || false;
  const mode: PlanMode = hasMedical && !disclaimerAcked ? 'limited' : 'full';

  const newDay = generateDayPlan(dayIndex, weekStart, profile, usedDishIds, mode);
  newDay.flags = plan.days[dayIndex].flags;

  const updatedPlan = { ...plan };
  updatedPlan.days = plan.days.map((day, idx) => (idx === dayIndex ? newDay : day));

  return updatedPlan;
}

export async function setDayFlags(
  plan: WeeklyPlan,
  date: string,
  flags: Partial<{ cheat: boolean; festive: boolean; festive_label: string | null }>
): Promise<WeeklyPlan> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const dayIndex = plan.days.findIndex(d => d.date === date);
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

  return updatedPlan;
}

export async function logMealStatus(
  plan: WeeklyPlan,
  date: string,
  slot: MealSlot,
  status: MealStatus
): Promise<WeeklyPlan> {
  await new Promise(resolve => setTimeout(resolve, 200));

  const dayIndex = plan.days.findIndex(d => d.date === date);
  if (dayIndex === -1) throw new Error('Day not found');

  const updatedPlan = { ...plan };
  updatedPlan.days = plan.days.map((day, idx) => {
    if (idx !== dayIndex) return day;
    return {
      ...day,
      meals: day.meals.map(meal => {
        if (meal.slot !== slot) return meal;
        return { ...meal, status };
      }),
    };
  });

  return updatedPlan;
}
