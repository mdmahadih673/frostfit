import type { Metadata } from "next";

import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Create account | FrostFit",
  description: "Create your FrostFit account to save layers, track orders, and hear about winter drops first.",
};

export default function SignUpPage() {
  return <SignUpForm />;
}
