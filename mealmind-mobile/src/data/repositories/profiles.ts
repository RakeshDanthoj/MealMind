import { supabase } from '../../lib/supabase';
import { UserProfile } from '../../types';
import { ProfileRow, ProfileUpdate } from '../../types/database';
import { profileRowToUserProfile, userProfileToProfileUpdate } from '../mappers';

export async function getProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  return profileRowToUserProfile(data as ProfileRow);
}

export async function upsertProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const profileUpdate: ProfileUpdate = userProfileToProfileUpdate(updates);

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      { id: userId, ...profileUpdate },
      { onConflict: 'id' }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to upsert profile: ${error.message}`);
  }

  return profileRowToUserProfile(data as ProfileRow);
}

export async function updateProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const profileUpdate = userProfileToProfileUpdate(updates);

  const { data, error } = await supabase
    .from('profiles')
    .update(profileUpdate)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  return profileRowToUserProfile(data as ProfileRow);
}
