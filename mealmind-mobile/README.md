# MealMind Mobile App

AI-powered personalized diet and meal planner for urban Indian professionals. Built with Expo (React Native) + TypeScript.

## Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start the development server
npx expo start
```

## Supabase Configuration

The app supports Supabase as a backend data store. When configured, user profiles, meal plans, and dish avoidances are persisted to your Supabase project. Without configuration, the app falls back to local mock data.

### Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials in `.env.local`:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   Get these values from your [Supabase Dashboard](https://supabase.com/dashboard/project/_/settings/api).

3. The database schema is documented in `supabase/migrations/20260914000000_mealmind_p0_core_schema.sql`.

### Behavior

- **With Supabase configured + real Auth session**: User data is synced to the cloud.
- **Without Supabase / dev mode**: The app uses local AsyncStorage and mock data, allowing full functionality for development and testing.
- **`dev-skip-user` ID**: A special user ID that bypasses Supabase writes, useful for local-only testing.

### Auth Integration Note

**Important:** The Supabase data layer requires a real Supabase Auth session to persist data. The database uses Row Level Security (RLS) policies where `profiles.id` references `auth.users`.

Currently, the app uses mock auth (generates local UUIDs). These local UUIDs are **not** valid Supabase Auth users, so writes will be skipped until real Supabase Auth is implemented.

The data layer automatically detects this: it checks for an active Supabase Auth session before attempting writes. If no session exists, data stays local (AsyncStorage) and the app continues to function normally. When Supabase Auth is integrated (phone OTP, Google, Apple sign-in), persistence will work automatically.

Then:
- Press `w` to open in web browser
- Press `a` to open in Android emulator/device
- Press `i` to open in iOS simulator (macOS only)
- Scan QR code with Expo Go app on your phone

## Product Overview

MealMind generates personalized weekly meal plans based on user lifestyle, goals, and preferences. The P0 goal is: **install → first weekly plan in ~3 minutes**.

### Key Features (P0)

- 10-step lifestyle-based onboarding
- AI-generated 7-day personalized meal plans
- Meal actions: Swap, Don't Like, Regenerate Day
- Meal tracking: Ate / Swapped / Skipped
- Cheat day and festive day support
- Medical disclaimer flow for users with health conditions
- Privacy & data consent (DPDP compliant)

## Architecture

### Tech Stack

- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context + useReducer
- **Storage**: AsyncStorage
- **Styling**: React Native StyleSheet

### Project Structure

```
mealmind-mobile/
├── app/                          # Expo Router screens
│   ├── _layout.tsx              # Root layout
│   ├── index.tsx                # Welcome screen
│   ├── auth.tsx                 # Auth (OTP/Google/Apple mock)
│   ├── privacy-consent.tsx      # DPDP consent
│   ├── onboarding.tsx           # 10-step questionnaire
│   ├── medical-disclaimer.tsx   # Medical disclaimer (conditional)
│   ├── generating-plan.tsx      # Plan generation loading
│   ├── plan-reveal.tsx          # First plan reveal
│   ├── recipe-preview.tsx       # Recipe preview modal
│   └── (tabs)/                  # Tab navigation
│       ├── _layout.tsx
│       ├── plan.tsx             # Plan home (Day view)
│       ├── library.tsx          # Recipe library (stub)
│       ├── progress.tsx         # Progress/streaks (stub)
│       └── profile.tsx          # User profile
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── SelectOption.tsx
│   │   ├── Chip.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── CoachMark.tsx
│   │   └── MealCard.tsx
│   ├── constants/               # App constants, options, colors
│   │   └── index.ts
│   ├── context/                 # React Context providers
│   │   └── AppContext.tsx       # Main app state
│   ├── services/                # Business logic / APIs
│   │   ├── analytics.ts         # Analytics event tracking
│   │   ├── mock-api.ts          # Mock API for plan operations
│   │   ├── mock-catalog.ts      # Indian dish catalog (40+ dishes)
│   │   └── storage.ts           # AsyncStorage wrapper
│   ├── types/                   # TypeScript types
│   │   └── index.ts             # WeeklyPlan, UserProfile, etc.
│   └── utils/                   # Utility functions
└── docs/                        # Contract documents
    ├── ONBOARDING_FIRST_PLAN_UX.md
    └── AI_PLAN_GENERATION_SCOPING.md
