import {
  UserProfile,
  WeeklyPlan,
  DayPlan,
  MealItem,
  DishCatalogItem,
  PrimaryGoal,
  DailyRoutine,
  Gender,
  ActivityLevel,
  CookingSkill,
  CuisineType,
  MealSlot,
  MealStatus,
  PlanMode,
} from '../types';
import { generateUUID } from '../utils/uuid';
import {
  ProfileRow,
  ProfileUpdate,
  DishCatalogRow,
  WeeklyPlanRow,
  WeeklyPlanInsert,
  PlanDayRow,
  PlanDayInsert,
  PlanMealRow,
  PlanMealInsert,
} from '../types/database';

export function profileRowToUserProfile(row: ProfileRow): UserProfile {
  return {
    user_id: row.id,
    goal: (row.goal as PrimaryGoal) || 'healthy_lifestyle',
    routine: (row.routine as DailyRoutine) || 'some_time',
    age: row.age || 30,
    gender: (row.gender as Gender) || 'prefer_not_to_say',
    height_cm: row.height_cm || 170,
    weight_kg: row.weight_kg || 70,
    activity: (row.activity as ActivityLevel) || 'moderately_active',
    medical_conditions: row.medical_conditions || [],
    medical_disclaimer_acked: row.medical_disclaimer_acked,
    cooking_skill: (row.cooking_skill as CookingSkill) || 'comfortable',
    cuisines: (row.cuisines as CuisineType[]) || ['indian_general'],
    allergens: row.allergens || [],
    privacy_consent_given: row.privacy_consent_given,
    onboarding_completed: row.onboarding_completed,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function userProfileToProfileUpdate(profile: Partial<UserProfile>): ProfileUpdate {
  const update: ProfileUpdate = {};

  if (profile.goal !== undefined) update.goal = profile.goal;
  if (profile.routine !== undefined) update.routine = profile.routine;
  if (profile.age !== undefined) update.age = profile.age;
  if (profile.gender !== undefined) update.gender = profile.gender;
  if (profile.height_cm !== undefined) update.height_cm = profile.height_cm;
  if (profile.weight_kg !== undefined) update.weight_kg = profile.weight_kg;
  if (profile.activity !== undefined) update.activity = profile.activity;
  if (profile.medical_conditions !== undefined) update.medical_conditions = profile.medical_conditions;
  if (profile.medical_disclaimer_acked !== undefined) update.medical_disclaimer_acked = profile.medical_disclaimer_acked;
  if (profile.cooking_skill !== undefined) update.cooking_skill = profile.cooking_skill;
  if (profile.cuisines !== undefined) update.cuisines = profile.cuisines;
  if (profile.allergens !== undefined) update.allergens = profile.allergens;
  if (profile.privacy_consent_given !== undefined) update.privacy_consent_given = profile.privacy_consent_given;
  if (profile.onboarding_completed !== undefined) update.onboarding_completed = profile.onboarding_completed;

  update.updated_at = new Date().toISOString();

  return update;
}

export function dishRowToDishCatalogItem(row: DishCatalogRow): DishCatalogItem {
  return {
    dish_id: row.dish_id,
    name: row.name,
    cuisines: row.cuisines as CuisineType[],
    meal_slots: row.meal_slots as MealSlot[],
    ingredients: row.ingredients,
    allergens: row.allergens,
    diet_tags: row.diet_tags,
    prep_complexity: row.prep_complexity as CookingSkill,
    prep_minutes: row.prep_minutes,
    kcal: row.kcal,
    protein_g: row.protein_g,
    carbs_g: row.carbs_g,
    fat_g: row.fat_g,
    cheat_suitable: row.cheat_suitable,
    festive_tags: row.festive_tags,
    photo_url: row.photo_url,
    recipe_preview: row.recipe_preview,
    recipe_steps_ref: row.recipe_steps_ref,
    active: row.active,
    dietician_reviewed: row.dietician_reviewed,
    version: row.version,
  };
}

interface PlanDayWithMeals extends PlanDayRow {
  plan_meals: PlanMealRow[];
}

interface WeeklyPlanGraph extends WeeklyPlanRow {
  plan_days: PlanDayWithMeals[];
}

export function weeklyPlanGraphToWeeklyPlan(graph: WeeklyPlanGraph): WeeklyPlan {
  const sortedDays = [...graph.plan_days].sort((a, b) => a.day_index - b.day_index);

  const days: DayPlan[] = sortedDays.map((dayRow) => {
    const meals: MealItem[] = dayRow.plan_meals.map((mealRow) => ({
      slot: mealRow.slot as MealSlot,
      dish_id: mealRow.dish_id,
      name: mealRow.name,
      kcal: mealRow.kcal,
      cuisine: mealRow.cuisine as CuisineType,
      status: mealRow.status as MealStatus,
      prep_minutes: mealRow.prep_minutes ?? undefined,
      photo_url: mealRow.photo_url,
    }));

    return {
      date: dayRow.date,
      day_index: dayRow.day_index,
      flags: {
        cheat: dayRow.cheat,
        festive: dayRow.festive,
        festive_label: dayRow.festive_label,
      },
      meals,
    };
  });

  return {
    plan_id: graph.plan_id,
    user_id: graph.user_id,
    week_start: graph.week_start,
    catalog_version: graph.catalog_version,
    mode: graph.mode as PlanMode,
    daily_kcal_target: graph.daily_kcal_target,
    macro_bands: {
      protein_g: [graph.macro_protein_min, graph.macro_protein_max],
      carbs_g: [graph.macro_carbs_min, graph.macro_carbs_max],
      fat_g: [graph.macro_fat_min, graph.macro_fat_max],
    },
    days,
    generated_at: graph.generated_at,
    generator: graph.generator,
  };
}

interface WeeklyPlanInserts {
  plan: WeeklyPlanInsert;
  days: PlanDayInsert[];
  meals: { dayIndex: number; meal: PlanMealInsert }[];
}

export function weeklyPlanToInserts(plan: WeeklyPlan): WeeklyPlanInserts {
  const planInsert: WeeklyPlanInsert = {
    plan_id: plan.plan_id,
    user_id: plan.user_id,
    week_start: plan.week_start,
    catalog_version: plan.catalog_version,
    mode: plan.mode,
    daily_kcal_target: plan.daily_kcal_target,
    macro_protein_min: plan.macro_bands.protein_g[0],
    macro_protein_max: plan.macro_bands.protein_g[1],
    macro_carbs_min: plan.macro_bands.carbs_g[0],
    macro_carbs_max: plan.macro_bands.carbs_g[1],
    macro_fat_min: plan.macro_bands.fat_g[0],
    macro_fat_max: plan.macro_bands.fat_g[1],
    generated_at: plan.generated_at,
    generator: plan.generator,
  };

  const dayInserts: PlanDayInsert[] = [];
  const mealInserts: { dayIndex: number; meal: PlanMealInsert }[] = [];

  plan.days.forEach((day, dayIndex) => {
    const dayId = generateUUID();

    dayInserts.push({
      id: dayId,
      plan_id: plan.plan_id,
      date: day.date,
      day_index: day.day_index,
      cheat: day.flags.cheat,
      festive: day.flags.festive,
      festive_label: day.flags.festive_label,
    });

    day.meals.forEach((meal) => {
      mealInserts.push({
        dayIndex,
        meal: {
          id: generateUUID(),
          plan_day_id: dayId,
          slot: meal.slot,
          dish_id: meal.dish_id,
          name: meal.name,
          kcal: meal.kcal,
          cuisine: meal.cuisine,
          status: meal.status,
          prep_minutes: meal.prep_minutes ?? null,
          photo_url: meal.photo_url ?? null,
        },
      });
    });
  });

  return {
    plan: planInsert,
    days: dayInserts,
    meals: mealInserts,
  };
}

export function mealRowToMealItem(row: PlanMealRow): MealItem {
  return {
    slot: row.slot as MealSlot,
    dish_id: row.dish_id,
    name: row.name,
    kcal: row.kcal,
    cuisine: row.cuisine as CuisineType,
    status: row.status as MealStatus,
    prep_minutes: row.prep_minutes ?? undefined,
    photo_url: row.photo_url,
  };
}

export function dayRowToDayPlan(row: PlanDayRow, meals: MealItem[]): DayPlan {
  return {
    date: row.date,
    day_index: row.day_index,
    flags: {
      cheat: row.cheat,
      festive: row.festive,
      festive_label: row.festive_label,
    },
    meals,
  };
}
