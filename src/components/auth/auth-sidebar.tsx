"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { USER_ROLES } from "@/lib/user-roles";

import { useAuthRole } from "./auth-role-context";

const memberContent = {
  eyebrow: "FrostFit members",
  title: "Made for the wild cold.",
  description: "Sign in to track orders, save your layers, and get first access to winter drops.",
  perks: ["Early access to winter drops", "Private archive invitations", "Order tracking and saved layers"],
};

const customerContent = {
  eyebrow: "FrostFit members",
  title: "Made for the wild cold.",
  description: "Save your layers, track orders, and hear about winter drops first.",
  perks: ["Early access to winter drops", "Private archive invitations", "Order tracking and saved layers"],
};

const sellerContent = {
  eyebrow: "FrostFit sellers",
  title: "Bring your winter collection to life.",
  description: "Showcase your products, manage your store, and connect with FrostFit customers.",
  perks: ["Showcase your winter collection", "Manage products and orders", "Reach FrostFit customers"],
};

export function AuthSidebar() {
  const pathname = usePathname();
  const { role } = useAuthRole();
  const content = pathname === "/sign-up" ? (role === USER_ROLES.seller ? sellerContent : customerContent) : memberContent;

  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#1d2c27] p-10 text-white lg:flex lg:p-14">
      <Link href="/" className="group relative z-10 inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" aria-label="FrostFit home">
        <span className="flex size-7 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#1d2c27] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-12">F</span>
        <span className="title-4 tracking-[-0.06em]">frostfit</span>
      </Link>

      <div className="relative z-10 max-w-[420px]" aria-live="polite">
        <p className="caption-3 uppercase tracking-[0.18em] text-[#b9c3bc]">{content.eyebrow}</p>
        <p className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-0.06em] text-balance">{content.title}</p>
        <p className="body-6 mt-5 max-w-sm text-pretty text-[#b9c3bc]">{content.description}</p>
        <ul className="mt-10 space-y-3">
          {content.perks.map((perk) => (
            <li key={perk} className="caption-4 flex items-center gap-3 text-[#e5e2db]">
              <span className="size-1.5 rounded-full bg-[#b9c3bc]" aria-hidden="true" />
              {perk}
            </li>
          ))}
        </ul>
      </div>

      <p className="caption-4 relative z-10 text-[#b9c3bc]">© 2026 FrostFit. Made for the wild cold.</p>

      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-1/3 size-72 rounded-full border border-white/10" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-8 top-1/3 size-40 rounded-full border border-white/10" />
    </aside>
  );
}
