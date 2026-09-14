import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  AuthState, 
  UserProfile, 
  WeeklyPlan, 
  OnboardingState,
  MealSlot,
  MealStatus,
} from '../types';
import { storage } from '../services/storage';
import { 
  generateWeeklyPlan, 
  swapMeal, 
  dislikeMeal, 
  regenerateDay, 
  setDayFlags, 
  logMealStatus 
} from '../services/mock-api';
import { analytics } from '../services/analytics';
import { DEV_SKIP_AUTH, DEV_SKIP_USER_ID } from '../constants';

interface AppState {
  isLoading: boolean;
  auth: AuthState;
  profile: Partial<UserProfile> | null;
  onboarding: OnboardingState;
  currentPlan: WeeklyPlan | null;
  avoidanceList: string[];
  firstPlanViewed: boolean;
  coachMarksShown: string[];
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INIT_STATE'; payload: Partial<AppState> }
  | { type: 'SET_AUTH'; payload: AuthState }
  | { type: 'SET_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'SET_ONBOARDING'; payload: OnboardingState }
  | { type: 'SET_CURRENT_PLAN'; payload: WeeklyPlan | null }
  | { type: 'SET_AVOIDANCE_LIST'; payload: string[] }
  | { type: 'ADD_TO_AVOIDANCE'; payload: string }
  | { type: 'SET_FIRST_PLAN_VIEWED'; payload: boolean }
  | { type: 'ADD_COACH_MARK_SHOWN'; payload: string }
  | { type: 'LOGOUT' };

const initialState: AppState = {
  isLoading: true,
  auth: { isAuthenticated: false, user_id: null },
  profile: null,
  onboarding: { currentStep: 1, answers: {}, completed: false },
  currentPlan: null,
  avoidanceList: [],
  firstPlanViewed: false,
  coachMarksShown: [],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'INIT_STATE':
      return { ...state, ...action.payload, isLoading: false };
    case 'SET_AUTH':
      return { ...state, auth: action.payload };
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'UPDATE_PROFILE':
      return { 
        ...state, 
        profile: state.profile ? { ...state.profile, ...action.payload } : action.payload 
      };
    case 'SET_ONBOARDING':
      return { ...state, onboarding: action.payload };
    case 'SET_CURRENT_PLAN':
      return { ...state, currentPlan: action.payload };
    case 'SET_AVOIDANCE_LIST':
      return { ...state, avoidanceList: action.payload };
    case 'ADD_TO_AVOIDANCE':
      return { 
        ...state, 
        avoidanceList: state.avoidanceList.includes(action.payload) 
          ? state.avoidanceList 
          : [...state.avoidanceList, action.payload] 
      };
    case 'SET_FIRST_PLAN_VIEWED':
      return { ...state, firstPlanViewed: action.payload };
    case 'ADD_COACH_MARK_SHOWN':
      return { 
        ...state, 
        coachMarksShown: state.coachMarksShown.includes(action.payload)
          ? state.coachMarksShown
          : [...state.coachMarksShown, action.payload]
      };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  login: (method: 'phone' | 'google' | 'apple', identifier?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateOnboarding: (step: number, answers: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  acknowledgeDisclaimer: () => Promise<void>;
  generatePlan: () => Promise<WeeklyPlan>;
  swapMealAction: (date: string, slot: MealSlot) => Promise<void>;
  dislikeMealAction: (date: string, slot: MealSlot) => Promise<void>;
  regenerateDayAction: (date: string) => Promise<void>;
  setDayFlagsAction: (date: string, flags: { cheat?: boolean; festive?: boolean; festive_label?: string | null }) => Promise<void>;
  logMealAction: (date: string, slot: MealSlot, status: MealStatus) => Promise<void>;
  markFirstPlanViewed: () => Promise<void>;
  markCoachMarkShown: (markId: string) => Promise<void>;
  hasCoachMarkBeenShown: (markId: string) => boolean;
  skipLoginDev: () => Promise<void>;
  skipToSamplePlanDev: () => Promise<WeeklyPlan>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    async function loadState() {
      try {
        const [auth, profile, onboarding, plan, avoidance, firstViewed, coachMarks] = await Promise.all([
          storage.getAuth(),
          storage.getProfile(),
          storage.getOnboarding(),
          storage.getCurrentPlan(),
          storage.getAvoidanceList(),
          storage.getFirstPlanViewed(),
          storage.getCoachMarksShown(),
        ]);

        dispatch({
          type: 'INIT_STATE',
          payload: {
            auth: auth || initialState.auth,
            profile: profile || null,
            onboarding: onboarding || initialState.onboarding,
            currentPlan: plan || null,
            avoidanceList: avoidance || [],
            firstPlanViewed: firstViewed || false,
            coachMarksShown: coachMarks || [],
          },
        });
      } catch (e) {
        console.error('Failed to load state:', e);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }

    loadState();
  }, []);

  const login = async (method: 'phone' | 'google' | 'apple', identifier?: string) => {
    const userId = uuidv4();
    const auth: AuthState = {
      isAuthenticated: true,
      user_id: userId,
      auth_method: method,
      phone: method === 'phone' ? identifier : undefined,
    };
    
    await storage.setAuth(auth);
    dispatch({ type: 'SET_AUTH', payload: auth });

    const existingOnboarding = await storage.getOnboarding();
    if (!existingOnboarding) {
      const newOnboarding: OnboardingState = {
        currentStep: 1,
        answers: { user_id: userId },
        completed: false,
      };
      await storage.setOnboarding(newOnboarding);
      dispatch({ type: 'SET_ONBOARDING', payload: newOnboarding });
    }
  };

  const logout = async () => {
    await storage.clearAll();
    dispatch({ type: 'LOGOUT' });
  };

  const updateOnboarding = async (step: number, answers: Partial<UserProfile>) => {
    const newOnboarding: OnboardingState = {
      ...state.onboarding,
      currentStep: step,
      answers: { ...state.onboarding.answers, ...answers },
    };
    
    await storage.setOnboarding(newOnboarding);
    dispatch({ type: 'SET_ONBOARDING', payload: newOnboarding });
    
    analytics.onboardingStepCompleted(step - 1, `step_${step - 1}`);
  };

  const completeOnboarding = async () => {
    const profile: UserProfile = {
      user_id: state.auth.user_id!,
      goal: state.onboarding.answers.goal || 'healthy_lifestyle',
      routine: state.onboarding.answers.routine || 'some_time',
      age: state.onboarding.answers.age || 30,
      gender: state.onboarding.answers.gender || 'prefer_not_to_say',
      height_cm: state.onboarding.answers.height_cm || 170,
      weight_kg: state.onboarding.answers.weight_kg || 70,
      activity: state.onboarding.answers.activity || 'moderately_active',
      medical_conditions: state.onboarding.answers.medical_conditions || [],
      medical_disclaimer_acked: false,
      cooking_skill: state.onboarding.answers.cooking_skill || 'comfortable',
      cuisines: state.onboarding.answers.cuisines || ['indian_general'],
      allergens: state.onboarding.answers.allergens || [],
      privacy_consent_given: true,
      onboarding_completed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const completedOnboarding: OnboardingState = {
      ...state.onboarding,
      completed: true,
    };

    await Promise.all([
      storage.setProfile(profile),
      storage.setOnboarding(completedOnboarding),
    ]);

    dispatch({ type: 'SET_PROFILE', payload: profile });
    dispatch({ type: 'SET_ONBOARDING', payload: completedOnboarding });
    
    analytics.onboardingCompleted();
  };

  const acknowledgeDisclaimer = async () => {
    if (!state.profile) return;
    
    const updatedProfile = {
      ...state.profile,
      medical_disclaimer_acked: true,
      updated_at: new Date().toISOString(),
    } as UserProfile;

    await storage.setProfile(updatedProfile);
    dispatch({ type: 'SET_PROFILE', payload: updatedProfile });
    
    analytics.disclaimerAccepted();

    if (state.currentPlan && state.currentPlan.mode === 'limited') {
      const newPlan = await generateWeeklyPlan(updatedProfile);
      await storage.setCurrentPlan(newPlan);
      dispatch({ type: 'SET_CURRENT_PLAN', payload: newPlan });
    }
  };

  const generatePlan = async (): Promise<WeeklyPlan> => {
    if (!state.profile) throw new Error('Profile not set');
    
    analytics.planGenerationStarted();
    
    try {
      const plan = await generateWeeklyPlan(state.profile);
      await storage.setCurrentPlan(plan);
      dispatch({ type: 'SET_CURRENT_PLAN', payload: plan });
      
      analytics.planGenerationSucceeded(plan.plan_id);
      return plan;
    } catch (e) {
      analytics.planGenerationFailed((e as Error).message);
      throw e;
    }
  };

  const swapMealAction = async (date: string, slot: MealSlot) => {
    if (!state.currentPlan || !state.profile) return;
    
    const oldMeal = state.currentPlan.days
      .find(d => d.date === date)
      ?.meals.find(m => m.slot === slot);
    
    const updatedPlan = await swapMeal(
      state.currentPlan, 
      date, 
      slot, 
      state.profile, 
      state.avoidanceList
    );
    
    await storage.setCurrentPlan(updatedPlan);
    dispatch({ type: 'SET_CURRENT_PLAN', payload: updatedPlan });

    const newMeal = updatedPlan.days
      .find(d => d.date === date)
      ?.meals.find(m => m.slot === slot);
    
    if (oldMeal && newMeal) {
      analytics.mealSwapped(
        updatedPlan.plan_id, 
        date, 
        slot, 
        oldMeal.dish_id, 
        newMeal.dish_id
      );
    }
  };

  const dislikeMealAction = async (date: string, slot: MealSlot) => {
    if (!state.currentPlan || !state.profile) return;
    
    const oldMeal = state.currentPlan.days
      .find(d => d.date === date)
      ?.meals.find(m => m.slot === slot);
    
    const { plan: updatedPlan, addedToAvoidance } = await dislikeMeal(
      state.currentPlan,
      date,
      slot,
      state.profile,
      state.avoidanceList
    );
    
    if (state.profile.medical_disclaimer_acked !== false) {
      await storage.addToAvoidanceList(addedToAvoidance);
      dispatch({ type: 'ADD_TO_AVOIDANCE', payload: addedToAvoidance });
    }
    
    await storage.setCurrentPlan(updatedPlan);
    dispatch({ type: 'SET_CURRENT_PLAN', payload: updatedPlan });
    
    if (oldMeal) {
      analytics.mealDisliked(updatedPlan.plan_id, date, slot, oldMeal.dish_id);
    }
  };

  const regenerateDayAction = async (date: string) => {
    if (!state.currentPlan || !state.profile) return;
    
    const updatedPlan = await regenerateDay(state.currentPlan, date, state.profile);
    await storage.setCurrentPlan(updatedPlan);
    dispatch({ type: 'SET_CURRENT_PLAN', payload: updatedPlan });
    
    analytics.dayRegenerated(updatedPlan.plan_id, date);
  };

  const setDayFlagsAction = async (
    date: string, 
    flags: { cheat?: boolean; festive?: boolean; festive_label?: string | null }
  ) => {
    if (!state.currentPlan) return;
    
    const updatedPlan = await setDayFlags(state.currentPlan, date, flags);
    await storage.setCurrentPlan(updatedPlan);
    dispatch({ type: 'SET_CURRENT_PLAN', payload: updatedPlan });
  };

  const logMealAction = async (date: string, slot: MealSlot, status: MealStatus) => {
    if (!state.currentPlan) return;
    
    const updatedPlan = await logMealStatus(state.currentPlan, date, slot, status);
    await storage.setCurrentPlan(updatedPlan);
    dispatch({ type: 'SET_CURRENT_PLAN', payload: updatedPlan });
    
    analytics.mealLogged(updatedPlan.plan_id, date, slot, status);
  };

  const markFirstPlanViewed = async () => {
    await storage.setFirstPlanViewed(true);
    dispatch({ type: 'SET_FIRST_PLAN_VIEWED', payload: true });
    
    if (state.currentPlan) {
      analytics.firstPlanViewed(state.currentPlan.plan_id);
    }
  };

  const markCoachMarkShown = async (markId: string) => {
    await storage.setCoachMarkShown(markId);
    dispatch({ type: 'ADD_COACH_MARK_SHOWN', payload: markId });
  };

  const hasCoachMarkBeenShown = (markId: string): boolean => {
    return state.coachMarksShown.includes(markId);
  };

  const skipLoginDev = async () => {
    if (!DEV_SKIP_AUTH) return;

    const auth: AuthState = {
      isAuthenticated: true,
      user_id: DEV_SKIP_USER_ID,
      auth_method: 'phone',
      phone: '0000000000',
    };
    
    await storage.setAuth(auth);
    dispatch({ type: 'SET_AUTH', payload: auth });

    const newOnboarding: OnboardingState = {
      currentStep: 1,
      answers: { user_id: DEV_SKIP_USER_ID },
      completed: false,
    };
    await storage.setOnboarding(newOnboarding);
    dispatch({ type: 'SET_ONBOARDING', payload: newOnboarding });
  };

  const skipToSamplePlanDev = async (): Promise<WeeklyPlan> => {
    if (!DEV_SKIP_AUTH) {
      throw new Error('skipToSamplePlanDev is only available in dev mode');
    }

    const auth: AuthState = {
      isAuthenticated: true,
      user_id: DEV_SKIP_USER_ID,
      auth_method: 'phone',
      phone: '0000000000',
    };
    
    await storage.setAuth(auth);
    dispatch({ type: 'SET_AUTH', payload: auth });

    const profile: UserProfile = {
      user_id: DEV_SKIP_USER_ID,
      goal: 'healthy_lifestyle',
      routine: 'some_time',
      age: 30,
      gender: 'prefer_not_to_say',
      height_cm: 170,
      weight_kg: 70,
      activity: 'moderately_active',
      medical_conditions: [],
      medical_disclaimer_acked: true,
      cooking_skill: 'comfortable',
      cuisines: ['indian_general', 'north_indian', 'south_indian'],
      allergens: [],
      privacy_consent_given: true,
      onboarding_completed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const completedOnboarding: OnboardingState = {
      currentStep: 10,
      answers: profile,
      completed: true,
    };

    await Promise.all([
      storage.setProfile(profile),
      storage.setOnboarding(completedOnboarding),
    ]);

    dispatch({ type: 'SET_PROFILE', payload: profile });
    dispatch({ type: 'SET_ONBOARDING', payload: completedOnboarding });

    const plan = await generateWeeklyPlan(profile);
    await storage.setCurrentPlan(plan);
    dispatch({ type: 'SET_CURRENT_PLAN', payload: plan });

    return plan;
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!state.profile) return;
    
    const updatedProfile = {
      ...state.profile,
      ...updates,
      updated_at: new Date().toISOString(),
    } as UserProfile;

    await storage.setProfile(updatedProfile);
    dispatch({ type: 'SET_PROFILE', payload: updatedProfile });
  };

  const value: AppContextValue = {
    state,
    login,
    logout,
    updateOnboarding,
    completeOnboarding,
    updateProfile,
    acknowledgeDisclaimer,
    generatePlan,
    swapMealAction,
    dislikeMealAction,
    regenerateDayAction,
    setDayFlagsAction,
    logMealAction,
    markFirstPlanViewed,
    markCoachMarkShown,
    hasCoachMarkBeenShown,
    skipLoginDev,
    skipToSamplePlanDev,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
