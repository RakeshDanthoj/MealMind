import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

const steps = [
  {
    title: "Tell us your life",
    body: "Goals, routine, cooking skill, cuisines, and more — ten short questions.",
  },
  {
    title: "Get a weekly plan",
    body: "Seven days of breakfast, lunch, snack, and dinner shaped to your constraints.",
  },
  {
    title: "Adapt as you go",
    body: "Swap meals, mark don’t-like, regenerate a day, and log ate / swapped / skipped.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12 md:px-10">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--forest)] md:text-5xl">
          How it works
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--ink-muted)]">
          MealMind turns lifestyle answers into a credible weekly plan — then stays flexible when
          real life shows up.
        </p>
        <ol className="mt-12 space-y-8">
          {steps.map((step, index) => (
            <li key={step.title} className="grid gap-3 border-l-2 border-[var(--citrus)] pl-6 md:grid-cols-[80px_1fr]">
              <span className="font-[family-name:var(--font-display)] text-3xl text-[var(--forest)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="text-xl font-semibold text-[var(--ink)]">{step.title}</h2>
                <p className="mt-2 text-[var(--ink-muted)]">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </main>
      <SiteFooter />
    </div>
  );
}
