import { 
  PrimaryGoal, 
  DailyRoutine, 
  Gender, 
  ActivityLevel, 
  CookingSkill, 
  CuisineType 
} from '../types';

/**
 * DEV_SKIP_AUTH: Enables "Skip login (dev)" buttons on Welcome and Auth screens.
 * 
 * Enabled when:
 * - __DEV__ is true (standard React Native dev mode), OR
 * - EXPO_PUBLIC_DEV_SKIP_AUTH=1 is set in .env.local (for Expo Go when __DEV__ is false)
 * 
 * WARNING: This is a temporary developer convenience feature.
 * Production builds must NOT ship with this enabled.
 */
export const DEV_SKIP_AUTH = __DEV__ || process.env.EXPO_PUBLIC_DEV_SKIP_AUTH === '1';

export const DEV_SKIP_USER_ID = 'dev-skip-user';

export const COLORS = {
  primary: '#2E7D32',
  primaryLight: '#4CAF50',
  primaryDark: '#1B5E20',
  secondary: '#FF9800',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  error: '#D32F2F',
  warning: '#FFA000',
  text: '#212121',
  textSecondary: '#757575',
  textLight: '#BDBDBD',
  border: '#E0E0E0',
  success: '#43A047',
  muted: '#9E9E9E',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  hero: 40,
};

export const GOAL_OPTIONS: { value: PrimaryGoal; label: string; description: string }[] = [
  { value: 'healthy_lifestyle', label: 'Healthy Lifestyle', description: 'Balanced nutrition for overall wellness' },
  { value: 'weight_loss', label: 'Weight Loss', description: 'Calorie-conscious meals for weight management' },
  { value: 'muscle_gain', label: 'Muscle Gain', description: 'Protein-rich plans for building strength' },
  { value: 'maintenance', label: 'Maintenance', description: 'Sustain your current healthy weight' },
  { value: 'other', label: 'Other', description: 'General healthy eating' },
];

export const ROUTINE_OPTIONS: { value: DailyRoutine; label: string; description: string }[] = [
  { value: 'hectic', label: 'Hectic Schedule', description: 'Little time for meal prep' },
  { value: 'some_time', label: 'Some Time', description: 'Moderate time for cooking' },
  { value: 'flexible', label: 'Flexible', description: 'Plenty of time for meals & workouts' },
];

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; description: string }[] = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
  { value: 'lightly_active', label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
  { value: 'moderately_active', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
  { value: 'very_active', label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
];

export const COOKING_SKILL_OPTIONS: { value: CookingSkill; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'Simple recipes with few steps' },
  { value: 'comfortable', label: 'Comfortable', description: 'Can follow most recipes' },
  { value: 'advanced', label: 'Advanced', description: 'Skilled in complex techniques' },
];

export const CUISINE_OPTIONS: { value: CuisineType; label: string }[] = [
  { value: 'indian_general', label: 'Indian (General)' },
  { value: 'north_indian', label: 'North Indian' },
  { value: 'south_indian', label: 'South Indian' },
  { value: 'chinese', label: 'Chinese (Indo-Chinese)' },
  { value: 'asian', label: 'Asian' },
];

export const COMMON_MEDICAL_CONDITIONS = [
  'Diabetes',
  'Hypertension',
  'Heart Disease',
  'Thyroid',
  'PCOD/PCOS',
  'Cholesterol',
  'Kidney Issues',
  'Liver Issues',
];

export const COMMON_ALLERGENS = [
  'Dairy',
  'Gluten',
  'Nuts',
  'Peanuts',
  'Eggs',
  'Soy',
  'Shellfish',
  'Fish',
  'Sesame',
];

export const MEAL_SLOT_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  snack: 'Snack',
  dinner: 'Dinner',
} as const;

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const ONBOARDING_STEPS = [
  { id: 1, name: 'goal', title: 'What\'s your primary goal?' },
  { id: 2, name: 'routine', title: 'How\'s your daily routine?' },
  { id: 3, name: 'age', title: 'What\'s your age?' },
  { id: 4, name: 'gender', title: 'What\'s your gender?' },
  { id: 5, name: 'measurements', title: 'Your height & weight' },
  { id: 6, name: 'activity', title: 'How active are you?' },
  { id: 7, name: 'medical', title: 'Any medical conditions?' },
  { id: 8, name: 'cooking', title: 'Your cooking skill level' },
  { id: 9, name: 'cuisines', title: 'Which cuisines do you prefer?' },
  { id: 10, name: 'allergens', title: 'Any food allergies?' },
];

export const GENERATION_TIPS = [
  'Balancing your week with variety...',
  'Matching meals to your schedule...',
  'Ensuring nutritional balance...',
  'Adding your favorite cuisines...',
  'Personalizing for your goals...',
  'Fine-tuning calorie targets...',
  'Building a sustainable plan...',
];
