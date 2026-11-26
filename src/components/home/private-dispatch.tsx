"use client";

import { Mail } from "lucide-react";
import { useState, type FormEvent } from "react";

export function PrivateDispatch() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) return;

    setSubmitted(true);
    setEmail("");
  }

  return (
    <section id="dispatch" className="mx-auto mt-6 max-w-[1440px] bg-[#f9f9f7] px-5 py-16 text-center shadow-[0_24px_70px_rgba(34,34,31,0.08)] sm:mt-12 sm:px-10 sm:py-20 lg:px-14 lg:py-24">
      <div className="mx-auto flex max-w-[640px] flex-col items-center">
        <p className="caption-3 uppercase tracking-[0.18em] text-[#6f746e]">Private dispatch</p>
        <h2 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-[-0.055em] text-balance text-[#171817] sm:text-5xl">Early access to winter drops.</h2>
        <p className="body-6 mt-5 max-w-md text-pretty text-[#626761]">Receive seasonal lookbooks, private archive invitations, and fabric care notes. No weekly clutter.</p>

        {submitted ? (
          <p role="status" aria-live="polite" className="body-6 mt-9 rounded-full border border-[#d8d8d2] bg-white px-5 py-3 text-[#1d2c27]">
            You&apos;re on the list. Watch your inbox for the next dispatch.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-9 flex w-full max-w-[440px] flex-col gap-3 sm:flex-row">
            <label htmlFor="dispatch-email" className="sr-only">
              Email address
            </label>
            <div className="relative flex-1">
              <Mail aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#6f746e]" />
              <input
                id="dispatch-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@winterwear.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="body-6 h-12 w-full rounded-full border border-[#d8d8d2] bg-white pr-4 pl-11 text-[#151515] placeholder:text-[#8a8f88] transition-colors duration-300 focus:border-[#1d2c27] focus:outline-2 focus:outline-offset-2 focus:outline-[#1d2c27]"
              />
            </div>
            <button type="submit" className="button-sm h-12 shrink-0 rounded-full bg-[#1d2c27] px-6 text-white transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#344a42] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]">
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
