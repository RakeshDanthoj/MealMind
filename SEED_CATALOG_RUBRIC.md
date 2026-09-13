# MealMind — Seed Catalog Rubric (Dietician Review)

Derived from `AI_PLAN_GENERATION_SCOPING.md`  
Audience: dietician + content ops + eng  
Goal: Approve a **~200-dish** MVP seed catalog that can fill 7 days × 4 slots with swaps across 5 cuisine tags

---

## 1. Why this exists

The plan engine only serves dishes from a curated catalog. Nutrition numbers and eligibility must be **dietician-validated** before `active=true`. This rubric defines what "good enough for MVP seed" means.

---

## 2. Coverage targets (MVP seed)

| Dimension | Target |
|-----------|--------|
| Total active dishes | **200** minimum (stretch 300–400) |
| Cuisines | Indian (general), North Indian, South Indian, Chinese (Indo-Chinese), Asian — each with enough breakfast/lunch/snack/dinner options for a full week + swaps |
| Slots | Every dish tagged to ≥1 of: breakfast, lunch, snack, dinner |
| Prep complexity | Mix of beginner / comfortable / advanced (skew beginner+comfortable for hectic users) |
| Diet tags | Enough vegetarian coverage for India-default; include egg/non-veg clearly tagged |
| Limited-safe subset | ≥40 generic calorie-band meals marked `limited_safe` for unacked medical mode |
| Cheat-suitable | ≥15 dishes (still within soft kcal — not junk free-for-all) |
| Festive-tagged | ≥20 healthier festive variants (Diwali, Eid, Onam, Holi, Christmas, Pongal — MVP set) |

**Balance rule of thumb:** for each cuisine × slot, aim for ≥5 dishes so Swap rarely empties the filter.

---

## 3. Required fields (review checklist per dish)

Every catalog row must have:

- [ ] `dish_id` (stable snake_case)
- [ ] `name` (user-facing, India-recognizable where possible)
- [ ] `cuisines[]`
- [ ] `meal_slots[]`
- [ ] `ingredients[]` (primary allergens-relevant list)
- [ ] `allergens[]` (empty array if none)
- [ ] `diet_tags[]` (e.g. vegetarian, high_protein, low_oil)
- [ ] `prep_complexity` + `prep_minutes`
- [ ] `kcal`, `protein_g`, `carbs_g`, `fat_g` (per standard serving)
- [ ] `cheat_suitable` (bool)
- [ ] `festive_tags[]` (or empty)
- [ ] `limited_safe` (bool)
- [ ] `recipe_preview` (1–2 sentences)
- [ ] `dietician_reviewed` = true only after this rubric pass
- [ ] Serving definition noted (e.g. "1 plate / 300g cooked")

Photo and full recipe steps can lag; preview text is required for P0 UI.

---

## 4. Nutrition validation rules

| Check | Pass criteria |
|-------|----------------|
| Serving clarity | Macros match a defined serving; no "as eaten vaguely" |
| Plausibility | Kcal ≈ 4P+4C+9F within ±10% |
| Slot fit | Breakfast typically lighter than lunch/dinner unless goal says otherwise |
| Goal utility | High-protein options exist for muscle gain / weight loss |
| Oil/sodium | Flag deep-fried as cheat or exclude from limited_safe |
| Medical limited_safe | No extreme elimination claims; generic balanced plates only — **not** condition-specific therapy |

**Hard product rule:** catalog must not claim to treat diabetes, PCOS, kidney disease, pregnancy, etc.

---

## 5. Exclusion / quality bar

Reject or fix if:

- Vague name ("Healthy bowl") with no cultural/cuisine anchor  
- Missing allergen for obvious ingredients (peanut, dairy, gluten, shellfish, egg, soy, tree nut)  
- Duplicate near-identical dishes without meaningful difference  
- Macros clearly wrong (e.g. 100 kcal butter chicken serving)  
- Recipe preview promises medical outcomes  

---

## 6. Review workflow

1. Content ops drafts batch (CSV/JSON) by cuisine  
2. Dietician reviews batch against this rubric  
3. Eng imports only rows with `dietician_reviewed=true`  
4. Bump `catalog_version`  
5. Spot-test: generate plans for 3 personas (hectic weight-loss North Indian; gym muscle-gain mixed cuisine; beginner South Indian vegetarian) — check empty-filter rate and swap depth  

**Batch size suggestion:** 40–50 dishes per review round.

---

## 7. Persona smoke tests (acceptance)

| Persona | Must succeed |
|---------|----------------|
| Hectic, weight loss, North Indian, beginner | 7×4 plan; snack kcal smaller; mostly beginner prep |
| Muscle gain, mixed cuisines, advanced | Higher protein days; variety across cuisines |
| Vegetarian, South Indian, allergens: dairy | Zero dairy dishes; South Indian ≥70% |
| Medical flag, disclaimer not acked | Only `limited_safe` dishes; mode=limited |

---

## 8. Festive MVP set (initial)

Tag healthier variants for: **Diwali, Holi, Eid, Onam, Pongal, Christmas** (add regional later).  
Festive dishes stay within soft kcal; prefer baked/roasted/lighter traditional variants.

---

## 9. Deliverable from dietician

- Signed-off seed file (CSV or JSON) meeting coverage targets  
- Short note on rule envelopes they endorse (daily kcal ±10%, protein mins by goal)  
- List of gaps to fill in v2 (e.g. more Indo-Chinese breakfasts)

---

## 10. Out of scope for seed

- Therapeutic medical menus  
- Video recipes  
- Continental / Jain / full vegan lines (P2)  
- Live scraped recipes  

---

## Owner handoff

| Role | Owns |
|------|------|
| Product | Coverage targets + persona tests |
| Dietician | Nutrition truth + limited_safe + festive appropriateness |
| Content ops | Naming, previews, photos pipeline |
| Eng | Schema import, versioning, generator tests |
