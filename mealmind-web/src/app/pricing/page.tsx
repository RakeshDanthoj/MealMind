import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

const offerings = [
  {
    name: "3-day free trial",
    price: "₹0",
    note: "Full access starts when you view your first plan. No permanent free tier.",
  },
  {
    name: "Monthly Pro",
    price: "₹1,299/mo",
    note: "Includes all recipe steps and ongoing plan actions.",
  },
  {
    name: "One-time weekly plan",
    price: "₹599",
    note: "Low-commitment entry. Recipes can be unlocked separately.",
  },
  {
    name: "One-time monthly plan",
    price: "₹1,499",
    note: "Broader planning window. Recipes billed separately.",
  },
  {
    name: "Recipe à la carte",
    price: "₹99",
    note: "Unlock full step-by-step instructions for a single dish.",
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12 md:px-10">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--forest)] md:text-5xl">
          Pricing
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--ink-muted)]">
          Start with a 3-day trial. After that, keep going with Pro or a one-time plan — recipe name,
          photo, description, and ingredients stay free.
        </p>
        <div className="mt-10 grid gap-4">
          {offerings.map((item) => (
            <div
              key={item.name}
              className="flex flex-col gap-2 rounded-3xl border border-[var(--forest)]/10 bg-white/55 px-6 py-5 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <h2 className="text-lg font-semibold text-[var(--ink)]">{item.name}</h2>
                <p className="text-sm text-[var(--ink-muted)]">{item.note}</p>
              </div>
              <p className="font-[family-name:var(--font-display)] text-2xl text-[var(--forest)]">
                {item.price}
              </p>
            </div>
          ))}
        </div>
        <Link
          href="/auth?mode=signup"
          className="mt-10 inline-flex rounded-full bg-[var(--citrus)] px-6 py-3 text-sm font-semibold text-[var(--forest-deep)]"
        >
          Start free trial
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
