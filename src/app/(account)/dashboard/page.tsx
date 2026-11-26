import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Navbar } from "@/components/home/navbar";
import { getRequiredSession } from "@/lib/get-required-session";
import { USER_ROLES } from "@/lib/user-roles";

export const metadata: Metadata = {
  title: "Dashboard | FrostFit",
  description: "Your FrostFit account dashboard.",
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#efefed] text-[#151515]">
      <Navbar />
      <Suspense fallback={<div className="mx-auto max-w-4xl px-5 py-12 text-[#6f746e] sm:px-10 sm:py-16">Loading dashboard…</div>}>
        <DashboardContent />
      </Suspense>
    </main>
  );
}

async function DashboardContent() {
  const { user } = await getRequiredSession();
  const name = user.name.trim() || user.email;
  const role =
    user.role === USER_ROLES.seller
      ? "Seller"
      : user.role === USER_ROLES.admin
        ? "Admin"
        : user.role === USER_ROLES.customer
          ? "Customer"
          : "Member";

  return (
    <section className="mx-auto max-w-4xl px-5 py-12 sm:px-10 sm:py-16">
      <p className="caption-3 uppercase tracking-[0.18em] text-[#6f746e]">{role} dashboard</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] text-balance sm:text-5xl">Welcome back, {name}</h1>
      <p className="body-6 mt-4 max-w-xl text-pretty text-[#626761]">
        {user.role === USER_ROLES.seller
          ? "Your seller account is ready. Manage your FrostFit profile and explore the store."
          : "Your FrostFit account is ready. Explore the latest collection and manage your profile."}
      </p>

      <div className="mt-9 grid gap-4 sm:grid-cols-2">
        <Link
          href="/profile"
          className="group rounded-3xl border border-[#e1e1dc] bg-[#f9f9f7] p-6 transition-colors hover:border-[#1d2c27] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27] sm:p-8"
        >
          <p className="caption-3 uppercase tracking-[0.12em] text-[#6f746e]">Account</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#1d2c27]">View your profile</h2>
          <p className="body-6 mt-2 text-[#626761]">See your account details and account type.</p>
        </Link>
        <Link
          href="/all-products"
          className="group rounded-3xl border border-[#e1e1dc] bg-[#f9f9f7] p-6 transition-colors hover:border-[#1d2c27] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27] sm:p-8"
        >
          <p className="caption-3 uppercase tracking-[0.12em] text-[#6f746e]">FrostFit</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#1d2c27]">Explore products</h2>
          <p className="body-6 mt-2 text-[#626761]">Discover the latest layers for the cold.</p>
        </Link>
      </div>
    </section>
  );
}
