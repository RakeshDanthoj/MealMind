import { supabase } from '../../lib/supabase';
import { UserDishAvoidanceRow } from '../../types/database';

export async function listAvoidedDishIds(userId: string): Promise<string[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('user_dish_avoidance')
    .select('dish_id')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to fetch avoidance list: ${error.message}`);
  }

  return (data as Pick<UserDishAvoidanceRow, 'dish_id'>[]).map((row) => row.dish_id);
}

export async function addAvoidance(
  userId: string,
  dishId: string,
  reason?: string
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase
    .from('user_dish_avoidance')
    .upsert(
      {
        user_id: userId,
        dish_id: dishId,
        reason: reason ?? null,
      },
      { onConflict: 'user_id,dish_id' }
    );

  if (error) {
    throw new Error(`Failed to add avoidance: ${error.message}`);
  }
}

export async function removeAvoidance(
  userId: string,
  dishId: string
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase
    .from('user_dish_avoidance')
    .delete()
    .eq('user_id', userId)
    .eq('dish_id', dishId);

  if (error) {
    throw new Error(`Failed to remove avoidance: ${error.message}`);
  }
}

export async function listAvoidedDishes(userId: string): Promise<UserDishAvoidanceRow[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('user_dish_avoidance')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch avoidance list: ${error.message}`);
  }

  return data as UserDishAvoidanceRow[];
}
