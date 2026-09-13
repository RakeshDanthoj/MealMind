# MealMind — Phased MVP Roadmap

Derived from `PRD_AI_Diet_Planner_App.md` (v1.0 Draft)  
Owner: Product / Roadmap  
Status: Working draft — ready for build sequencing

---

## Product north star (MVP)

Ship an AI-native, **plan-first** mobile app for urban Indian professionals that:

1. Generates a personalized weekly diet plan from a lifestyle questionnaire  
2. Lets users swap / dislike / regenerate meals and handle cheat + festive days  
3. Monetizes via one-time plans, Pro subscription, and à-la-carte recipes  
4. Keeps tracking intentionally light (Ate / Swapped / Skipped) to feed personalization and streaks  

Positioning: *"AI-powered personalized nutrition, built on dietician-validated guidelines — plans that fit your life, not the way around."*

**Explicit non-goals for MVP:** medical diet therapy, video recipes, 1:1 human dieticians, grocery delivery, wearables, deep calorie/macro/weight logging.

---

## Phase map

| Phase | Goal | Outcome |
|-------|------|---------|
| **P0 — Foundation** | Validate core loop end-to-end | User completes onboarding → gets a first weekly plan → can act on meals |
| **P1 — Monetize & retain** | Make the loop pay and stick | Trial → paid; recipes paywalled; streaks/badges; privacy/disclaimer hardened |
| **P2 — Polish & expand** | Post-MVP bets (only after P1 metrics) | Extra cuisines, yearly plan, grocery/wearables decisions, deeper tracking |

Ship criterion for "MVP live": **P0 complete + P1 revenue path live** (3-day trial → paid offering + recipe paywall).

---

## P0 — Foundation (must ship first)

### P0.1 Product & design
- [ ] Lock onboarding question set (PRD §6.1) and medical disclaimer triggers (§6.2 / §9)
- [ ] Wireframes / UX flow: signup → questionnaire → first plan reveal → meal card actions
- [ ] Define plan card IA: day view, meal slots, swap / don't like / regenerate / cheat / festive

### P0.2 Personalization engine (MVP cut)
- [ ] **Static** dietician-validated knowledge base / rule templates (not live web ingestion)
- [ ] Generate 7-day plan from onboarding inputs
- [ ] Cuisine multi-select: Indian (general), North Indian, South Indian, Chinese (Indo-Chinese), Asian
- [ ] Per-meal: Swap (preserve day balance), Don't like (avoid later), Regenerate day
- [ ] Cheat day: user-marked or AI-suggested; clean ingredients, not unrestricted binge
- [ ] Festive day: Indian festival calendar + manual flag; healthier festive variants

### P0.3 Tracking (simple)
- [ ] Per meal: Ate it / Swapped it / Skipped it
- [ ] Persist signals for learning engine + future gamification

### P0.4 Platform skeleton
- [ ] Native iOS + Android app shell (auth, navigation, plan home)
- [ ] Account + basic profile edit (allergens editable anytime)

### P0.5 Trust / compliance (minimum viable)
- [ ] Medical disclaimer at condition entry **and** on plan/recipe delivery for flagged users
- [ ] Limited plan until disclaimer acknowledged (PRD §6.2)
- [ ] Privacy policy + DPDP-aligned consent for health-adjacent data (can refine with legal in parallel)

**P0 exit:** a new user can onboard, receive a credible weekly plan, swap/dislike/regenerate, mark Ate/Swapped/Skipped, and see disclaimers when relevant.

---

## P1 — Monetize & retain (MVP commercial)

### P1.1 Pricing & paywalls
- [ ] 3-day free trial (full access; no permanent free tier)
- [ ] One-time weekly plan ₹599
- [ ] One-time monthly plan ₹1,499 (recipes billed separately)
- [ ] Monthly Pro ₹1,299 (all recipes included)
- [ ] À-la-carte recipe ₹99; free preview = name + photo + short description
- [ ] Festive recipes ~₹49 or Festive Pack; cheat recipes ₹99 or streak-unlock; free under Pro
- [ ] UX copy: one-time framed as no-commitment option (not "worse deal" vs Pro)

### P1.2 Recipes
- [ ] AI-generated text + photos (in-plan + standalone library)
- [ ] Recipe detail paywall enforcement
- [ ] Cheat / festive recipe pricing rules as above

### P1.3 Gamification
- [ ] Streaks, challenges, badges (adherence, new cuisine, cheat-day-within-plan, etc.)
- [ ] Tie streak rewards to cheat-recipe unlock where specified

### P1.4 Hardening
- [ ] Legal consult on disclaimer + privacy language (parallel; pre-launch recommendation)
- [ ] Instrumentation for PRD metrics: activation, trial→paid, D7/D30, ARPU mix, recipe attach, swap/skip rate

**P1 exit:** trial and paid paths work; recipes monetize; retention loops (streaks) live; analytics answer "is personalization and pricing working?"

---

## P2 — Post-MVP (do not build until P1 signals)

Defer until metrics say so (or an explicit business decision):

- Yearly subscription price (~8–10× monthly target)
- Additional cuisines (Continental, Jain/Satvik, Vegan, …)
- Video recipes
- Human dietician 1:1
- Grocery ordering / delivery partnership
- Google Fit / Apple Health
- Deep tracking: calories, macros, weight, photo logging (candidate Pro upsell later)
- Continuous live ingestion of nutrition sources (vs periodic static KB updates)

---

## Suggested build sequence (weeks are indicative)

| Sequence | Focus | Delivers |
|----------|--------|----------|
| 1 | Onboarding + plan UX + static plan generation | First "wow" plan |
| 2 | Meal actions + Ate/Swapped/Skipped + learning hooks | Sticky core loop |
| 3 | Cheat + festive handling | India-specific differentiation |
| 4 | Recipe library + paywall + trial/billing | Revenue path |
| 5 | Streaks/badges + analytics + legal polish | Retention + launch readiness |

---

## Open decisions (blockers / needs owner call)

| Item | Impact | Suggested default until decided |
|------|--------|----------------------------------|
| Yearly subscription price | P2 pricing page | Hide yearly at MVP |
| Grocery partnership | Scope creep | Out until post-MVP review |
| Wearables | Eng cost | Out until post-MVP review |
| Legal review timing | Launch risk | Start consult in parallel with P0.5 |
| AI KB: static vs live | Architecture | **Static curated KB for MVP** (PRD recommendation) |
| Yearly in marketing | Confusion | Don't promote until priced |

---

## Success metrics to instrument from day one

From PRD §4 (finalize targets with business):

- **Activation:** % signups who finish onboarding and get a first plan  
- **Trial → paid:** % of 3-day trial users who convert  
- **Retention:** D7, D30; streak completion  
- **Monetization:** ARPU; sub vs one-time mix; recipe attach rate  
- **AI quality proxy:** meal swap / skip rate per plan (high = tune personalization)

---

## Immediate next actions (product)

1. Approve this phase cut (P0 vs P1 vs P2)  
2. Start **onboarding + first-plan UX** (wireframes / flow) as first delivery artifact  
3. Kick **AI static-KB technical scoping** in parallel with eng  
4. Schedule legal consult for disclaimer + DPDP language  

---

## Source

Canonical PRD: `PRD_AI_Diet_Planner_App.md` in this repo.  
This roadmap is the working product sequencing layer; update it when scope or pricing decisions land.
