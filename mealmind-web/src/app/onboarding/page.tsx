"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { useApp } from "@/context/AppContext";
import {
  ACTIVITY_OPTIONS,
  COMMON_ALLERGENS,
  COMMON_MEDICAL_CONDITIONS,
  COOKING_SKILL_OPTIONS,
  CUISINE_OPTIONS,
  GENDER_OPTIONS,
  GOAL_OPTIONS,
  ONBOARDING_STEPS,
  ROUTINE_OPTIONS,
  TOTAL_ONBOARDING_STEPS,
} from "@/constants/onboarding";
import type {
  ActivityLevel,
  CookingSkill,
  CuisineType,
  DailyRoutine,
  Gender,
  PrimaryGoal,
  UserProfile,
} from "@/types";

export default function OnboardingPage() {
  const router = useRouter();
  const { saveOnboarding, ensureGuestSession, ready } = useApp();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  // Start blank like the mobile questionnaire (don't pre-select empty-profile defaults).
  const [answers, setAnswers] = useState<Partial<UserProfile>>({
    medical_conditions: [],
    allergens: [],
    cuisines: [],
  });

  useEffect(() => {
    if (ready) ensureGuestSession();
  }, [ready, ensureGuestSession]);

  const current = ONBOARDING_STEPS[step];
  const progressLabel = useMemo(
    () => `${step + 1}/${TOTAL_ONBOARDING_STEPS}`,
    [step]
  );

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
        return (answers.age || 0) > 0;
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
      case "cuisines":
        return (answers.cuisines?.length || 0) >= 1;
      case "allergens":
        return true;
      default:
        return false;
    }
  }

  function finish() {
    setLoading(true);
    saveOnboarding(answers);
    const hasMedical = (answers.medical_conditions?.length || 0) > 0;
    router.push(hasMedical ? "/medical-disclaimer" : "/generating-plan");
  }

  function next() {
    if (step === TOTAL_ONBOARDING_STEPS - 1) {
      finish();
      return;
    }
    setStep((s) => s + 1);
  }

  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  function toggleNoneOrList(
    field: "medical_conditions" | "allergens",
    value: string,
    noneSelected: boolean
  ) {
    const currentList = answers[field] || [];
    if (value === "none") {
      patch({ [field]: [] });
      return;
    }
    if (noneSelected || currentList.length === 0) {
      patch({ [field]: [value] });
      return;
    }
    const active = currentList.includes(value);
    patch({
      [field]: active
        ? currentList.filter((item) => item !== value)
        : [...currentList, value],
    });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-6 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="text-sm font-medium text-[var(--forest)] disabled:opacity-40"
        >
          ← Back
        </button>
        <span className="text-sm text-[var(--ink-muted)]">{progressLabel}</span>
      </div>

      <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-[var(--forest)]/10">
        <div
          className="h-full rounded-full bg-[var(--citrus)] transition-all"
          style={{ width: `${((step + 1) / TOTAL_ONBOARDING_STEPS) * 100}%` }}
        />
      </div>

      <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--forest)]">
        {current.title}
      </h1>
      <p className="mt-2 text-[var(--ink-muted)]">{current.subtitle}</p>

      <div className="mt-8 flex-1 space-y-3">
        {current.key === "goal" && (
          <ChoiceList
            options={GOAL_OPTIONS}
            value={answers.goal}
            onChange={(v) => patch({ goal: v as PrimaryGoal })}
          />
        )}
        {current.key === "routine" && (
          <ChoiceList
            options={ROUTINE_OPTIONS}
            value={answers.routine}
            onChange={(v) => patch({ routine: v as DailyRoutine })}
          />
        )}
        {current.key === "age" && (
          <input
            type="number"
            min={1}
            max={120}
            inputMode="numeric"
            placeholder="Enter your age"
            value={answers.age || ""}
            onChange={(e) => patch({ age: Number(e.target.value) || 0 })}
            className="w-full rounded-2xl border border-[var(--forest)]/15 bg-white/70 px-4 py-4 text-center text-lg"
          />
        )}
        {current.key === "gender" && (
          <ChoiceList
            options={GENDER_OPTIONS}
            value={answers.gender}
            onChange={(v) => patch({ gender: v as Gender })}
          />
        )}
        {current.key === "body" && (
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium text-[var(--ink)]">
              Height
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  placeholder="170"
                  value={answers.height_cm || ""}
                  onChange={(e) =>
                    patch({ height_cm: Number(e.target.value) || 0 })
                  }
                  className="w-full rounded-2xl border border-[var(--forest)]/15 bg-white/70 px-4 py-3 text-center"
                />
                <span className="text-[var(--ink-muted)]">cm</span>
              </div>
            </label>
            <label className="text-sm font-medium text-[var(--ink)]">
              Weight
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  placeholder="70"
                  value={answers.weight_kg || ""}
                  onChange={(e) =>
                    patch({ weight_kg: Number(e.target.value) || 0 })
                  }
                  className="w-full rounded-2xl border border-[var(--forest)]/15 bg-white/70 px-4 py-3 text-center"
                />
                <span className="text-[var(--ink-muted)]">kg</span>
              </div>
            </label>
          </div>
        )}
        {current.key === "activity" && (
          <ChoiceList
            options={ACTIVITY_OPTIONS}
            value={answers.activity}
            onChange={(v) => patch({ activity: v as ActivityLevel })}
          />
        )}
        {current.key === "medical" && (
          <div className="space-y-3">
            <ChipGroup
              options={[
                { value: "none", label: "None" },
                ...COMMON_MEDICAL_CONDITIONS.map((c) => ({
                  value: c.toLowerCase(),
                  label: c,
                })),
              ]}
              selected={
                (answers.medical_conditions || []).length === 0
                  ? ["none"]
                  : answers.medical_conditions || []
              }
              onToggle={(value) =>
                toggleNoneOrList(
                  "medical_conditions",
                  value,
                  (answers.medical_conditions || []).length === 0
                )
              }
            />
            <p className="text-sm italic text-[var(--ink-muted)]">
              Select &quot;None&quot; if you don&apos;t have any medical conditions
            </p>
          </div>
        )}
        {current.key === "cooking" && (
          <ChoiceList
            options={COOKING_SKILL_OPTIONS}
            value={answers.cooking_skill}
            onChange={(v) => patch({ cooking_skill: v as CookingSkill })}
          />
        )}
        {current.key === "cuisines" && (
          <ChipGroup
            options={CUISINE_OPTIONS.map((c) => ({
              value: c.value,
              label: c.label,
            }))}
            selected={answers.cuisines || []}
            onToggle={(value) => {
              const selected = answers.cuisines || [];
              const active = selected.includes(value as CuisineType);
              patch({
                cuisines: active
                  ? selected.filter((c) => c !== value)
                  : [...selected, value as CuisineType],
              });
            }}
          />
        )}
        {current.key === "allergens" && (
          <ChipGroup
            options={[
              { value: "none", label: "None" },
              ...COMMON_ALLERGENS.map((a) => ({
                value: a.toLowerCase(),
                label: a,
              })),
            ]}
            selected={
              (answers.allergens || []).length === 0
                ? ["none"]
                : answers.allergens || []
            }
            onToggle={(value) =>
              toggleNoneOrList(
                "allergens",
                value,
                (answers.allergens || []).length === 0
              )
            }
          />
        )}
      </div>

      <div className="mt-8 border-t border-[var(--forest)]/10 pt-6">
        <Button
          type="button"
          className="w-full"
          disabled={!canContinue() || loading}
          onClick={next}
        >
          {step === TOTAL_ONBOARDING_STEPS - 1 ? "Generate my plan" : "Continue"}
        </Button>
      </div>
    </div>
  );
}

function ChoiceList({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string; description?: string }[];
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-2xl border px-4 py-3 text-left transition ${
              selected
                ? "border-[var(--forest)] bg-[var(--forest)] text-[var(--cream-soft)]"
                : "border-[var(--forest)]/15 bg-white/60 hover:border-[var(--forest)]/40"
            }`}
          >
            <span className="block font-medium">{option.label}</span>
            {option.description && (
              <span
                className={`mt-0.5 block text-sm ${
                  selected ? "text-white/80" : "text-[var(--ink-muted)]"
                }`}
              >
                {option.description}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onToggle(option.value)}
            className={`rounded-full px-4 py-2 text-sm transition ${
              active
                ? "bg-[var(--forest)] text-[var(--cream-soft)]"
                : "border border-[var(--forest)]/15 bg-white/70 text-[var(--ink)]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
