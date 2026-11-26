import { Suspense, type ReactNode } from "react";

import { SellerDashboardLayout } from "@/components/account/seller-dashboard-layout";
import { getRequiredSellerSession } from "@/lib/get-required-session";

export default function SellerPagesLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f1f2ef] p-8 text-[#788079]">Loading seller workspace…</div>}>
      <SellerWorkspaceGuard>{children}</SellerWorkspaceGuard>
    </Suspense>
  );
}

async function SellerWorkspaceGuard({ children }: { children: ReactNode }) {
  await getRequiredSellerSession();

  return <SellerDashboardLayout>{children}</SellerDashboardLayout>;
}
