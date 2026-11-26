"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, LayoutDashboard, PackagePlus, Settings2, ShoppingBag, WalletCards } from "lucide-react";

const navigation = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Add product", href: "/dashboard/products/new", icon: PackagePlus },
  { label: "My products", href: "/dashboard/products", icon: Boxes },
  { label: "My orders", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Payouts", href: "/dashboard/payouts", icon: WalletCards },
  { label: "Store settings", href: "/dashboard/settings", icon: Settings2 },
];

export function SellerDashboardNavigation() {
  const pathname = usePathname();

  return (
    <aside className="h-fit rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-4 lg:sticky lg:top-28">
      <div className="px-3 py-3">
        <p className="caption-3 uppercase tracking-[0.16em] text-[#788079]">Seller workspace</p>
        <p className="mt-1 text-sm font-medium text-[#1d2c27]">Manage your store</p>
      </div>
      <nav aria-label="Seller dashboard" className="mt-3 grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
        {navigation.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d2c27] ${
                isActive ? "bg-[#1d2c27] font-medium text-white" : "text-[#626b64] hover:bg-[#edf0ec] hover:text-[#1d2c27]"
              }`}
            >
              <Icon aria-hidden="true" className="size-4 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-5 hidden rounded-2xl bg-[#edf0ec] p-4 lg:block">
        <p className="text-sm font-medium text-[#1d2c27]">Need a hand?</p>
        <p className="mt-1 text-xs leading-5 text-[#6b746d]">Seller tools are being set up for your store.</p>
      </div>
    </aside>
  );
}
