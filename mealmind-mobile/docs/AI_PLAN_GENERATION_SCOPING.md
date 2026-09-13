# MealMind — AI Static KB & Plan-Generation Scoping

Derived from `PRD_AI_Diet_Planner_App.md`, `ROADMAP.md` (P0.2), `ONBOARDING_FIRST_PLAN_UX.md`  
Status: Technical scoping for eng handoff (MVP)  
Decision locked: **static dietician-validated knowledge base** — not live web/journal ingestion

---

## 1. Purpose

Define how MealMind turns onboarding answers (+ runtime signals) into a **7-day meal plan**, and how Swap / Don't like / Regenerate / Cheat / Festive mutate that plan without breaking nutritional intent.

This doc is the contract between product and eng for the P0 personalization engine.

---

## 2. MVP architecture (recommended)

```
Onboarding profile ──┐
Runtime prefs ───────┼──► Plan Orchestrator ──► WeeklyPlan (JSON)
Avoidance list ──────┤           │
Festival calendar ───┘           ▼
                          Static Nutrition KB
                          (rules + meal catalog)
```

| Layer | Role | MVP approach |
|-------|------|--------------|
| **Meal catalog** | Discrete dishes with tags + macros + cuisine + prep | Curated DB / JSON, dietician-reviewed |
| **Rule templates** | Calorie/macro bands, meal slot rules, cuisine mix, variety | Static rules validated by dietician |
| **Orchestrator** | Select meals into 7×slots; handle mutations | Deterministic solver + optional LLM for copy/titles only |
| **Learning store** | Don't-like, swaps, skips | Per-user preference records |

**Explicit non-goal (MVP):** continuous scraping of nutrition sites/videos. KB updates = periodic content releases, not live ingestion.

**LLM policy (suggested):** use LLM for natural-language recipe steps / soft copy if needed; **do not** let an unconstrained LLM invent macros or medical claims. Nutrition numbers and eligibility come from the curated catalog + rules.

---

## 3. Inputs

### 3.1 Onboarding profile (from UX)

| Field | Type | Used for |
|-------|------|----------|
| `goal` | enum | Calorie surplus/deficit/maintain; protein bias |
| `routine` | enum | Prep complexity, snack yes/no emphasis |
| `age` | int | BMR/TDEE estimate band |
| `gender` | enum | BMR formula inputs |
| `height_cm`, `weight_kg` | number | BMR/TDEE |
| `activity` | enum | TDEE multiplier |
| `medical_conditions[]` | tags | Disclaimer path; **limited plan** mode |
| `medical_disclaimer_acked` | bool | Full vs limited personalization |
| `cooking_skill` | enum | Filter prep_complexity |
| `cuisines[]` | enum[] | Soft/hard cuisine preference |
| `allergens[]` | tags | Hard exclude |

### 3.2 Runtime / session

| Field | Type | Used for |
|-------|------|----------|
| `week_start_date` | date | Day alignment + festivals |
| `avoidance[]` | dish_id / ingredient tags | Don't-like learning |
| `cheat_days[]` | dates | Cheat rules |
| `festive_days[]` | dates | Manual festive flags |
| `recent_dish_ids[]` | ids | Variety (no same dish back-to-back) |

### 3.3 Target energy (derived)

```
BMR → TDEE (activity) → goal adjustment → daily_kcal_target
macro_split from goal (e.g. weight_loss ↑ protein)
```

Store `daily_kcal_target` and macro bands on the plan for transparency (internal; UI need not show macros in P0).

---

## 4. Static Nutrition KB

### 4.1 Meal catalog item (schema)

```json
{
  "dish_id": "ni_moong_dal_chilla",
  "name": "Moong Dal Chilla",
  "cuisines": ["north_indian", "indian_general"],
  "meal_slots": ["breakfast"],
  "ingredients": ["moong_dal", "onion", "spices"],
  "allergens": [],
  "diet_tags": ["vegetarian", "high_protein"],
  "prep_complexity": "beginner",
  "prep_minutes": 25,
  "kcal": 320,
  "protein_g": 18,
  "carbs_g": 40,
  "fat_g": 8,
  "cheat_suitable": false,
  "festive_tags": [],
  "photo_url": null,
  "recipe_preview": "Savory lentil pancakes…",
  "recipe_steps_ref": "recipes/ni_moong_dal_chilla.md",
  "active": true,
  "dietician_reviewed": true,
  "version": 1
}
```

### 4.2 Rule templates (examples)

- Daily kcal within ±10% of target across the day  
- Per-slot kcal envelopes (breakfast/lunch/snack/dinner)  
- Min protein/day by goal  
- Cuisine: ≥70% of meals from user-selected cuisines (unless catalog thin)  
- Hard exclude allergens and avoidance tags  
- Max prep_complexity ≤ user cooking_skill  
- Variety: same `dish_id` at most once per 3 days; ingredient fatigue soft penalty  
- Limited-plan mode: use `limited_safe` catalog subset; disable preference learning writes until disclaimer acked  

### 4.3 Festival calendar

Static table of Indian festivals → date (or rule) → `festive_tags` to prefer (e.g. Diwali sweets-light variants). Merge with user `festive_days[]`.

### 4.4 Content ops

- Dietician reviews catalog batches before `active=true`  
- Version catalog; plans pin `catalog_version` for reproducibility  
- Target seed size for MVP: enough to fill 7×4 slots with swaps (order-of-magnitude: **200–400 dishes** across 5 cuisine tags) — refine with dietician

---

## 5. Outputs

### 5.1 `WeeklyPlan`

