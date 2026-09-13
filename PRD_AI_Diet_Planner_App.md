# Product Requirements Document (PRD) 

## AI-Powered Personalized Diet & Recipe Planner App 

Version: 1.0 (MVP) Status: Draft for review 

## 1. Overview & Vision 

An AI-driven mobile app that generates personalized weekly diet plans based on a user's lifestyle, goals, and — preferences without requiring manual meal planning or human coaching. The app also monetizes through detailed, AI-generated recipes tied to each meal, positioning itself as a fast, affordable, plan-first alternative to tracker-heavy or human-coachdependent nutrition apps in the Indian market. 

Positioning statement: "AI-powered personalized — nutrition, built on dietician-validated guidelines plans that fit your life, not the other way around." 

## 2. Problem Statement 

Urban Indian professionals want to eat healthier but face two consistent blockers: 

- 

- Time scarcity hectic schedules leave little room for meal planning, grocery decisions, or recipe research. 

- 

- Generic advice fatigue most diet content online is one-size-fits-all and doesn't adapt to individual routines, tastes, or regional food preferences. 

Existing apps either lean heavily on human coaching (expensive, slow to scale) or are tracking-first tools that treat meal planning as an afterthought. There's a gap for an AI-native, plan-first app that's fast, personalized, and transparently priced. 

## 3. Target Users 

Primary persona: Urban Indian professionals, roughly – 24 40, working full-time (WFH or office), healthconscious but time-starved. Currently either skip structured eating or default to inconsistent fooddelivery habits. 

Secondary/early-adopter persona: Fitness-conscious users in their 20s already engaged with gym/fitness apps, looking for a smarter meal-planning companion. 

#### Explicitly not targeted at MVP: Users with medical 

dietary needs (diabetes, kidney conditions, pregnancy, etc.) are not excluded from using the app, but are not the primary design target. These users see a mandatory disclaimer and are directed to consult a doctor (see Section 9). 

## 4. Goals & Success Metrics 

— (Suggested to be finalized with business targets) 

- Activation: % of signups who complete onboarding and receive a first plan 

- Trial-to-paid conversion: % of 3-day free trial users who convert to a paid plan/subscription 

- Retention: Day-7 and Day-30 active usage; streak completion rate 

- Monetization: Average revenue per user (ARPU); subscription vs. one-time plan mix; recipe attach rate 

- AI quality proxy: Meal swap/skip rate per plan (high swap rate = personalization needs tuning) 

## 5. Scope 

### In Scope (MVP) 

- Lifestyle-based onboarding questionnaire 

- AI-generated personalized weekly diet plan 

- Cuisine preference (multi-select): Indian (general), North Indian, South Indian, Chinese (Indo-Chinese), Asian 

- Meal swap, "don't like this" (with AI learning), and day regeneration 

- Cheat day and festive day handling (auto-detected + manual flag) 

- 

- AI-generated recipes (text + photos) in-plan and standalone library 

- Recipe paywall (free preview, paid detail) 

- Pricing: one-time weekly/monthly plans, monthly subscription, à la carte recipes, 3-day free trial 

- Simple daily tracking (Ate it / Swapped it / Skipped it) 

- Gamification: streaks, challenges, badges 

- Medical condition disclaimer flow 

- Privacy policy & data consent flow 

- iOS + Android mobile app 

### Out of Scope (Post-MVP / Future) 

Video recipes 

- Human dietician 1:1 consultations 

- Grocery ordering/delivery integration (undecided) 

- Wearable/health app integration (Google Fit, Apple Health) (undecided) 

- Detailed calorie/macro tracking, weight/photo logging 

- Yearly subscription pricing (to be finalized) Additional cuisines (Continental, Jain/Satvik, Vegan, etc.) 

## 6. Onboarding & Personalization 

### 6.1 Onboarding Questions 

1. Primary goal (healthy lifestyle, weight loss, muscle gain, maintenance, etc.) 

2. Daily routine / schedule type (hectic vs. time available for meal prep & workouts) 

3. Age 

4. Gender 

5. Weight & height 

6. Activity level (Sedentary / Lightly active / Moderately active / Very active) 

7. Medical conditions (optional field, triggers — 

disclaimer see Section 9) 

8. Cooking skill level (with future sub-customization, e.g., air fryer vs. stovetop) 

9. Cuisine preference — multi-select checkboxes: Indian (general), North Indian, South Indian, Chinese, Asian 

10. Allergens (freeform/tag-based, can be added/edited anytime) 

### 6.2 Medical Condition Handling 

- If a user indicates a medical condition, the app displays a clear disclaimer: "This app does not provide medical advice. Please consult your doctor before following this plan." 

- Users with a flagged medical condition receive a limited plan (not the full personalized plan) until they acknowledge the disclaimer. 

### 6.3 Plan Personalization Engine 

- AI generates a 7-day meal plan based on all onboarding inputs. 

Users can, per meal: 

