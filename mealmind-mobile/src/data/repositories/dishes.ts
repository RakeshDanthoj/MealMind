import { supabase } from '../../lib/supabase';
import { DishCatalogItem, MealSlot, CuisineType, CookingSkill } from '../../types';
import { DishCatalogRow } from '../../types/database';
import { dishRowToDishCatalogItem } from '../mappers';

export async function listActiveDishes(): Promise<DishCatalogItem[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('dish_catalog')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch dishes: ${error.message}`);
  }

  return (data as DishCatalogRow[]).map(dishRowToDishCatalogItem);
}

export async function getDishById(dishId: string): Promise<DishCatalogItem | null> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('dish_catalog')
    .select('*')
    .eq('dish_id', dishId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch dish: ${error.message}`);
  }

  return dishRowToDishCatalogItem(data as DishCatalogRow);
}

export async function getDishesBySlot(slot: MealSlot): Promise<DishCatalogItem[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('dish_catalog')
    .select('*')
    .eq('active', true)
    .contains('meal_slots', [slot]);

  if (error) {
    throw new Error(`Failed to fetch dishes by slot: ${error.message}`);
  }

  return (data as DishCatalogRow[]).map(dishRowToDishCatalogItem);
}

export async function filterDishes(
  slot: MealSlot,
  cuisines: CuisineType[],
  allergens: string[],
  cookingSkill: CookingSkill,
  avoidDishIds: string[] = []
): Promise<DishCatalogItem[]> {
  if (!supabase) {
    return [];
  }

  const complexityOrder: CookingSkill[] = ['beginner', 'comfortable', 'advanced'];
  const maxComplexityIndex = complexityOrder.indexOf(cookingSkill);
  const allowedComplexities = complexityOrder.slice(0, maxComplexityIndex + 1);

  let query = supabase
    .from('dish_catalog')
    .select('*')
    .eq('active', true)
    .contains('meal_slots', [slot])
    .overlaps('cuisines', cuisines)
    .in('prep_complexity', allowedComplexities);

  if (avoidDishIds.length > 0) {
    query = query.not('dish_id', 'in', `(${avoidDishIds.join(',')})`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to filter dishes: ${error.message}`);
  }

  const dishes = (data as DishCatalogRow[]).map(dishRowToDishCatalogItem);

  return dishes.filter((dish) => {
    const hasAllergen = dish.allergens.some((a) =>
      allergens.includes(a.toLowerCase())
    );
    return !hasAllergen;
  });
}
