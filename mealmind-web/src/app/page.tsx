import { redirect } from "next/navigation";

/** MVP: skip marketing/login and go straight to the questionnaire. */
export default function HomePage() {
  redirect("/onboarding");
}
