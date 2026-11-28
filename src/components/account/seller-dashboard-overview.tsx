"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, ArrowUpRight, BarChart3, Boxes, PackagePlus, RefreshCw, ShoppingBag, WalletCards } from "lucide-react";

import { getSellerProducts, type SellerProduct } from "@/lib/api/product/get-seller-products";
import { getSellerOrders, type SellerOrder } from "@/lib/api/seller/orders";

type OverviewData = { products: SellerProduct[]; orders: SellerOrder[] };

function formatPrice(value: number) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function statusClass(status: string) {
  if (status === "delivered" || status === "confirmed" || status === "active") return "bg-[#e3f0e7] text-[#1d462b]";
  if (status === "rejected" || status === "cancelled") return "bg-[#f5e4e2] text-[#8b3a2f]";
  return "bg-[#f1eee7] text-[#766641]";
}

export function SellerDashboardOverview({ name, email, sellerId }: { name: string; email: string; sellerId: string }) {
  const [data, setData] = useState<OverviewData>({ products: [], orders: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async (): Promise<OverviewData> => {
    const [products, orders] = await Promise.all([getSellerProducts(sellerId), getSellerOrders(sellerId)]);
    return { products, orders };
  }, [sellerId]);

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await fetchOverview());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load your store overview.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchOverview]);

  useEffect(() => {
    let active = true;
    fetchOverview()
      .then((result) => { if (active) setData(result); })
      .catch((requestError) => { if (active) setError(requestError instanceof Error ? requestError.message : "Unable to load your store overview."); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [fetchOverview]);

  const activeProducts = data.products.filter((product) => product.status.toLowerCase() === "active").length;
  const pendingOrders = data.orders.filter((order) => ["pending", "new"].includes(order.status.toLowerCase())).length;
  const completedSales = data.orders
    .filter((order) => ["confirmed", "delivered", "completed"].includes(order.status.toLowerCase()))
    .reduce((sum, order) => sum + order.totalAmount, 0);
  const unitsInStock = data.products.reduce((sum, product) => sum + (product.variants ?? []).reduce((variantSum, variant) => variantSum + Number(variant.stock || 0), 0), 0);
  const recentProducts = [...data.products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  const recentOrders = [...data.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);

  const stats = [
    { label: "Total products", value: data.products.length.toLocaleString(), note: `${activeProducts} active listings`, icon: Boxes },
    { label: "New orders", value: pendingOrders.toLocaleString(), note: "Waiting for your review", icon: ShoppingBag },
    { label: "Gross sales", value: formatPrice(completedSales), note: "Confirmed and delivered orders", icon: BarChart3 },
    { label: "Units in stock", value: unitsInStock.toLocaleString(), note: "Across all product variants", icon: PackagePlus },
  ];

  return (
    <div className="space-y-7">
      <section className="rounded-3xl bg-[#1d2c27] p-6 text-white sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="caption-3 uppercase tracking-[0.16em] text-[#bdc8c0]">Seller dashboard</p>
            <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.055em] text-balance sm:text-4xl">Welcome back, {name}</h1>
            <p className="body-6 mt-3 max-w-xl text-pretty text-[#d3d9d4]">Your store activity, product listings, and incoming orders at a glance.</p>
          </div>
          <Link href="/dashboard/products/new" className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-[#1d2c27] transition-colors hover:bg-[#e8ece8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            <PackagePlus aria-hidden="true" className="size-4" /> Add product
          </Link>
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-white/15 pt-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-[#e2e8e3]">
            <span className={`size-2 rounded-full ${activeProducts ? "bg-[#9bd2a8]" : "bg-[#d6b77a]"}`} aria-hidden="true" />
            {activeProducts ? "Store is live" : "Store setup in progress"}
          </span>
          <span className="text-xs text-[#bdc8c0]">{email}</span>
        </div>
      </section>

      {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e6d7d4] bg-[#fffaf9] px-5 py-4 text-sm text-[#8b3a2f]">
        <span className="flex items-center gap-2"><AlertCircle aria-hidden="true" className="size-4 shrink-0" />{error}</span>
        <button type="button" onClick={() => void loadOverview()} className="inline-flex items-center gap-1.5 font-medium underline underline-offset-2"><RefreshCw aria-hidden="true" className="size-3.5" />Retry</button>
      </div>}

      <section aria-label="Store overview" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, note, icon: Icon }) => (
          <article key={label} className="rounded-2xl border border-[#e1e4df] bg-[#f9faf8] p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-[#69736c]">{label}</p>
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#edf0ec] text-[#1d2c27]"><Icon aria-hidden="true" className="size-4" /></span>
            </div>
            <p className="mt-4 min-h-9 text-2xl font-semibold tracking-[-0.04em] text-[#1d2c27]">{isLoading ? "…" : value}</p>
            <p className="mt-1 text-xs text-[#89918b]">{note}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-6 sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div><p className="caption-3 uppercase tracking-[0.14em] text-[#788079]">Catalog</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-[#1d2c27]">My products</h2></div>
            <Link href="/dashboard/products" className="inline-flex items-center gap-1 text-sm font-medium text-[#1d2c27] hover:underline">View all <ArrowUpRight aria-hidden="true" className="size-4" /></Link>
          </div>
          {isLoading ? <p className="py-10 text-center text-sm text-[#788079]">Loading products…</p> : recentProducts.length ? <div className="mt-5 divide-y divide-[#e9ece8] rounded-2xl border border-[#e1e4df] bg-white px-4">
            {recentProducts.map((product) => <div key={product._id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#edf0ec] text-[#788079]">
                  {product.images?.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.images.thumbnail} alt="" className="size-full object-cover" />
                  ) : <Boxes aria-hidden="true" className="size-4" />}
                </span>
                <span className="min-w-0"><span className="block truncate text-sm font-medium text-[#1d2c27]">{product.name}</span><span className="mt-0.5 block text-xs text-[#788079]">{formatPrice(product.pricing?.discountPrice || product.pricing?.price || 0)}</span></span>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClass(product.status)}`}>{product.status}</span>
            </div>)}
          </div> : <div className="mt-5 rounded-2xl border border-dashed border-[#cbd2cc] bg-white px-5 py-9 text-center">
            <Boxes aria-hidden="true" className="mx-auto size-7 text-[#9aa39c]" /><p className="mt-3 text-sm font-medium text-[#1d2c27]">No product listings yet</p><p className="mt-1 text-sm text-[#788079]">Add a product to get your catalog started.</p>
            <Link href="/dashboard/products/new" className="mt-4 inline-flex text-sm font-medium text-[#1d2c27] underline underline-offset-4">Add your first product</Link>
          </div>}
        </article>

        <article className="rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-6 sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div><p className="caption-3 uppercase tracking-[0.14em] text-[#788079]">Fulfillment</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-[#1d2c27]">Recent orders</h2></div>
            <Link href="/dashboard/orders" className="inline-flex items-center gap-1 text-sm font-medium text-[#1d2c27] hover:underline">View all <ArrowUpRight aria-hidden="true" className="size-4" /></Link>
          </div>
          {isLoading ? <p className="py-10 text-center text-sm text-[#788079]">Loading orders…</p> : recentOrders.length ? <div className="mt-5 divide-y divide-[#e9ece8] rounded-2xl border border-[#e1e4df] bg-white px-4">
            {recentOrders.map((order) => <div key={order._id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0"><p className="text-sm font-medium text-[#1d2c27]">Order #{order._id.slice(-6).toUpperCase()}</p><p className="mt-0.5 truncate text-xs text-[#788079]">{order.customerName} · {formatDate(order.createdAt)}</p></div>
              <div className="shrink-0 text-right"><p className="text-sm font-medium text-[#1d2c27]">{formatPrice(order.totalAmount)}</p><span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusClass(order.status)}`}>{order.status}</span></div>
            </div>)}
          </div> : <div className="mt-5 rounded-2xl border border-dashed border-[#cbd2cc] bg-white px-5 py-9 text-center">
            <ShoppingBag aria-hidden="true" className="mx-auto size-7 text-[#9aa39c]" /><p className="mt-3 text-sm font-medium text-[#1d2c27]">No orders yet</p><p className="mt-1 text-sm text-[#788079]">Customer orders will show here when a product is purchased.</p>
          </div>}
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Link href="/dashboard/analytics" className="flex items-center justify-between gap-4 rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-6 transition-colors hover:border-[#1d2c27] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]">
          <span className="flex items-center gap-4"><span className="flex size-11 items-center justify-center rounded-2xl bg-[#edf0ec] text-[#1d2c27]"><BarChart3 aria-hidden="true" className="size-5" /></span><span><span className="block text-base font-semibold text-[#1d2c27]">Store analytics</span><span className="mt-1 block text-sm text-[#788079]">Track product and sales performance</span></span></span><ArrowUpRight aria-hidden="true" className="size-5 text-[#788079]" />
        </Link>
        <Link href="/dashboard/payouts" className="flex items-center justify-between gap-4 rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-6 transition-colors hover:border-[#1d2c27] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]">
          <span className="flex items-center gap-4"><span className="flex size-11 items-center justify-center rounded-2xl bg-[#edf0ec] text-[#1d2c27]"><WalletCards aria-hidden="true" className="size-5" /></span><span><span className="block text-base font-semibold text-[#1d2c27]">Payout setup</span><span className="mt-1 block text-sm text-[#788079]">Payout balance is not configured yet</span></span></span><ArrowUpRight aria-hidden="true" className="size-5 text-[#788079]" />
        </Link>
      </section>
    </div>
  );
}
