"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { authClient } from "@/lib/auth-client";
import { SIGN_UP_ROLES, USER_ROLES } from "@/lib/user-roles";

import { useAuthRole } from "./auth-role-context";
import { FormField, inputClassName, submitButtonClassName } from "./form-field";
import { PasswordInput } from "./password-input";

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { role, setRole } = useAuthRole();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    console.log("Sign-up form submitted:", {
      name,
      email,
      role,
    });

    try {
      const { data, error: signUpError } = await authClient.signUp.email({
        name,
        email,
        password,
        role,
        callbackURL: "/",
      });

      console.log("Sign-up response:", data);
      console.log("Sign-up error:", signUpError);

      if (signUpError) {
        setError(signUpError.message ?? "Could not create your account. Please try again.");
        return;
      }

      if (data) {
        setPassword("");
        router.push("/");
        router.refresh();
      }
    } catch (signUpError) {
      console.error("Sign-up failed:", signUpError);
      setError("Could not create your account. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div>
      <p className="caption-3 uppercase tracking-[0.18em] text-[#6f746e]">Join FrostFit</p>
      <div role="group" aria-label="Choose account type" className="mt-6 grid grid-cols-2 rounded-full bg-[#e9e9e5] p-1">
        {SIGN_UP_ROLES.map((signupRole) => {
          const isSelected = role === signupRole;

          return (
            <button
              key={signupRole}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setRole(signupRole)}
              className={`caption-4 min-h-11 rounded-full px-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d2c27] ${
                isSelected ? "bg-[#1d2c27] text-white shadow-sm" : "text-[#626761] hover:text-[#1d2c27]"
              }`}
            >
              {signupRole === USER_ROLES.customer ? "Customer" : "Seller"}
            </button>
          );
        })}
      </div>

      <section aria-live="polite">
        <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.055em] text-balance sm:text-5xl">
          Create {role === USER_ROLES.customer ? "customer" : "seller"} account
        </h1>
        <p className="body-6 mt-4 text-pretty text-[#626761]">
          {role === USER_ROLES.customer
            ? "Save your layers, track orders, and hear about winter drops first."
            : "Create your seller account to showcase your products and manage your store."}
        </p>
      </section>

      <form onSubmit={handleSubmit} className="mt-9 space-y-5">
        <FormField id="name" label="Full name">
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Ada Frost"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClassName}
          />
        </FormField>

        <FormField id="email" label="Email">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@winterwear.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClassName}
          />
        </FormField>

        <FormField id="password" label="Password" hint="At least 8 characters.">
          <PasswordInput
            id="password"
            name="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            placeholder="••••••••"
            required
            minLength={8}
            describedBy="password-hint"
          />
        </FormField>

        <label className="caption-4 flex items-start gap-2.5 text-[#626761]">
          <input type="checkbox" name="terms" required className="mt-0.5 size-4 rounded border-[#d8d8d2] accent-[#1d2c27]" />
          <span>
            I agree to the{" "}
            <a href="#" className="text-[#1d2c27] underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]">
              terms
            </a>{" "}
            and{" "}
            <a href="#" className="text-[#1d2c27] underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]">
              privacy policy
            </a>
            .
          </span>
        </label>

        <button type="submit" disabled={isPending} className={`${submitButtonClassName} disabled:cursor-not-allowed disabled:opacity-60`}>
          {isPending ? "Creating account…" : `Create ${role} account`}
        </button>
      </form>

      {error ? (
        <p role="alert" className="body-6 mt-5 rounded-2xl border border-[#b3261e]/30 bg-[#b3261e]/5 px-4 py-3 text-[#b3261e]">
          {error}
        </p>
      ) : null}

      <p className="body-6 mt-8 text-center text-[#626761]">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-[#1d2c27] underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]">
          Sign in
        </Link>
      </p>
    </div>
  );
}
