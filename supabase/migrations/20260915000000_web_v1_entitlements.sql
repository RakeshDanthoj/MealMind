-- MealMind Web v1 entitlements + trial support
-- Apply to the same Supabase project used by mobile.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS diet_type TEXT,
  ADD COLUMN IF NOT EXISTS meats_avoided TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS first_plan_viewed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('pro_monthly', 'plan_weekly', 'plan_monthly', 'recipe_unlock')),
  dish_id TEXT REFERENCES public.dish_catalog(dish_id),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  source TEXT NOT NULL DEFAULT 'razorpay_webhook',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS entitlements_user_id_idx ON public.entitlements(user_id);

ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entitlements"
  ON public.entitlements FOR SELECT
  USING (auth.uid() = user_id);

-- Writes happen via service role from Razorpay webhook only.

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_payment_id TEXT UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  offering TEXT NOT NULL,
  amount_paise INTEGER,
  status TEXT NOT NULL DEFAULT 'captured',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);
