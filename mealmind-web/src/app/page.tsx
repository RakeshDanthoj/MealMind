import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="relative flex-1 overflow-hidden">
        <section className="relative mx-auto grid min-h-[78vh] max-w-6xl items-center gap-10 px-6 pb-16 pt-6 md:grid-cols-[1.05fr_0.95fr] md:px-10">
          <div className="relative z-10 max-w-xl">
            <p className="mb-4 font-[family-name:var(--font-display)] text-5xl leading-[0.95] tracking-tight text-[var(--forest)] md:text-7xl">
              MealMind
            </p>
            <h1 className="max-w-md text-2xl font-medium leading-snug text-[var(--ink)] md:text-3xl">
              Plans that fit your life.
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--ink-muted)] md:text-lg">
              AI-powered personalized nutrition, built on dietician-validated guidelines — from
              onboarding to your first weekly plan in minutes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/auth?mode=signup"
                className="rounded-full bg-[var(--citrus)] px-6 py-3 text-sm font-semibold text-[var(--forest-deep)] shadow-[0_12px_32px_rgba(26,58,42,0.18)]"
              >
                Start your plan
              </Link>
              <Link
                href="/how-it-works"
                className="rounded-full border border-[var(--forest)]/20 px-6 py-3 text-sm text-[var(--forest)]"
              >
                How it works
              </Link>
            </div>
          </div>

          <div
            aria-hidden
            className="relative h-[420px] overflow-hidden rounded-[2rem] bg-[linear-gradient(145deg,#1f4d3a_0%,#2f6a4f_45%,#d7e35a_140%)] shadow-[0_30px_80px_rgba(18,48,40,0.28)] md:h-[520px]"
          >
            <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_20%,#fff8_0,transparent_35%),radial-gradient(circle_at_80%_70%,#d7e35a55_0,transparent_40%)]" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-[var(--cream-soft)]">
              <p className="font-[family-name:var(--font-display)] text-3xl">Your week, ready.</p>
              <p className="mt-2 max-w-sm text-sm text-white/80">
                Breakfast through dinner — swap, skip, or regenerate around your real life.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
