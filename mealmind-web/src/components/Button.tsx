import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const styles: Record<Variant, string> = {
  primary:
    "bg-[var(--citrus)] text-[var(--forest-deep)] hover:brightness-105 shadow-[0_10px_30px_rgba(26,58,42,0.16)]",
  secondary:
    "bg-[var(--forest)] text-[var(--cream-soft)] hover:bg-[var(--forest-deep)]",
  ghost: "bg-transparent border border-[var(--forest)]/20 text-[var(--forest)] hover:bg-white/50",
  danger: "bg-[#8f2d2d] text-white hover:brightness-110",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
}) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
