import type { Metadata } from "next";

import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in | FrostFit",
  description: "Sign in to your FrostFit account to track orders, save layers, and access winter drops first.",
};

export default function SignInPage() {
  const showDemoAccounts = process.env.NODE_ENV !== "production" && process.env.DEMO_SIGN_IN_ENABLED === "true";
  return <SignInForm showDemoAccounts={showDemoAccounts} />;
}
