import { redirect } from "next/navigation";

/** MVP: auth is deferred — send users into the questionnaire. */
export default function AuthPage() {
  redirect("/onboarding");
}
