import { redirect } from "next/navigation";

/** MVP: privacy consent is deferred; questionnaire is the entry point. */
export default function PrivacyConsentPage() {
  redirect("/onboarding");
}
