import Link from "next/link";
import { ArrowUpRight, BarChart3, Boxes, PackagePlus, ShoppingBag, WalletCards } from "lucide-react";

const stats = [
  { label: "Active products", value: "—", note: "Catalog not connected", icon: Boxes },
  { label: "Orders", value: "—", note: "Order data not connected", icon: ShoppingBag },
  { label: "Gross sales", value: "—", note: "Sales data not connected", icon: BarChart3 },
  { label: "Payout balance", value: "—", note: "Payouts not configured", icon: WalletCards },
];

export function SellerDashboardOverview({ name, email }: { name: string; email: string }) {
  return (
    <div className="space-y-7">
      <section className="rounded-3xl bg-[#1d2c27] p-6 text-white sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="caption-3 uppercase tracking-[0.16em] text-[#bdc8c0]">Seller dashboard</p>
            <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.055em] text-balance sm:text-4xl">
              Welcome back, {name}
            </h1>
            <p className="body-6 mt-3 max-w-xl text-pretty text-[#d3d9d4]">
              Your store overview, products, orders, and payouts—all in one place.
            </p>
          </div>
          <Link
            href="/dashboard/products/new"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-[#1d2c27] transition-colors hover:bg-[#e8ece8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <PackagePlus aria-hidden="true" className="size-4" />
            Add product
          </Link>
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-white/15 pt-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-[#e2e8e3]">
            <span className="size-2 rounded-full bg-[#d6b77a]" aria-hidden="true" />
            Store setup in progress
          </span>
          <span className="text-xs text-[#bdc8c0]">{email}</span>
        </div>
      </section>

      <section aria-label="Store overview" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, note, icon: Icon }) => (
          <article key={label} className="rounded-2xl border border-[#e1e4df] bg-[#f9faf8] p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-[#69736c]">{label}</p>
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#edf0ec] text-[#1d2c27]">
                <Icon aria-hidden="true" className="size-4" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[#1d2c27]">{value}</p>
            <p className="mt-1 text-xs text-[#89918b]">{note}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-6 sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="caption-3 uppercase tracking-[0.14em] text-[#788079]">Catalog</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-[#1d2c27]">My products</h2>
            </div>
            <Link href="/dashboard/products" className="inline-flex items-center gap-1 text-sm font-medium text-[#1d2c27] hover:underline">
              View all <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <div className="mt-5 rounded-2xl border border-dashed border-[#cbd2cc] bg-white px-5 py-9 text-center">
            <Boxes aria-hidden="true" className="mx-auto size-7 text-[#9aa39c]" />
            <p className="mt-3 text-sm font-medium text-[#1d2c27]">No product listings yet</p>
            <p className="mt-1 text-sm text-[#788079]">Add a product to get your catalog started.</p>
            <Link href="/dashboard/products/new" className="mt-4 inline-flex text-sm font-medium text-[#1d2c27] underline underline-offset-4">
              Add your first product
            </Link>
          </div>
        </article>

        <article className="rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-6 sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="caption-3 uppercase tracking-[0.14em] text-[#788079]">Fulfillment</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-[#1d2c27]">Recent orders</h2>
            </div>
            <Link href="/dashboard/orders" className="inline-flex items-center gap-1 text-sm font-medium text-[#1d2c27] hover:underline">
              View all <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <div className="mt-5 rounded-2xl border border-dashed border-[#cbd2cc] bg-white px-5 py-9 text-center">
            <ShoppingBag aria-hidden="true" className="mx-auto size-7 text-[#9aa39c]" />
            <p className="mt-3 text-sm font-medium text-[#1d2c27]">No orders yet</p>
            <p className="mt-1 text-sm text-[#788079]">Orders will appear here when order management is connected.</p>
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Link
          href="/dashboard/analytics"
          className="flex items-center justify-between gap-4 rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-6 transition-colors hover:border-[#1d2c27] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]"
        >
          <span className="flex items-center gap-4">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-[#edf0ec] text-[#1d2c27]">
              <BarChart3 aria-hidden="true" className="size-5" />
            </span>
            <span>
              <span className="block text-base font-semibold text-[#1d2c27]">Store analytics</span>
              <span className="mt-1 block text-sm text-[#788079]">Track product and sales performance</span>
            </span>
          </span>
          <ArrowUpRight aria-hidden="true" className="size-5 text-[#788079]" />
        </Link>
        <Link
          href="/dashboard/payouts"
          className="flex items-center justify-between gap-4 rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-6 transition-colors hover:border-[#1d2c27] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]"
        >
          <span className="flex items-center gap-4">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-[#edf0ec] text-[#1d2c27]">
              <WalletCards aria-hidden="true" className="size-5" />
            </span>
            <span>
              <span className="block text-base font-semibold text-[#1d2c27]">Payout setup</span>
              <span className="mt-1 block text-sm text-[#788079]">Review payout configuration status</span>
            </span>
          </span>
          <ArrowUpRight aria-hidden="true" className="size-5 text-[#788079]" />
        </Link>
      </section>
    </div>
  );
}
