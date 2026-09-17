import type {
  ActivityLevel,
  CookingSkill,
  CuisineType,
  DailyRoutine,
  Gender,
  PrimaryGoal,
} from "@/types";

export const GOAL_OPTIONS: {
  value: PrimaryGoal;
  label: string;
  description: string;
}[] = [
  {
    value: "healthy_lifestyle",
    label: "Healthy Lifestyle",
    description: "Balanced nutrition for overall wellness",
  },
  {
    value: "weight_loss",
    label: "Weight Loss",
    description: "Calorie-conscious meals for weight management",
  },
  {
    value: "muscle_gain",
    label: "Muscle Gain",
    description: "Protein-rich plans for building strength",
  },
  {
    value: "maintenance",
    label: "Maintenance",
    description: "Sustain your current healthy weight",
  },
  {
    value: "other",
    label: "Other",
    description: "General healthy eating",
  },
];

export const ROUTINE_OPTIONS: {
  value: DailyRoutine;
  label: string;
  description: string;
}[] = [
  {
    value: "hectic",
    label: "Hectic Schedule",
    description: "Little time for meal prep",
  },
  {
    value: "some_time",
    label: "Some Time",
    description: "Moderate time for cooking",
  },
  {
    value: "flexible",
    label: "Flexible",
    description: "Plenty of time for meals & workouts",
  },
];

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export const ACTIVITY_OPTIONS: {
  value: ActivityLevel;
  label: string;
  description: string;
}[] = [
  {
    value: "sedentary",
    label: "Sedentary",
    description: "Little to no exercise",
  },
  {
    value: "lightly_active",
    label: "Lightly Active",
    description: "Light exercise 1–3 days/week",
  },
  {
    value: "moderately_active",
    label: "Moderately Active",
    description: "Moderate exercise 3–5 days/week",
  },
  {
    value: "very_active",
    label: "Very Active",
    description: "Hard exercise 6–7 days/week",
  },
];

export const COOKING_SKILL_OPTIONS: {
  value: CookingSkill;
  label: string;
  description: string;
}[] = [
  {
    value: "beginner",
    label: "Beginner",
    description: "Simple recipes with few steps",
  },
  {
    value: "comfortable",
    label: "Comfortable",
    description: "Can follow most recipes",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Skilled in complex techniques",
  },
];

export const CUISINE_OPTIONS: { value: CuisineType; label: string }[] = [
  { value: "indian_general", label: "Indian (General)" },
  { value: "north_indian", label: "North Indian" },
  { value: "south_indian", label: "South Indian" },
  { value: "chinese", label: "Chinese (Indo-Chinese)" },
  { value: "asian", label: "Asian" },
];

export const COMMON_MEDICAL_CONDITIONS = [
  "Diabetes",
  "Hypertension",
  "Heart Disease",
  "Thyroid",
  "PCOD/PCOS",
  "Cholesterol",
  "Kidney Issues",
  "Liver Issues",
];

export const COMMON_ALLERGENS = [
  "Dairy",
  "Gluten",
  "Nuts",
  "Peanuts",
  "Eggs",
  "Soy",
  "Shellfish",
  "Fish",
  "Sesame",
];

export const ONBOARDING_STEPS = [
  {
    id: 1,
    key: "goal",
    title: "What's your primary goal?",
    subtitle: "This helps us personalize your calorie targets",
  },
  {
    id: 2,
    key: "routine",
    title: "How's your daily routine?",
    subtitle: "We'll suggest meals that fit your schedule",
  },
  {
    id: 3,
    key: "age",
    title: "What's your age?",
    subtitle: "Used to calculate your energy needs",
  },
  {
    id: 4,
    key: "gender",
    title: "What's your gender?",
    subtitle: "Helps calculate accurate calorie targets",
  },
  {
    id: 5,
    key: "body",
    title: "Your height & weight",
    subtitle: "Used to personalize your daily calorie needs",
  },
  {
    id: 6,
    key: "activity",
    title: "How active are you?",
    subtitle: "Your activity level affects calorie targets",
  },
  {
    id: 7,
    key: "medical",
    title: "Any medical conditions?",
    subtitle: "Optional — helps us show relevant health information",
  },
  {
    id: 8,
    key: "cooking",
    title: "Your cooking skill level",
    subtitle: "We'll suggest recipes that match your comfort level",
  },
  {
    id: 9,
    key: "cuisines",
    title: "Which cuisines do you prefer?",
    subtitle: "Select at least one (you can choose multiple)",
  },
  {
    id: 10,
    key: "allergens",
    title: "Any food allergies?",
    subtitle: "We'll make sure to avoid these ingredients (you can edit later)",
  },
] as const;

export const TOTAL_ONBOARDING_STEPS = ONBOARDING_STEPS.length;
