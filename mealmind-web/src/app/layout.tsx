import type { Metadata } from "next";
import { Fraunces, Sora } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Sora({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MealMind — Plans that fit your life",
  description:
    "AI-powered personalized nutrition built on dietician-validated guidelines. Weekly meal plans that fit your routine.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
