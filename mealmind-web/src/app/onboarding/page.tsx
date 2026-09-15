"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { useApp } from "@/context/AppContext";
import type {
  ActivityLevel,
  CookingSkill,
  CuisineType,
  DailyRoutine,
  DietType,
  Gender,
  MeatAvoid,
  PrimaryGoal,
  UserProfile,
} from "@/types";

type StepKey =
  | "goal"
  | "routine"
  | "age"
  | "gender"
  | "body"
  | "activity"
  | "medical"
  | "cooking"
  | "diet"
  | "cuisines"
  | "allergens";

const STEPS: { key: StepKey; title: string }[] = [
  { key: "goal", title: "What’s your primary goal?" },
  { key: "routine", title: "How hectic is your day?" },
  { key: "age", title: "How old are you?" },
  { key: "gender", title: "Gender" },
  { key: "body", title: "Height & weight" },
  { key: "activity", title: "Activity level" },
  { key: "medical", title: "Any medical conditions?" },
  { key: "cooking", title: "Cooking skill" },
  { key: "diet", title: "Dietary preference" },
  { key: "cuisines", title: "Cuisine preferences" },
  { key: "allergens", title: "Allergens to avoid" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { saveOnboarding, profile } = useApp();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<UserProfile>>({
    goal: profile?.goal,
    routine: profile?.routine,
    age: profile?.age || 30,
    gender: profile?.gender,
    height_cm: profile?.height_cm || 170,
    weight_kg: profile?.weight_kg || 70,
    activity: profile?.activity,
    medical_conditions: profile?.medical_conditions || [],
    cooking_skill: profile?.cooking_skill,
    diet_type: profile?.diet_type || "vegetarian",
    meats_avoided: profile?.meats_avoided || [],
    cuisines: profile?.cuisines || [],
    allergens: profile?.allergens || [],
  });
  const [medicalInput, setMedicalInput] = useState("");
  const [allergenInput, setAllergenInput] = useState("");

  const current = STEPS[step];
  const progress = useMemo(() => `${step + 1}/${STEPS.length}`, [step]);

  function patch(p: Partial<UserProfile>) {
    setAnswers((prev) => ({ ...prev, ...p }));
  }

  function canContinue() {
    switch (current.key) {
      case "goal":
        return Boolean(answers.goal);
      case "routine":
        return Boolean(answers.routine);
      case "age":
        return (answers.age || 0) >= 13;
      case "gender":
        return Boolean(answers.gender);
      case "body":
        return (answers.height_cm || 0) > 0 && (answers.weight_kg || 0) > 0;
      case "activity":
        return Boolean(answers.activity);
      case "medical":
        return true;
      case "cooking":
        return Boolean(answers.cooking_skill);
      case "diet":
        return Boolean(answers.diet_type);
      case "cuisines":
        return (answers.cuisines?.length || 0) >= 1;
      case "allergens":
        return true;
      default:
        return false;
    }
  }

  function finish() {
    saveOnboarding(answers);
    const hasMedical = (answers.medical_conditions?.length || 0) > 0;
    if (hasMedical) {
      router.push("/medical-disclaimer");
    } else {
      router.push("/generating-plan");
    }
  }

  function next() {
    if (step === STEPS.length - 1) {
      finish();
      return;
    }
    setStep((s) => s + 1);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-6 py-10">
      <div className="mb-8 flex items-center justify-between text-sm text-[var(--ink-muted)]">
        <span>Onboarding</span>
        <span>{progress}</span>
      </div>
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-[var(--forest)]/10">
        <div
          className="h-full rounded-full bg-[var(--citrus)] transition-all"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--forest)]">
        {current.title}
      </h1>

      <div className="mt-8 flex-1 space-y-3">
        {current.key === "goal" && (
          <ChoiceGrid
            options={[
              ["healthy_lifestyle", "Healthy lifestyle"],
              ["weight_loss", "Weight loss"],
              ["muscle_gain", "Muscle gain"],
              ["maintenance", "Maintenance"],
              ["other", "Other"],
            ]}
            value={answers.goal}
            onChange={(v) => patch({ goal: v as PrimaryGoal })}
          />
        )}
        {current.key === "routine" && (
          <ChoiceGrid
            options={[
              ["hectic", "Hectic"],
              ["some_time", "Some time"],
              ["flexible", "Flexible"],
            ]}
            value={answers.routine}
            onChange={(v) => patch({ routine: v as DailyRoutine })}
          />
        )}
        {current.key === "age" && (
          <input
            type="number"
            min={13}
            max={100}
            value={answers.age || ""}
            onChange={(e) => patch({ age: Number(e.target.value) })}
            className="w-full rounded-2xl border border-[var(--forest)]/15 bg-white/70 px-4 py-3"
          />
        )}
        {current.key === "gender" && (
          <ChoiceGrid
            options={[
              ["male", "Male"],
              ["female", "Female"],
              ["other", "Other"],
              ["prefer_not_to_say", "Prefer not to say"],
            ]}
            value={answers.gender}
            onChange={(v) => patch({ gender: v as Gender })}
          />
        )}
        {current.key === "body" && (
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              Height (cm)
              <input
                type="number"
                value={answers.height_cm || ""}
                onChange={(e) => patch({ height_cm: Number(e.target.value) })}
                className="mt-1 w-full rounded-2xl border border-[var(--forest)]/15 bg-white/70 px-4 py-3"
              />
            </label>
            <label className="text-sm">
              Weight (kg)
              <input
                type="number"
                value={answers.weight_kg || ""}
                onChange={(e) => patch({ weight_kg: Number(e.target.value) })}
                className="mt-1 w-full rounded-2xl border border-[var(--forest)]/15 bg-white/70 px-4 py-3"
              />
            </label>
          </div>
        )}
        {current.key === "activity" && (
          <ChoiceGrid
            options={[
              ["sedentary", "Sedentary"],
              ["lightly_active", "Lightly active"],
              ["moderately_active", "Moderately active"],
              ["very_active", "Very active"],
            ]}
            value={answers.activity}
            onChange={(v) => patch({ activity: v as ActivityLevel })}
          />
        )}
        {current.key === "medical" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                value={medicalInput}
                onChange={(e) => setMedicalInput(e.target.value)}
                placeholder="e.g. diabetes, PCOS"
                className="flex-1 rounded-2xl border border-[var(--forest)]/15 bg-white/70 px-4 py-3"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (!medicalInput.trim()) return;
                  patch({
                    medical_conditions: [
                      ...(answers.medical_conditions || []),
                      medicalInput.trim(),
                    ],
                  });
                  setMedicalInput("");
                }}
              >
                Add
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => patch({ medical_conditions: [] })}
            >
              None
            </Button>
            <ChipList
              items={answers.medical_conditions || []}
              onRemove={(item) =>
                patch({
                  medical_conditions: (answers.medical_conditions || []).filter((x) => x !== item),
                })
              }
            />
          </div>
        )}
        {current.key === "cooking" && (
          <ChoiceGrid
            options={[
              ["beginner", "Beginner"],
              ["comfortable", "Comfortable"],
              ["advanced", "Advanced"],
            ]}
            value={answers.cooking_skill}
            onChange={(v) => patch({ cooking_skill: v as CookingSkill })}
          />
        )}
        {current.key === "diet" && (
          <div className="space-y-4">
            <ChoiceGrid
              options={[
                ["vegetarian", "Vegetarian"],
                ["eggetarian", "Eggetarian"],
                ["non_vegetarian", "Non-vegetarian"],
              ]}
              value={answers.diet_type}
              onChange={(v) => patch({ diet_type: v as DietType })}
            />
            {answers.diet_type === "non_vegetarian" && (
              <MultiChoice
                label="I don’t eat"
                options={[
                  ["beef", "Beef"],
                  ["pork", "Pork"],
                  ["mutton", "Mutton"],
                  ["seafood", "Seafood"],
                ]}
                values={answers.meats_avoided || []}
                onChange={(values) => patch({ meats_avoided: values as MeatAvoid[] })}
              />
            )}
          </div>
        )}
        {current.key === "cuisines" && (
          <MultiChoice
            options={[
              ["indian_general", "Indian (general)"],
              ["north_indian", "North Indian"],
              ["south_indian", "South Indian"],
              ["chinese", "Chinese"],
              ["asian", "Asian"],
            ]}
            values={answers.cuisines || []}
            onChange={(values) => patch({ cuisines: values as CuisineType[] })}
          />
        )}
        {current.key === "allergens" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                value={allergenInput}
                onChange={(e) => setAllergenInput(e.target.value)}
                placeholder="e.g. peanuts, dairy"
                className="flex-1 rounded-2xl border border-[var(--forest)]/15 bg-white/70 px-4 py-3"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (!allergenInput.trim()) return;
                  patch({
                    allergens: [...(answers.allergens || []), allergenInput.trim().toLowerCase()],
                  });
                  setAllergenInput("");
                }}
              >
                Add
              </Button>
            </div>
            <ChipList
              items={answers.allergens || []}
              onRemove={(item) =>
                patch({ allergens: (answers.allergens || []).filter((x) => x !== item) })
              }
            />
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        <Button
          type="button"
          variant="ghost"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Back
        </Button>
        <Button type="button" className="flex-1" disabled={!canContinue()} onClick={next}>
          {step === STEPS.length - 1 ? "Generate my plan" : "Continue"}
        </Button>
      </div>
    </div>
  );
}

