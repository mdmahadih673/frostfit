import type { Metadata } from "next";
import { Suspense } from "react";

import { Navbar } from "@/components/home/navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getRequiredSession } from "@/lib/get-required-session";
import { USER_ROLES } from "@/lib/user-roles";

export const metadata: Metadata = {
  title: "Profile | FrostFit",
  description: "View your FrostFit account profile.",
};

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-[#efefed] text-[#151515]">
      <Navbar />
      <Suspense fallback={<div className="mx-auto max-w-4xl px-5 py-12 text-[#6f746e] sm:px-10 sm:py-16">Loading profile…</div>}>
        <ProfileContent />
      </Suspense>
    </main>
  );
}

async function ProfileContent() {
  const { user } = await getRequiredSession();
  const name = user.name.trim() || user.email;
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
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
      <p className="caption-3 uppercase tracking-[0.18em] text-[#6f746e]">Your account</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Profile</h1>

      <div className="mt-9 flex items-center gap-4 rounded-3xl border border-[#e1e1dc] bg-[#f9f9f7] p-6 sm:p-8">
        <Avatar size="lg" className="border border-[#d8d8d2]">
          {user.image ? <AvatarImage src={user.image} alt={name} /> : null}
          <AvatarFallback className="bg-[#1d2c27] font-medium text-white">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h2 className="truncate text-xl font-semibold tracking-[-0.03em] text-[#1d2c27]">{name}</h2>
          <p className="body-6 mt-1 truncate text-[#626761]">{user.email}</p>
        </div>
      </div>

      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-[#e1e1dc] bg-[#f9f9f7] p-6">
          <dt className="caption-3 uppercase tracking-[0.12em] text-[#6f746e]">Full name</dt>
          <dd className="body-6 mt-2 font-medium text-[#1d2c27]">{user.name}</dd>
        </div>
        <div className="rounded-3xl border border-[#e1e1dc] bg-[#f9f9f7] p-6">
          <dt className="caption-3 uppercase tracking-[0.12em] text-[#6f746e]">Email</dt>
          <dd className="body-6 mt-2 break-all font-medium text-[#1d2c27]">{user.email}</dd>
        </div>
        <div className="rounded-3xl border border-[#e1e1dc] bg-[#f9f9f7] p-6">
          <dt className="caption-3 uppercase tracking-[0.12em] text-[#6f746e]">Account type</dt>
          <dd className="body-6 mt-2 font-medium text-[#1d2c27]">{role}</dd>
        </div>
        <div className="rounded-3xl border border-[#e1e1dc] bg-[#f9f9f7] p-6">
          <dt className="caption-3 uppercase tracking-[0.12em] text-[#6f746e]">Email status</dt>
          <dd className="body-6 mt-2 font-medium text-[#1d2c27]">{user.emailVerified ? "Verified" : "Not verified"}</dd>
        </div>
      </dl>
    </section>
  );
}
