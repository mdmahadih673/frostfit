"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { authClient } from "@/lib/auth-client";
import { signInWithDemoAccount, type DemoAccountRole } from "@/lib/api/auth/demo-sign-in";

import { FormField, inputClassName, submitButtonClassName } from "./form-field";
import { PasswordInput } from "./password-input";

export function SignInForm({ showDemoAccounts = false }: { showDemoAccounts?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const { data, error: signInError } = await authClient.signIn.email({
        email: email.trim(),
        password,
        callbackURL: "/dashboard",
      });

      if (signInError) {
        setError(signInError.message ?? "Could not sign in. Check your email and password, then try again.");
        return;
      }

      if (data) {
        setPassword("");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (signInError) {
      setError(
        signInError instanceof Error
          ? signInError.message
          : "Could not sign in. Please try again.",
      );
    } finally {
      setIsPending(false);
    }
  }

  async function handleDemoSignIn(role: DemoAccountRole) {
    setError(null);
    setIsPending(true);
    try {
      await signInWithDemoAccount(role);
      router.push("/dashboard");
      router.refresh();
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : "Could not sign in with this demo account.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div>
      <p className="caption-3 uppercase tracking-[0.18em] text-[#6f746e]">Welcome back</p>
      <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.055em] text-balance sm:text-5xl">Sign in</h1>
      <p className="body-6 mt-4 text-pretty text-[#626761]">Enter your details to access your account, orders, and saved layers.</p>

      <form onSubmit={handleSubmit} className="mt-9 space-y-5">
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

        <FormField
          id="password"
          label="Password"
          action={
            <Link href="/forgot-password" className="caption-4 text-[#6f746e] transition-colors duration-300 hover:text-[#1d2c27] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]">
              Forgot password?
            </Link>
          }
        >
          <PasswordInput
            id="password"
            name="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
        </FormField>

        <label className="caption-4 flex items-center gap-2.5 text-[#626761]">
          <input type="checkbox" name="remember" className="size-4 rounded border-[#d8d8d2] accent-[#1d2c27]" />
          Remember me
        </label>

        <button type="submit" disabled={isPending} className={`${submitButtonClassName} disabled:cursor-not-allowed disabled:opacity-60`}>
          {isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {showDemoAccounts && <div className="mt-6">
        <div className="relative flex items-center" aria-hidden="true">
          <span className="h-px flex-1 bg-[#e4e7e2]" />
          <span className="px-3 text-xs text-[#8a8f89]">Or continue as</span>
          <span className="h-px flex-1 bg-[#e4e7e2]" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {([
            ["customer", "Customer"],
            ["seller", "Seller"],
            ["admin", "Admin"],
          ] as const).map(([role, label]) => (
            <button
              key={role}
              type="button"
              disabled={isPending}
              onClick={() => void handleDemoSignIn(role)}
              className="rounded-full border border-[#d8ddd8] bg-white px-2 py-2.5 text-sm font-medium text-[#1d2c27] transition hover:border-[#1d2c27] hover:bg-[#f1f3f0] disabled:cursor-wait disabled:opacity-50"
            >
              {isPending ? "Signing in…" : label}
            </button>
          ))}
        </div>
      </div>}

      {error ? (
        <p role="alert" aria-live="polite" className="body-6 mt-5 rounded-2xl border border-[#b3261e]/30 bg-[#b3261e]/5 px-4 py-3 text-[#b3261e]">
          {error}
        </p>
      ) : null}

      <p className="body-6 mt-8 text-center text-[#626761]">
        New to FrostFit?{" "}
        <Link href="/sign-up" className="font-medium text-[#1d2c27] underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]">
          Create an account
        </Link>
      </p>
    </div>
  );
}