function ChoiceGrid({
  options,
  value,
  onChange,
}: {
  options: [string, string][];
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      {options.map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`rounded-2xl border px-4 py-3 text-left transition ${
            value === id
              ? "border-[var(--forest)] bg-[var(--forest)] text-[var(--cream-soft)]"
              : "border-[var(--forest)]/15 bg-white/60 hover:border-[var(--forest)]/40"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function MultiChoice({
  options,
  values,
  onChange,
  label,
}: {
  options: [string, string][];
  values: string[];
  onChange: (values: string[]) => void;
  label?: string;
}) {
  return (
    <div className="space-y-2">
      {label && <p className="text-sm text-[var(--ink-muted)]">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map(([id, text]) => {
          const active = values.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() =>
                onChange(active ? values.filter((v) => v !== id) : [...values, id])
              }
              className={`rounded-full px-4 py-2 text-sm ${
                active
                  ? "bg-[var(--forest)] text-[var(--cream-soft)]"
                  : "bg-white/70 text-[var(--ink)] border border-[var(--forest)]/15"
              }`}
            >
              {text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChipList({ items, onRemove }: { items: string[]; onRemove: (item: string) => void }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onRemove(item)}
          className="rounded-full bg-[var(--sage)] px-3 py-1 text-sm text-[var(--forest)]"
        >
          {item} ×
        </button>
      ))}
    </div>
  );
}
