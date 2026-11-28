import type { Metadata } from "next";
import { Suspense } from "react";

import { Navbar } from "@/components/home/navbar";
import { CustomerProfileForm } from "@/components/account/customer-profile-form";
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
  const role =
    user.role === USER_ROLES.seller
      ? "Seller"
      : user.role === USER_ROLES.admin
        ? "Admin"
        : user.role === USER_ROLES.customer
          ? "Customer"
          : "Member";

  return <CustomerProfileForm customerId={user.id} initialName={user.name} initialImage={user.image || ""} email={user.email} role={role} emailVerified={user.emailVerified} />;
}