```json
{
  "plan_id": "uuid",
  "user_id": "uuid",
  "week_start": "2026-09-14",
  "catalog_version": 3,
  "mode": "full",
  "daily_kcal_target": 2000,
  "macro_bands": { "protein_g": [90, 120], "carbs_g": [180, 240], "fat_g": [50, 70] },
  "days": [
    {
      "date": "2026-09-14",
      "day_index": 0,
      "flags": { "cheat": false, "festive": false, "festive_label": null },
      "meals": [
        {
          "slot": "breakfast",
          "dish_id": "ni_moong_dal_chilla",
          "name": "Moong Dal Chilla",
          "kcal": 320,
          "cuisine": "north_indian",
          "status": "planned"
        }
      ]
    }
  ],
  "generated_at": "ISO-8601",
  "generator": "static_kb_v1"
}
```

`mode`: `full` | `limited`  
`status` per meal: `planned` | `ate` | `swapped` | `skipped` (tracking)

### 5.2 Meal slots (P0 default)

Fixed: **breakfast, lunch, snack, dinner** (4 slots).  
Routine can bias snack kcal / prep_complexity, not slot count (until product reopens that decision).

---

## 6. Mutation APIs (product behavior → eng)

| Action | Input | Constraints | Output |
|--------|-------|-------------|--------|
| **Swap meal** | `plan_id`, `date`, `slot` | Same slot; preserve day kcal/protein within tolerance; respect allergens/avoidance/cuisine; ≠ current dish | New dish for that slot |
| **Don't like** | `plan_id`, `date`, `slot`, reason? | Add dish_id + primary ingredients to `avoidance[]`; then auto-swap | Updated prefs + swapped meal |
| **Regenerate day** | `plan_id`, `date` | Rebuild all slots that day; keep week targets; avoid repeating adjacent days' dishes | New day.meals |
| **Mark cheat day** | `date` | Prefer `cheat_suitable` meals; still within soft kcal cap (not unrestricted) | Day flags + optional regen |
| **Mark festive day** | `date`, label? | Prefer festive-tagged healthier variants | Day flags + optional regen |
| **Log tracking** | `date`, `slot`, `ate`/`swapped`/`skipped` | Persist only | Analytics + future weights |

All mutations return the updated `WeeklyPlan` (or day patch) and emit analytics events defined in the UX doc.

---

## 7. Limited plan mode

When `medical_conditions` non-empty AND `medical_disclaimer_acked=false`:

- `mode=limited`  
- Catalog filtered to `limited_safe` / generic calorie-band meals  
- Swaps allowed within that subset  
- **Don't-like learning deferred** (no writes to long-term avoidance) until ack  
- UI banner required (UX doc)

After ack → regenerate once into `full` mode (prompt user: "Unlock full personalization").

---

## 8. Generation algorithm (MVP sketch)

1. Compute `daily_kcal_target` + macro bands from profile  
2. Resolve day flags (cheat / festive calendar + manual)  
3. For each day × slot:  
   - Filter catalog by slot, allergens, skill, active, mode  
   - Score by cuisine match, goal tags, variety, festive/cheat affinity, avoidance penalty  
   - Pick top feasible candidate under remaining day kcal budget  
4. Rebalance pass: if day kcal outside ±10%, swap highest-error slot  
5. Persist plan with `catalog_version`

**Failure modes:** empty filter → widen cuisine → widen complexity → return `plan_generation_failed` with reason code (never blank plan UI).

---

## 9. Recipe attachment (P0 vs P1)

| | P0 | P1 |
|--|----|----|
| Preview | name, photo, short description from catalog | same |
| Full steps | stub / "coming soon" or gated flag | paywall ₹99 / Pro unlock |
| Generation | curated `recipe_steps_ref` preferred over freeform LLM | same + LLM polish optional |

---

## 10. Analytics / quality proxies

Already in UX doc; engine should also log:

- `plan_generation_latency_ms`  
- `plan_rebalance_adjustments`  
- `swap_candidate_count`  
- `filter_empty_widened` (boolean/reason)  
- Per-plan **swap rate** and **skip rate** (PRD AI quality proxy)

---

## 11. Eng deliverables checklist

- [ ] Catalog schema + seed pipeline + `dietician_reviewed` flag  
- [ ] Rule config (kcal envelopes, macros by goal, cuisine mix %)  
- [ ] Festival calendar table (India, MVP set)  
- [ ] `POST /plans/generate` from profile  
- [ ] `POST /plans/{id}/swap` / `dislike` / `regenerate-day` / `flags` / `log`  
- [ ] Limited-mode gating  
- [ ] Pin `catalog_version` on plans  
- [ ] Unit tests: allergen never served; kcal band; dislike honored on next swap  

---

## 12. Open technical decisions

| Item | Options | Suggested default |
|------|---------|-------------------|
| Solver | Pure rules vs rules + LLM rerank | Rules select dish_id; LLM only for text |
| Macro display | Hide in P0 UI vs show soft targets | Hide in UI; keep internally |
| Seed catalog size | 200 vs 400+ | Start 200, expand by cuisine gaps |
| TDEE formula | Mifflin-St Jeor vs simpler bands | Mifflin-St Jeor + activity multipliers |
| Snack optional | Drop snack if "hectic" | Keep 4 slots; shrink snack kcal if hectic |

---

## 13. Out of scope

- Live nutrition ingestion / RAG over the open web  
- Per-plan human dietician review  
- Medical condition–specific therapeutic diets  
- Wearables-driven calorie adjustment  
- Grocery packing lists  

---

## Next product / eng steps

1. Align with eng on schema + API shapes above  
2. Dietician: review seed catalog rubric + rule envelopes  
3. Frontend: bind Plan home to `WeeklyPlan` JSON  
4. Parallel: legal disclaimer final copy (P0.5)
