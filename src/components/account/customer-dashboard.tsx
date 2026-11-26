"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  Compass,
  Heart,
  LayoutDashboard,
  MapPin,
  Package,
  ShoppingBag,
  Sparkles,
  UserRound,
} from "lucide-react";

import { Navbar } from "@/components/home/navbar";

type CustomerTab = "overview" | "orders" | "saved" | "addresses";

type CustomerDashboardProps = {
  name: string;
  email: string;
  role: string;
};

const navItems: Array<{
  id: CustomerTab;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "My orders", icon: ShoppingBag },
  { id: "saved", label: "Saved items", icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
];

const summaryStats = [
  {
    label: "Active orders",
    value: "0",
    note: "No orders in transit",
    icon: Package,
  },
  {
    label: "Saved items",
    value: "0",
    note: "Save layers for later",
    icon: Heart,
  },
  {
    label: "Completed orders",
    value: "0",
    note: "Order history appears here",
    icon: ShoppingBag,
  },
  {
    label: "Saved addresses",
    value: "0",
    note: "Add a delivery address",
    icon: MapPin,
  },
];

export function CustomerDashboard({
  name,
  email,
  role,
}: CustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState<CustomerTab>("overview");

  return (
    <div className="min-h-screen bg-[#f1f2ef] text-[#18231f]">
      <Navbar />

      <div className="mx-auto grid max-w-[1600px] gap-5 px-4 py-5 sm:px-7 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-8 lg:px-10 lg:py-8">
        {/* Sidebar */}
        <aside className="h-fit rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-4 lg:sticky lg:top-28">
          <div className="px-3 py-3">
            <p className="caption-3 uppercase tracking-[0.16em] text-[#788079]">
              {role} account
            </p>
            <p className="mt-1 truncate text-sm font-medium text-[#1d2c27]">
              {name}
            </p>
          </div>

          <nav
            aria-label="Customer dashboard"
            className="mt-3 grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-1"
          >
            {navItems.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d2c27] ${
                    isActive
                      ? "bg-[#1d2c27] font-medium text-white"
                      : "text-[#626b64] hover:bg-[#edf0ec] hover:text-[#1d2c27]"
                  }`}
                >
                  <Icon aria-hidden="true" className="size-4 shrink-0" />
                  <span>{label}</span>
                </button>
              );
            })}

            <Link
              href="/profile"
              className="flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#626b64] transition-colors hover:bg-[#edf0ec] hover:text-[#1d2c27] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d2c27]"
            >
              <UserRound aria-hidden="true" className="size-4 shrink-0" />
              <span>Profile</span>
            </Link>
          </nav>

          <div className="mt-5 hidden rounded-2xl bg-[#edf0ec] p-4 lg:block">
            <p className="text-sm font-medium text-[#1d2c27]">
              Seasonal collections
            </p>
            <p className="mt-1 text-xs leading-5 text-[#6b746d]">
              Browse technical layers tailored for winter and summer forecasts.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/winter"
                className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#1d2c27] transition hover:bg-[#1d2c27] hover:text-white"
              >
                Winter
              </Link>
              <Link
                href="/summer"
                className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#1d2c27] transition hover:bg-[#1d2c27] hover:text-white"
              >
                Summer
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 space-y-7">
          {activeTab === "overview" && (
            <>
              <section className="rounded-3xl bg-[#1d2c27] p-6 text-white sm:p-8 lg:p-10">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div>
                    <p className="caption-3 uppercase tracking-[0.16em] text-[#bdc8c0]">
                      {role} dashboard
                    </p>
                    <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.055em] text-balance sm:text-4xl">
                      Welcome back, {name}
                    </h1>
                    <p className="body-6 mt-3 max-w-xl text-pretty text-[#d3d9d4]">
                      Track your orders, manage saved layers, and explore new
                      FrostFit arrivals—all in one place.
                    </p>
                  </div>
                  <Link
                    href="/all-products"
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-[#1d2c27] transition-colors hover:bg-[#e8ece8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    <Compass aria-hidden="true" className="size-4" />
                    Explore products
                  </Link>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-white/15 pt-5">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-[#e2e8e3]">
                    <span
                      className="size-2 rounded-full bg-[#8ec4a2]"
                      aria-hidden="true"
                    />
                    Active {role.toLowerCase()} account
                  </span>
                  <span className="text-xs text-[#bdc8c0]">{email}</span>
                </div>
              </section>

              <section
                aria-label="Account summary"
                className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
              >
                {summaryStats.map(({ label, value, note, icon: Icon }) => (
                  <article
                    key={label}
                    className="rounded-2xl border border-[#e1e4df] bg-[#f9faf8] p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-[#69736c]">{label}</p>
                      <span className="flex size-9 items-center justify-center rounded-xl bg-[#edf0ec] text-[#1d2c27]">
                        <Icon aria-hidden="true" className="size-4" />
                      </span>
                    </div>
                    <p className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[#1d2c27]">
                      {value}
                    </p>
                    <p className="mt-1 text-xs text-[#89918b]">{note}</p>
                  </article>
                ))}
              </section>

              <section className="grid gap-4 xl:grid-cols-2">
                <article className="rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-6 sm:p-8">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="caption-3 uppercase tracking-[0.14em] text-[#788079]">
                        Orders
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-[#1d2c27]">
                        Recent orders
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("orders")}
                      className="inline-flex items-center gap-1 text-sm font-medium text-[#1d2c27] hover:underline"
                    >
                      View all <ArrowUpRight aria-hidden="true" className="size-4" />
                    </button>
                  </div>
                  <div className="mt-5 rounded-2xl border border-dashed border-[#cbd2cc] bg-white px-5 py-9 text-center">
                    <ShoppingBag
                      aria-hidden="true"
                      className="mx-auto size-7 text-[#9aa39c]"
                    />
                    <p className="mt-3 text-sm font-medium text-[#1d2c27]">
                      No orders placed yet
                    </p>
                    <p className="mt-1 text-sm text-[#788079]">
                      Once you place an order, tracking updates will appear here.
                    </p>
                    <Link
                      href="/all-products"
                      className="mt-4 inline-flex text-sm font-medium text-[#1d2c27] underline underline-offset-4"
                    >
                      Shop all products
                    </Link>
                  </div>
                </article>

                <article className="rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-6 sm:p-8">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="caption-3 uppercase tracking-[0.14em] text-[#788079]">
                        Quick links
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-[#1d2c27]">
                        Curated for you
                      </h2>
                    </div>
                    <Link
                      href="/profile"
                      className="inline-flex items-center gap-1 text-sm font-medium text-[#1d2c27] hover:underline"
                    >
                      Profile <ArrowUpRight aria-hidden="true" className="size-4" />
                    </Link>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <Link
                      href="/winter"
                      className="group rounded-2xl border border-[#e1e4df] bg-white p-5 transition hover:border-[#1d2c27]"
                    >
                      <Sparkles
                        aria-hidden="true"
                        className="size-5 text-[#1d2c27]"
                      />
                      <p className="mt-3 text-sm font-semibold text-[#1d2c27]">
                        Winter layers
                      </p>
                      <p className="mt-1 text-xs text-[#6f746e]">
                        Insulated hoodies, parkas & fleece.
                      </p>
                    </Link>
                    <Link
                      href="/summer"
                      className="group rounded-2xl border border-[#e1e4df] bg-white p-5 transition hover:border-[#1d2c27]"
                    >
                      <Compass
                        aria-hidden="true"
                        className="size-5 text-[#1d2c27]"
                      />
                      <p className="mt-3 text-sm font-semibold text-[#1d2c27]">
                        Summer layers
                      </p>
                      <p className="mt-1 text-xs text-[#6f746e]">
                        Lightweight breathable essentials.
                      </p>
                    </Link>
                  </div>
                </article>
              </section>
            </>
          )}

          {activeTab === "orders" && (
            <section className="rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-6 sm:p-8">
              <p className="caption-3 uppercase tracking-[0.14em] text-[#788079]">
                Orders
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-[#1d2c27]">
                My orders
              </h1>
              <p className="body-6 mt-2 text-[#69736c]">
                View your recent purchases and delivery status.
              </p>
              <div className="mt-6 rounded-2xl border border-dashed border-[#cbd2cc] bg-white px-5 py-14 text-center">
                <ShoppingBag
                  aria-hidden="true"
                  className="mx-auto size-8 text-[#9aa39c]"
                />
                <p className="mt-3 text-sm font-medium text-[#1d2c27]">
                  You have no orders yet
                </p>
                <p className="mt-1 text-sm text-[#788079]">
                  Browse the collection to find your next winter or summer layer.
                </p>
                <Link
                  href="/all-products"
                  className="button-sm mt-5 inline-flex items-center gap-2 rounded-full bg-[#1d2c27] px-4 py-2 text-white transition hover:bg-[#344a42]"
                >
                  Browse products
                </Link>
              </div>
            </section>
          )}

          {activeTab === "saved" && (
            <section className="rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-6 sm:p-8">
              <p className="caption-3 uppercase tracking-[0.14em] text-[#788079]">
                Wishlist
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-[#1d2c27]">
                Saved items
              </h1>
              <p className="body-6 mt-2 text-[#69736c]">
                Keep track of FrostFit pieces you want to revisit.
              </p>
              <div className="mt-6 rounded-2xl border border-dashed border-[#cbd2cc] bg-white px-5 py-14 text-center">
                <Heart
                  aria-hidden="true"
                  className="mx-auto size-8 text-[#9aa39c]"
                />
                <p className="mt-3 text-sm font-medium text-[#1d2c27]">
                  No saved items yet
                </p>
                <p className="mt-1 text-sm text-[#788079]">
                  Explore all products to discover pieces for your wardrobe.
                </p>
                <Link
                  href="/all-products"
                  className="button-sm mt-5 inline-flex items-center gap-2 rounded-full bg-[#1d2c27] px-4 py-2 text-white transition hover:bg-[#344a42]"
                >
                  Explore collection
                </Link>
              </div>
            </section>
          )}

          {activeTab === "addresses" && (
            <section className="rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-6 sm:p-8">
              <p className="caption-3 uppercase tracking-[0.14em] text-[#788079]">
                Shipping
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-[#1d2c27]">
                Delivery addresses
              </h1>
              <p className="body-6 mt-2 text-[#69736c]">
                Manage your saved shipping destinations for faster checkout.
              </p>
              <div className="mt-6 rounded-2xl border border-dashed border-[#cbd2cc] bg-white px-5 py-14 text-center">
                <MapPin
                  aria-hidden="true"
                  className="mx-auto size-8 text-[#9aa39c]"
                />
                <p className="mt-3 text-sm font-medium text-[#1d2c27]">
                  No saved addresses
                </p>
                <p className="mt-1 text-sm text-[#788079]">
                  Delivery addresses added during checkout will appear here.
                </p>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
