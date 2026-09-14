# MealMind Web v1 PRD

**Status:** Approved 2026-09-14 by Rakesh  
**Owner:** Product (Hazel)  
**Repo path:** mealmind-web (Next.js App Router)  
**Deploy:** Vercel from GitHub repo RakeshDanthoj/MealMind  
**Backend:** Existing Supabase project MealMind (same schema as mobile)

---

## Decision

Build a full web app, not a marketing-only site, and not Expo-for-web. Same product loop as mobile P0, plus 3-day trial and Razorpay paywall (mobile P1 monetization, shipped on web v1).

---

## Logged-out Marketing

- **Home:** Positioning: AI-powered personalized nutrition, built on dietician-validated guidelines — plans that fit your life.
- **How it works**
- **Pricing**
- **Privacy policy**

**Important:** Never say "dietician-approved plans."

---

## Auth

- **Provider:** Supabase Auth
- **Methods:** Email + Google. Phone OTP can follow later.
- **User table:** Same `auth.users` as future mobile real auth.
- **No mock UUIDs on web.**

---

## Core Loop (parity with ONBOARDING_FIRST_PLAN_UX.md)

1. Privacy consent (DPDP)
2. 10-step onboarding
3. Medical disclaimer if conditions flagged
4. Generate plan
5. First-plan reveal
6. Plan / Library / Progress / Profile navigation

### Plan View

- **Duration:** 7 days
- **Slots:** Breakfast, Lunch, Snack, Dinner
- **Actions:**
  - Swap
  - Don't like
  - Regenerate day
  - Ate / Swapped / Skipped
  - Cheat + festive flags
- **Limited plan + banner** until medical disclaimer acknowledged

---

## Recipes

Library is real, not a stub.

**In-plan and browse:**
- Name, photo, description, ingredients list are **free**

**Gated content:**
- Full step-by-step instructions require: **Pro subscription** OR **₹99 à la carte unlock**

---

## Trial + Paywall (web v1 — approved)

### Trial Rules

- **3-day free trial**, full access
- **No permanent free tier**
- Trial starts at `first_plan_viewed` (first successful plan reveal)
- **Banner:** Days left in trial

### Post-trial Restrictions

After trial without entitlement, user can still see plan cards (name/photo) but **server must block:**
- Swap
- Dislike
- Regenerate
- Full recipe steps
- Generating a new week

### Checkout via Razorpay (test mode first)

| Offering | Price | Notes |
|----------|-------|-------|
| Monthly Pro | ₹1,299/month | Includes all recipes |
| One-time weekly plan | ₹599 | Low-commitment entry |
| One-time monthly plan | ₹1,499 | Recipes billed separately |
| Recipe à la carte | ₹99 | Per recipe unlock |

**UX framing:** One-time plans are the no-commitment option, not a worse deal vs Pro.

### Entitlement Grant

Grant entitlements **only after verified Razorpay webhook**.

---

## Out of v1

- Yearly subscription
- Video recipes
- Grocery integration
- Wearables
- Deep calorie/macro tracking
- Festive pack pricing (~₹49)

---

## Owners

| Owner | Responsibility |
|-------|----------------|
| Freddy | Next.js UI + Vercel deployment |
| Billy | Supabase Auth, entitlements, Razorpay integration, RLS/paywall enforcement |
| Paparao | PR review |

---

## Success Criteria

A new user can:

1. Sign up on the Vercel URL
2. Finish onboarding
3. See a weekly plan
4. Use meal actions during trial
5. Hit paywall after trial expires
6. Complete a test-mode Razorpay purchase that unlocks Pro or a recipe
