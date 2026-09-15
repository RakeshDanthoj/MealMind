# MealMind Web

Next.js App Router website for MealMind. Sibling to `mealmind-mobile` — do not import from or modify mobile files.

## Stack

- Next.js 16 + TypeScript + Tailwind
- Supabase Auth (email + Google) when env is configured
- Local demo auth + localStorage when Supabase env is absent
- Razorpay checkout + webhook (demo grant mode without keys)
- Plan engine: static knowledge-base generator (web-owned copy)

## Local development

```bash
cd mealmind-web
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without Supabase/Razorpay secrets the app still runs end-to-end in **demo mode** (local session, local entitlements).

## Vercel

1. Import GitHub repo `RakeshDanthoj/MealMind`
2. Set **Root Directory** to `mealmind-web`
3. Add env vars from `.env.example`
4. Deploy

## Product surfaces

| Route | Purpose |
|-------|---------|
| `/` | Marketing home |
| `/how-it-works` | How it works |
| `/pricing` | Pricing |
| `/privacy` | Privacy policy |
| `/auth` | Sign up / log in |
| `/privacy-consent` → `/onboarding` → `/medical-disclaimer?` → `/generating-plan` → `/plan-reveal` | Funnel |
| `/plan` `/library` `/progress` `/profile` | App shell |

## SQL

Web entitlement tables: `../supabase/migrations/20260915000000_web_v1_entitlements.sql`