- Swap the meal (AI replaces it while preserving the day's nutritional balance) 

- 

- Mark "don't like this" AI learns and avoids this ingredient/dish in future plans 

Regenerate a full day's plan 

- Cheat day: user-marked or AI-suggested day that stays within overall diet integrity using clean ingredients (not an unrestricted "free-for-all" day). 

- Festive day: detected via a built-in Indian festival calendar (Diwali, Eid, Onam, etc.) AND manually flaggable by the user; plan adapts to include festive-appropriate, healthier versions of traditional dishes. 

## 7. AI & Nutrition Positioning 

- 

- The app is fully AI-driven no per-plan human dietician review. 

- The AI's underlying nutrition logic and rule templates are validated by a dietician during development (static, curated knowledge base at MVP). 

- Marketing/product language should reflect: "AI— 

- powered, built on dietician-validated guidelines" not "dietician-approved plans," to avoid implying individual human review. 

- Note for technical scoping: Continuous live ingestion of nutrition journals/websites/videos (vs. a periodically updated static knowledge base) is a — 

- significantly larger build recommended as a post-MVP enhancement, not an MVP requirement. 

## 8. Recipes 

- Format (MVP): Text + photos. Video recipes are a future enhancement. 

- Creation: AI-generated, based on the dieticianvalidated knowledge base. 

- Availability: Recipes exist both (a) attached to meals within a user's generated plan, and (b) as a standalone browsable library for upselling/discovery. 

- Paywall: Recipe name, photo, and short description are free to view. Full step-by-step instructions require payment (₹99) or an active Pro subscription. 

Cheat day / festive recipes: 

- Festive recipes: priced below standard rate (e.g., ~₹49) or offered as a bundled "Festive Pack" to drive seasonal conversion. 

- Cheat day recipes: standard ₹99 pricing, or unlocked free as a reward after consistent adherence (streak-based gamification tie-in). Both included free within active Pro subscriptions. 

## 9. Revenue Model & Pricing 

|Offering|Price|Notes|
|---|---|---|
|One-time<br>weekly plan|₹599|Low-commitment entry<br>point|
|One-time<br>monthly<br>plan|₹1,499|No recurring commitment;<br>recipes billed separately|
|Monthly<br>subscription<br>(Pro)|₹1,299/month|Includes all recipes free|
|Yearly<br>subscription|TBD|Target: ~8–10 months'<br>equivalent of monthly rate|
|Recipe (àla<br>carte)|₹99 each|Free preview<br>(name/photo/description);<br>paid detail|
|Free trial|3 days, full<br>access|Replaces a permanent<br>free tier|



Note: The monthly subscription is intentionally priced below the one-time monthly plan and includes more value (recipes bundled). UI/UX and marketing copy should frame the one-time plan as a "no-commitment, — — cancel-anytime" premium option not a worse deal to avoid user confusion. 

Deferred decisions: Yearly subscription price; grocery delivery partnership monetization (undecided, revisit 

post-MVP). 

## 10. Tracking & Retention 

- Tracking (MVP, kept simple): Per meal, users tap one of: Ate it / Swapped it / Skipped it. No calorie counting, photo logging, or weight tracking at MVP. This data feeds directly into: 

   - The AI's meal-learning engine (Section 6.3) Gamification: streaks, challenges, and badges (e.g., adherence streaks, "tried a new cuisine" badge, "completed a cheat day within plan" badge) 

- Deeper tracking (weight, macros, photos) is a candidate for a future Pro-tier feature, not MVP. 

## 11. Platform 

- 

- MVP platform: Native mobile app iOS and Android. 

- Wearable/health app integration (Google Fit, Apple Health): undecided, to be revisited post-MVP. 

## 12. Regulatory, Privacy & Liability 

- Disclaimer approach: Explicit "not medical advice" messaging, shown (a) at the point a medical condition is entered during onboarding, and (b) each time a plan/recipe is delivered to a user with a flagged condition — not a single one-time popup. 

- Privacy & data consent: Standard privacy policy and explicit consent flow for collecting healthadjacent data (age, weight, medical conditions), aligned with India's Digital Personal Data Protection (DPDP) Act, 2023. 

- Recommendation: A single legal consultation (Indian tech/health-tech lawyer) to review disclaimer language and privacy policy before — 

- launch can run in parallel with development, not a launch blocker. 

## 13. Competitive Landscape 

## (Summary) 

|App|Model|Key Gap This App<br>Addresses|
|---|---|---|
||Freemium +|Broad/generic,|
|HealthifyMe|human coach<br>tiers|expensive at higher<br>tiers|
|Fitelo|Subscription|Higher cost due to|
||+ human|human-coach|



|App|Model|Key Gap This App<br>Addresses|
|---|---|---|
||coach|model|
|FITTR|Community-<br>driven|Community-frst,<br>not<br>personalization-<br>frst|
|Nutoriq|AI tracker +<br>meal plan<br>add-on|Tracking-frst,<br>planning is<br>secondary|
|Nutrimate|AI-only, India-<br>focused|Closest direct<br>competitor—worth<br>ongoing monitoring|



Differentiation: Fully AI-driven, plan-first (not tracker— first) product with transparent, à la carte pricing most competitors require a subscription to access core value. 

## 14. Open Items / Decisions Deferred 

- Yearly subscription price point 

- Grocery ordering/delivery partnership (undecided) Wearable/health app integration (undecided) 

- Legal review of disclaimers and privacy policy (prelaunch) 

- Additional cuisine types beyond MVP set 

- Video recipe rollout timeline 

## 15. Next Steps 

- Technical scoping session (AI knowledge base approach: static dietician-validated rules vs. future live ingestion) 

- Wireframes/UX flow for onboarding and plan generation 

- Legal consultation on disclaimers and DPDP Act compliance 

- Finalize yearly subscription pricing 