```

### Data Models

The app uses the following core types (see `src/types/index.ts`):

**WeeklyPlan** (from AI scoping doc):
```typescript
interface WeeklyPlan {
  plan_id: string;
  user_id: string;
  week_start: string;           // ISO date
  catalog_version: number;
  mode: 'full' | 'limited';     // limited if medical unacked
  daily_kcal_target: number;
  macro_bands: MacroBands;      // internal; hidden in P0 UI
  days: DayPlan[];              // 7 days
  generated_at: string;
  generator: string;
}

interface DayPlan {
  date: string;
  day_index: number;
  flags: { cheat: boolean; festive: boolean; festive_label: string | null };
  meals: MealItem[];            // 4 slots: breakfast, lunch, snack, dinner
}

interface MealItem {
  slot: MealSlot;
  dish_id: string;
  name: string;
  kcal: number;
  cuisine: CuisineType;
  status: 'planned' | 'ate' | 'swapped' | 'skipped';
}
```

**UserProfile**:
```typescript
interface UserProfile {
  user_id: string;
  goal: PrimaryGoal;
  routine: DailyRoutine;
  age: number;
  gender: Gender;
  height_cm: number;
  weight_kg: number;
  activity: ActivityLevel;
  medical_conditions: string[];
  medical_disclaimer_acked: boolean;
  cooking_skill: CookingSkill;
  cuisines: CuisineType[];
  allergens: string[];
  privacy_consent_given: boolean;
  onboarding_completed: boolean;
}
```

### Mock API Layer

The mock API (`src/services/mock-api.ts`) simulates backend operations:

- `generateWeeklyPlan(profile)` - Generate a 7-day plan
- `swapMeal(plan, date, slot, profile)` - Swap a single meal
- `dislikeMeal(plan, date, slot, profile)` - Mark dish as disliked + auto-swap
- `regenerateDay(plan, date, profile)` - Regenerate all meals for a day
- `setDayFlags(plan, date, flags)` - Toggle cheat/festive flags
- `logMealStatus(plan, date, slot, status)` - Log ate/swapped/skipped

### Dish Catalog

The mock catalog (`src/services/mock-catalog.ts`) contains **40+ authentic Indian dishes** across:
- Cuisines: Indian General, North Indian, South Indian, Chinese, Asian
- Meal slots: Breakfast, Lunch, Snack, Dinner
- Includes nutritional data (kcal, protein, carbs, fat)
- Festive and cheat day appropriate dishes

### Analytics Events

Instrumented events (logged to console, ready for analytics SDK):

| Event | When |
|-------|------|
| `onboarding_started` | First questionnaire screen |
| `onboarding_step_completed` | Each step |
| `onboarding_completed` | Submit questionnaire |
| `disclaimer_shown` / `disclaimer_accepted` | Medical path |
| `plan_generation_started/succeeded/failed` | Plan generation |
| `first_plan_viewed` | First plan reveal |
| `meal_swapped` / `meal_disliked` | Meal actions |
| `day_regenerated` | Regenerate day |
| `meal_logged` | Track ate/swapped/skipped |

### Coach Marks

First-session overlays:
1. Plan reveal: "This is your week. Tap a day to peek ahead."
2. First meal card: "Don't love it? Swap or tell us you don't like it."
3. After first log: "Log Ate / Swapped / Skipped so plans get smarter."

## User Flow

1. **Welcome** → Create account / Log in
2. **Auth** → Phone OTP or Google/Apple (mocked)
3. **Privacy Consent** → Required DPDP consent
4. **Onboarding** → 10 questions (goal, routine, age, gender, measurements, activity, medical, cooking skill, cuisines, allergens)
5. **Medical Disclaimer** → (conditional) if medical conditions specified
6. **Generating Plan** → 3-8s branded loading with tips
7. **Plan Reveal** → "Your week is ready" + How it works sheet
8. **Plan Home** → Day view with meal cards and actions

## Key UX Rules

- Never say "dietician-approved plan" — use "AI-powered, built on dietician-validated guidelines"
- Limited plan (banner) when medical conditions present but unacknowledged
- Cheat day ≠ free-for-all; still within dietary guidelines
- Festive day = healthier versions of traditional dishes
- Coach marks never block primary CTA

## Locked Product Defaults

- **Auth priority**: Phone OTP + Google/Apple
- **Units**: kg/cm default (India)
- **Meal slots**: 4 fixed (breakfast, lunch, snack, dinner)
- **Limited plan**: Generic meals until medical disclaimer acknowledged

## Development Notes

- **No real backend** — all operations use mock services
- **No real auth** — mocked with random UUIDs
- **State persisted** with AsyncStorage for resume on drop-off
- **Types match** WeeklyPlan schema from AI scoping doc

### Dev Skip Login

When `DEV_SKIP_AUTH` is enabled, dev skip buttons appear on both the Welcome and Auth screens:

- **Skip login (dev)** — Creates a mock user (`dev-skip-user`) and routes to privacy consent → onboarding flow
- **Skip to Plan home (dev)** — Creates a mock user with a complete profile and generates a sample weekly plan, jumping directly to the Plan home tab
- **Reset app data (dev)** — Clears all AsyncStorage data and returns to Welcome screen (useful when stuck mid-flow)

The flag is defined in `src/constants/index.ts`:

```typescript
export const DEV_SKIP_AUTH = __DEV__ || process.env.EXPO_PUBLIC_DEV_SKIP_AUTH === '1';
```

> **WARNING**: Production builds must NOT ship with `DEV_SKIP_AUTH` enabled.

#### Expo Go Troubleshooting

If you can't see the dev skip links in Expo Go:

1. **Scroll down** — The dev links are in the footer below "Log in" / "Create account". On smaller screens, you may need to scroll to see them.

2. **Check both screens** — Dev skip links appear on:
   - **Welcome screen** (`/`) — Below the Log in button
   - **Auth screen** (`/auth`) — Below the Terms of Service text

3. **Stuck mid-flow?** — If the app auto-redirects due to existing AsyncStorage data:
   - Navigate to the **Auth screen** (tap Log in from Welcome)
   - Use **Reset app data (dev)** to clear all persisted state
   - The app will return to Welcome where you can see all skip options

4. **`__DEV__` is false in Expo Go?** — If dev buttons don't appear, `__DEV__` may not be set correctly. Create a `.env.local` file in the project root:
   ```
   EXPO_PUBLIC_DEV_SKIP_AUTH=1
   ```
   Then restart the Expo dev server (`npx expo start --clear`).

## Contract Documents

See `/docs` folder for:
- `ONBOARDING_FIRST_PLAN_UX.md` - UX flow specification
- `AI_PLAN_GENERATION_SCOPING.md` - API schemas and plan generation logic

## Success Criteria

- [x] Fresh install walkthrough reaches Day 1 plan view with 7×4 meals
- [x] Medical path shows disclaimer + limited banner; non-medical skips disclaimer
- [x] Swap / don't like / regenerate / log / cheat-festive flags update UI
- [x] Types match WeeklyPlan schema from scoping doc
- [x] App builds/starts without errors

## Future Enhancements (Post-P0)

- Real backend integration
- Recipe paywall (₹99 / Pro subscription)
- Streaks, badges, and gamification
- Video recipes
- Grocery ordering integration
- Wearable integration (Google Fit, Apple Health)
