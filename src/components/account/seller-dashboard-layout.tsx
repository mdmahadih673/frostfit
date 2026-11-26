import type { ReactNode } from "react";

import { Navbar } from "@/components/home/navbar";

import { SellerDashboardNavigation } from "./seller-dashboard-navigation";

export function SellerDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f1f2ef] text-[#18231f]">
      <Navbar />
      <div className="mx-auto grid max-w-[1600px] gap-5 px-4 py-5 sm:px-7 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-8 lg:px-10 lg:py-8">
        <SellerDashboardNavigation />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
