-- MealMind P0 Core Schema
-- Applied to Supabase project: lydbbyeqfuazhcymdald
-- This migration documents the existing live schema for source-of-truth tracking

-- =============================================================================
-- PROFILES TABLE
-- Stores user profile data synced with Supabase Auth
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  goal TEXT,
  routine TEXT,
  age INTEGER,
  gender TEXT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  activity TEXT,
  medical_conditions TEXT[] DEFAULT '{}',
  medical_disclaimer_acked BOOLEAN DEFAULT FALSE,
  cooking_skill TEXT,
  cuisines TEXT[] DEFAULT '{}',
  allergens TEXT[] DEFAULT '{}',
  privacy_consent_given BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read/write their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger to auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- DISH CATALOG TABLE
-- Master catalog of all available dishes
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.dish_catalog (
  dish_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cuisines TEXT[] NOT NULL DEFAULT '{}',
  meal_slots TEXT[] NOT NULL DEFAULT '{}',
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  allergens TEXT[] NOT NULL DEFAULT '{}',
  diet_tags TEXT[] NOT NULL DEFAULT '{}',
  prep_complexity TEXT NOT NULL,
  prep_minutes INTEGER NOT NULL,
  kcal INTEGER NOT NULL,
  protein_g NUMERIC NOT NULL,
  carbs_g NUMERIC NOT NULL,
  fat_g NUMERIC NOT NULL,
  cheat_suitable BOOLEAN DEFAULT FALSE,
  festive_tags TEXT[] DEFAULT '{}',
  photo_url TEXT,
  recipe_preview TEXT NOT NULL,
  recipe_steps_ref TEXT,
  recipe_steps TEXT,
  active BOOLEAN DEFAULT TRUE,
  dietician_reviewed BOOLEAN DEFAULT FALSE,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.dish_catalog ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read active dishes
CREATE POLICY "Authenticated users can read active dishes"
  ON public.dish_catalog FOR SELECT
  TO authenticated
  USING (active = TRUE);

-- =============================================================================
-- WEEKLY PLANS TABLE
-- Stores generated weekly meal plans
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.weekly_plans (
  plan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  catalog_version INTEGER DEFAULT 1,
  mode TEXT DEFAULT 'full' CHECK (mode IN ('full', 'limited')),
  daily_kcal_target INTEGER NOT NULL,
  macro_protein_min INTEGER NOT NULL,
  macro_protein_max INTEGER NOT NULL,
  macro_carbs_min INTEGER NOT NULL,
  macro_carbs_max INTEGER NOT NULL,
  macro_fat_min INTEGER NOT NULL,
  macro_fat_max INTEGER NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generator TEXT DEFAULT 'static_kb_v1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;

-- Users can CRUD their own plans
CREATE POLICY "Users can view own plans"
  ON public.weekly_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans"
  ON public.weekly_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans"
  ON public.weekly_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans"
  ON public.weekly_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Index for efficient latest plan lookup
CREATE INDEX IF NOT EXISTS idx_weekly_plans_user_week
  ON public.weekly_plans(user_id, week_start DESC);

-- =============================================================================
-- PLAN DAYS TABLE
-- Individual days within a weekly plan
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.weekly_plans(plan_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day_index INTEGER NOT NULL CHECK (day_index >= 0 AND day_index <= 6),
  cheat BOOLEAN DEFAULT FALSE,
  festive BOOLEAN DEFAULT FALSE,
  festive_label TEXT
);

-- Enable RLS
ALTER TABLE public.plan_days ENABLE ROW LEVEL SECURITY;

-- Users can CRUD days of their own plans (via plan ownership check)
CREATE POLICY "Users can view own plan days"
  ON public.plan_days FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.weekly_plans wp
      WHERE wp.plan_id = plan_days.plan_id
      AND wp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own plan days"
  ON public.plan_days FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.weekly_plans wp
      WHERE wp.plan_id = plan_days.plan_id
      AND wp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own plan days"
  ON public.plan_days FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.weekly_plans wp
      WHERE wp.plan_id = plan_days.plan_id
      AND wp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own plan days"
  ON public.plan_days FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.weekly_plans wp
      WHERE wp.plan_id = plan_days.plan_id
      AND wp.user_id = auth.uid()
    )
  );

-- Index for efficient day lookup
CREATE INDEX IF NOT EXISTS idx_plan_days_plan_id ON public.plan_days(plan_id);

-- =============================================================================
-- PLAN MEALS TABLE
-- Individual meals within a plan day
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.plan_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_day_id UUID NOT NULL REFERENCES public.plan_days(id) ON DELETE CASCADE,
  slot TEXT NOT NULL CHECK (slot IN ('breakfast', 'lunch', 'snack', 'dinner')),
  dish_id TEXT NOT NULL REFERENCES public.dish_catalog(dish_id),
  name TEXT NOT NULL,
  kcal INTEGER NOT NULL,
  cuisine TEXT NOT NULL,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'ate', 'swapped', 'skipped')),
  prep_minutes INTEGER,
  photo_url TEXT
);

-- Enable RLS
ALTER TABLE public.plan_meals ENABLE ROW LEVEL SECURITY;

-- Users can CRUD meals of their own plan days (via deep ownership check)
CREATE POLICY "Users can view own plan meals"
  ON public.plan_meals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.plan_days pd
      JOIN public.weekly_plans wp ON wp.plan_id = pd.plan_id
      WHERE pd.id = plan_meals.plan_day_id
      AND wp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own plan meals"
  ON public.plan_meals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.plan_days pd
      JOIN public.weekly_plans wp ON wp.plan_id = pd.plan_id
      WHERE pd.id = plan_meals.plan_day_id
      AND wp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own plan meals"
  ON public.plan_meals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.plan_days pd
      JOIN public.weekly_plans wp ON wp.plan_id = pd.plan_id
      WHERE pd.id = plan_meals.plan_day_id
      AND wp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own plan meals"
  ON public.plan_meals FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.plan_days pd
      JOIN public.weekly_plans wp ON wp.plan_id = pd.plan_id
      WHERE pd.id = plan_meals.plan_day_id
      AND wp.user_id = auth.uid()
    )
  );

-- Index for efficient meal lookup
CREATE INDEX IF NOT EXISTS idx_plan_meals_day_id ON public.plan_meals(plan_day_id);

-- =============================================================================
-- USER DISH AVOIDANCE TABLE
-- Tracks dishes users have disliked/avoid
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_dish_avoidance (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dish_id TEXT NOT NULL REFERENCES public.dish_catalog(dish_id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, dish_id)
);

-- Enable RLS
ALTER TABLE public.user_dish_avoidance ENABLE ROW LEVEL SECURITY;

-- Users can CRUD their own avoidance entries
CREATE POLICY "Users can view own avoidance"
  ON public.user_dish_avoidance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own avoidance"
  ON public.user_dish_avoidance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own avoidance"
  ON public.user_dish_avoidance FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own avoidance"
  ON public.user_dish_avoidance FOR DELETE
  USING (auth.uid() = user_id);

-- Index for efficient avoidance lookup
CREATE INDEX IF NOT EXISTS idx_user_dish_avoidance_user_id
  ON public.user_dish_avoidance(user_id);

-- =============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER dish_catalog_updated_at
  BEFORE UPDATE ON public.dish_catalog
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
