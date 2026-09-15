import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 md:px-10">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--forest)] md:text-5xl">
          Privacy policy
        </h1>
        <div className="mt-8 space-y-5 text-[var(--ink-muted)] leading-relaxed">
          <p>
            MealMind collects the information you provide during onboarding — age, height, weight,
            activity, optional medical conditions, allergens, and food preferences — to generate
            personalized weekly meal plans.
          </p>
          <p>
            We process this data under India&apos;s Digital Personal Data Protection (DPDP) principles.
            You can withdraw consent and request deletion from your profile settings.
          </p>
          <p>
            Payment details are handled by Razorpay. MealMind does not store full card numbers.
            Recipe unlocks and subscriptions are granted only after verified payment webhooks.
          </p>
          <p>
            This app does not provide medical advice. If you have medical conditions, consult your
            doctor before following any plan.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
