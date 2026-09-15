"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/plan", label: "Plan" },
  { href: "/library", label: "Library" },
  { href: "/progress", label: "Progress" },
  { href: "/profile", label: "Profile" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-30 border-t border-[var(--forest)]/10 bg-[var(--cream-soft)]/95 backdrop-blur md:bottom-auto md:top-0 md:border-b md:border-t-0">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/plan" className="hidden font-[family-name:var(--font-display)] text-xl text-[var(--forest)] md:block">
          MealMind
        </Link>
        <div className="flex w-full items-center justify-around md:w-auto md:gap-2">
          {tabs.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  active
                    ? "bg-[var(--forest)] text-[var(--cream-soft)]"
                    : "text-[var(--ink-muted)] hover:text-[var(--forest)]"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
