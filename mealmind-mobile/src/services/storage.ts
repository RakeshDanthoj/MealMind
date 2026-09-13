import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, WeeklyPlan, OnboardingState, AuthState } from '../types';

const KEYS = {
  AUTH: '@mealmind/auth',
  PROFILE: '@mealmind/profile',
  ONBOARDING: '@mealmind/onboarding',
  CURRENT_PLAN: '@mealmind/current_plan',
  AVOIDANCE_LIST: '@mealmind/avoidance',
  FIRST_PLAN_VIEWED: '@mealmind/first_plan_viewed',
  COACH_MARKS_SHOWN: '@mealmind/coach_marks',
};

async function getItem<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage setItem error:', e);
  }
}

async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error('Storage removeItem error:', e);
  }
}

export const storage = {
  getAuth: () => getItem<AuthState>(KEYS.AUTH),
  setAuth: (auth: AuthState) => setItem(KEYS.AUTH, auth),
  clearAuth: () => removeItem(KEYS.AUTH),

  getProfile: () => getItem<UserProfile>(KEYS.PROFILE),
  setProfile: (profile: UserProfile) => setItem(KEYS.PROFILE, profile),
  clearProfile: () => removeItem(KEYS.PROFILE),

  getOnboarding: () => getItem<OnboardingState>(KEYS.ONBOARDING),
  setOnboarding: (state: OnboardingState) => setItem(KEYS.ONBOARDING, state),
  clearOnboarding: () => removeItem(KEYS.ONBOARDING),

  getCurrentPlan: () => getItem<WeeklyPlan>(KEYS.CURRENT_PLAN),
  setCurrentPlan: (plan: WeeklyPlan) => setItem(KEYS.CURRENT_PLAN, plan),
  clearCurrentPlan: () => removeItem(KEYS.CURRENT_PLAN),

  getAvoidanceList: () => getItem<string[]>(KEYS.AVOIDANCE_LIST),
  setAvoidanceList: (list: string[]) => setItem(KEYS.AVOIDANCE_LIST, list),
  addToAvoidanceList: async (dishId: string) => {
    const current = await getItem<string[]>(KEYS.AVOIDANCE_LIST) || [];
    if (!current.includes(dishId)) {
      current.push(dishId);
      await setItem(KEYS.AVOIDANCE_LIST, current);
    }
  },

  getFirstPlanViewed: () => getItem<boolean>(KEYS.FIRST_PLAN_VIEWED),
  setFirstPlanViewed: (viewed: boolean) => setItem(KEYS.FIRST_PLAN_VIEWED, viewed),

  getCoachMarksShown: () => getItem<string[]>(KEYS.COACH_MARKS_SHOWN),
  setCoachMarkShown: async (markId: string) => {
    const current = await getItem<string[]>(KEYS.COACH_MARKS_SHOWN) || [];
    if (!current.includes(markId)) {
      current.push(markId);
      await setItem(KEYS.COACH_MARKS_SHOWN, current);
    }
  },
  hasCoachMarkBeenShown: async (markId: string): Promise<boolean> => {
    const shown = await getItem<string[]>(KEYS.COACH_MARKS_SHOWN) || [];
    return shown.includes(markId);
  },

  clearAll: async () => {
    await Promise.all([
      removeItem(KEYS.AUTH),
      removeItem(KEYS.PROFILE),
      removeItem(KEYS.ONBOARDING),
      removeItem(KEYS.CURRENT_PLAN),
      removeItem(KEYS.AVOIDANCE_LIST),
      removeItem(KEYS.FIRST_PLAN_VIEWED),
      removeItem(KEYS.COACH_MARKS_SHOWN),
    ]);
  },
};
