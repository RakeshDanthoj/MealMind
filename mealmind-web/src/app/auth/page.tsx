import { Suspense } from "react";
import AuthPage from "./AuthClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10 text-[var(--ink-muted)]">Loading…</div>}>
      <AuthPage />
    </Suspense>
  );
}
