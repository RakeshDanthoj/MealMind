import Link from "next/link";

const links = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/privacy", label: "Privacy" },
];

export function SiteHeader() {
  return (
    <header className="relative z-20 flex items-center justify-between gap-6 px-6 py-5 md:px-10">
      <Link
        href="/onboarding"
        className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-[var(--forest)]"
      >
        MealMind
      </Link>
      <nav className="hidden items-center gap-8 text-sm text-[var(--ink-muted)] md:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="transition hover:text-[var(--forest)]"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <Link
          href="/onboarding"
          className="rounded-full bg-[var(--citrus)] px-4 py-2 text-sm font-semibold text-[var(--forest-deep)] shadow-[0_8px_24px_rgba(26,58,42,0.18)] transition hover:brightness-105"
        >
          Start questionnaire
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--forest)]/10 px-6 py-10 text-sm text-[var(--ink-muted)] md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="font-[family-name:var(--font-display)] text-lg text-[var(--forest)]">
          MealMind
        </p>
        <p>Plans that fit your life — built on dietician-validated guidelines.</p>
        <div className="flex gap-5">
          <Link href="/privacy">Privacy</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/onboarding">Questionnaire</Link>
        </div>
      </div>
    </footer>
  );
}
