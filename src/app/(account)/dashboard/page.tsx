import type { Metadata } from "next";
import { Suspense } from "react";

import { CustomerDashboard } from "@/components/account/customer-dashboard";
import { SellerDashboardLayout } from "@/components/account/seller-dashboard-layout";
import { SellerDashboardOverview } from "@/components/account/seller-dashboard-overview";
import { getRequiredSession } from "@/lib/get-required-session";
import { USER_ROLES } from "@/lib/user-roles";

export const metadata: Metadata = {
  title: "Dashboard | FrostFit",
  description: "Your FrostFit account dashboard.",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <Suspense
        fallback={
          <div className="mx-auto max-w-4xl px-5 py-12 text-[#6f746e] sm:px-10 sm:py-16">
            Loading dashboard…
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </div>
  );
}

async function DashboardContent() {
  const { user } = await getRequiredSession();
  const name = user.name.trim() || user.email;

  if (user.role === USER_ROLES.seller) {
    return (
      <SellerDashboardLayout>
        <SellerDashboardOverview name={name} email={user.email} />
      </SellerDashboardLayout>
    );
  }

  const role =
    user.role === USER_ROLES.admin
      ? "Admin"
      : user.role === USER_ROLES.customer
        ? "Customer"
        : "Member";

  return <CustomerDashboard customerId={user.id} name={name} email={user.email} role={role} />;
}
