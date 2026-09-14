import { supabase } from '../../lib/supabase';
import { WeeklyPlan, MealSlot, MealStatus, DayFlags, MealItem, CuisineType } from '../../types';
import {
  WeeklyPlanRow,
  PlanDayRow,
  PlanMealRow,
  PlanDayUpdate,
  PlanMealUpdate,
} from '../../types/database';
import { weeklyPlanGraphToWeeklyPlan, weeklyPlanToInserts } from '../mappers';

interface PlanDayWithMeals extends PlanDayRow {
  plan_meals: PlanMealRow[];
}

interface WeeklyPlanGraph extends WeeklyPlanRow {
  plan_days: PlanDayWithMeals[];
}

export async function getLatestPlan(userId: string): Promise<WeeklyPlan | null> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('weekly_plans')
    .select(`
      *,
      plan_days (
        *,
        plan_meals (*)
      )
    `)
    .eq('user_id', userId)
    .order('week_start', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch latest plan: ${error.message}`);
  }

  return weeklyPlanGraphToWeeklyPlan(data as WeeklyPlanGraph);
}

export async function getPlanById(planId: string): Promise<WeeklyPlan | null> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('weekly_plans')
    .select(`
      *,
      plan_days (
        *,
        plan_meals (*)
      )
    `)
    .eq('plan_id', planId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch plan: ${error.message}`);
  }

  return weeklyPlanGraphToWeeklyPlan(data as WeeklyPlanGraph);
}

export async function saveWeeklyPlan(plan: WeeklyPlan): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const inserts = weeklyPlanToInserts(plan);

  const { error: planError } = await supabase
    .from('weekly_plans')
    .insert(inserts.plan);

  if (planError) {
    throw new Error(`Failed to save weekly plan: ${planError.message}`);
  }

  if (inserts.days.length > 0) {
    const { error: daysError } = await supabase
      .from('plan_days')
      .insert(inserts.days);

    if (daysError) {
      await supabase.from('weekly_plans').delete().eq('plan_id', plan.plan_id);
      throw new Error(`Failed to save plan days: ${daysError.message}`);
    }
  }

  const mealInserts = inserts.meals.map((m) => m.meal);
  if (mealInserts.length > 0) {
    const { error: mealsError } = await supabase
      .from('plan_meals')
      .insert(mealInserts);

    if (mealsError) {
      await supabase.from('plan_days').delete().eq('plan_id', plan.plan_id);
      await supabase.from('weekly_plans').delete().eq('plan_id', plan.plan_id);
      throw new Error(`Failed to save plan meals: ${mealsError.message}`);
    }
  }
}

export async function updateMealStatus(
  planId: string,
  date: string,
  slot: MealSlot,
  status: MealStatus
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data: dayData, error: dayError } = await supabase
    .from('plan_days')
    .select('id')
    .eq('plan_id', planId)
    .eq('date', date)
    .single();

  if (dayError) {
    throw new Error(`Failed to find plan day: ${dayError.message}`);
  }

  const { error: mealError } = await supabase
    .from('plan_meals')
    .update({ status } as PlanMealUpdate)
    .eq('plan_day_id', dayData.id)
    .eq('slot', slot);

  if (mealError) {
    throw new Error(`Failed to update meal status: ${mealError.message}`);
  }
}

export async function updateDayFlags(
  planId: string,
  date: string,
  flags: Partial<DayFlags>
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const update: PlanDayUpdate = {};
  if (flags.cheat !== undefined) update.cheat = flags.cheat;
  if (flags.festive !== undefined) update.festive = flags.festive;
  if (flags.festive_label !== undefined) update.festive_label = flags.festive_label;

  const { error } = await supabase
    .from('plan_days')
    .update(update)
    .eq('plan_id', planId)
    .eq('date', date);

  if (error) {
    throw new Error(`Failed to update day flags: ${error.message}`);
  }
}

export async function replaceMealOnPlan(
  planId: string,
  date: string,
  slot: MealSlot,
  newMeal: {
    dish_id: string;
    name: string;
    kcal: number;
    cuisine: CuisineType;
    prep_minutes?: number;
    photo_url?: string | null;
  }
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data: dayData, error: dayError } = await supabase
    .from('plan_days')
    .select('id')
    .eq('plan_id', planId)
    .eq('date', date)
    .single();

  if (dayError) {
    throw new Error(`Failed to find plan day: ${dayError.message}`);
  }

  const mealUpdate: PlanMealUpdate = {
    dish_id: newMeal.dish_id,
    name: newMeal.name,
    kcal: newMeal.kcal,
    cuisine: newMeal.cuisine,
    status: 'swapped',
    prep_minutes: newMeal.prep_minutes ?? null,
    photo_url: newMeal.photo_url ?? null,
  };

  const { error: mealError } = await supabase
    .from('plan_meals')
    .update(mealUpdate)
    .eq('plan_day_id', dayData.id)
    .eq('slot', slot);

  if (mealError) {
    throw new Error(`Failed to replace meal: ${mealError.message}`);
  }
}

export async function deletePlan(planId: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data: days } = await supabase
    .from('plan_days')
    .select('id')
    .eq('plan_id', planId);

  if (days && days.length > 0) {
    const dayIds = days.map((d) => d.id);
    await supabase.from('plan_meals').delete().in('plan_day_id', dayIds);
  }

  await supabase.from('plan_days').delete().eq('plan_id', planId);
  await supabase.from('weekly_plans').delete().eq('plan_id', planId);
}
