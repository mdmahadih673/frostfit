"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowRight, ArrowUpRight, Boxes, Check, CircleCheck, Clock3, PackageSearch, RefreshCw, ShieldCheck, Store, X } from "lucide-react";

import { Navbar } from "@/components/home/navbar";
import { getAdminProducts, reviewSellerProduct } from "@/lib/api/admin/products";
import type { SellerProduct } from "@/lib/api/product/get-seller-products";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatPrice(value: number) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function statusStyle(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "active") return "bg-[#e6f1e9] text-[#28563a]";
  if (normalized === "rejected" || normalized === "inactive") return "bg-[#f7eae7] text-[#9a4b40]";
  return "bg-[#f4efe3] text-[#806a37]";
}

export function AdminDashboard({ name, email, adminId }: { name: string; email: string; adminId: string }) {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectingProduct, setRejectingProduct] = useState<SellerProduct | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reviewingProductId, setReviewingProductId] = useState<string | null>(null);

  const fetchProducts = useCallback(() => getAdminProducts(adminId), [adminId]);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setProducts(await fetchProducts());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load catalog data.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchProducts]);

  useEffect(() => {
    let active = true;
    fetchProducts()
      .then((result) => { if (active) setProducts(result); })
      .catch((requestError) => { if (active) setError(requestError instanceof Error ? requestError.message : "Could not load catalog data."); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [fetchProducts]);

  const handleProductReview = async (product: SellerProduct, decision: "approved" | "rejected") => {
    if (decision === "rejected" && rejectionReason.trim().length < 5) return;
    setReviewingProductId(product._id);
    setError(null);
    try {
      const updated = await reviewSellerProduct(adminId, product._id, decision, rejectionReason.trim());
      setProducts((current) => current.map((item) => item._id === updated._id ? updated : item));
      setRejectingProduct(null);
      setRejectionReason("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update product review.");
    } finally {
      setReviewingProductId(null);
    }
  };

  const activeCount = products.filter((product) => product.status.toLowerCase() === "active").length;
  const pendingProducts = products.filter((product) => product.status.toLowerCase() === "pending");
  const pendingCount = pendingProducts.length;
  const stockCount = products.reduce((sum, product) => sum + (product.variants ?? []).reduce((variantSum, variant) => variantSum + (Number(variant.stock) || 0), 0), 0);
  const recentProducts = useMemo(() => [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5), [products]);

  const metrics = [
    { label: "Total listings", value: products.length, note: "Across all seller stores", icon: Boxes, color: "bg-[#edf0ec] text-[#1d2c27]" },
    { label: "Active products", value: activeCount, note: "Visible in the storefront", icon: CircleCheck, color: "bg-[#e6f1e9] text-[#28563a]" },
    { label: "Pending review", value: pendingCount, note: "Awaiting catalog approval", icon: Clock3, color: "bg-[#f4efe3] text-[#806a37]" },
    { label: "Units in stock", value: stockCount, note: "Across all listed variants", icon: PackageSearch, color: "bg-[#e9edf4] text-[#405a7b]" },
  ];

  const statuses = [
    { label: "Active", count: activeCount, color: "bg-[#496b59]" },
    { label: "Pending", count: pendingCount, color: "bg-[#c7a967]" },
    { label: "Other", count: Math.max(products.length - activeCount - pendingCount, 0), color: "bg-[#a5ada7]" },
  ];

  return (
    <div className="min-h-screen bg-[#f1f2ef] text-[#1d2c27]">
      <Navbar />
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-7 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="h-fit rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-4 lg:sticky lg:top-28">
            <div className="rounded-2xl bg-[#1d2c27] p-4 text-white">
              <span className="flex size-10 items-center justify-center rounded-xl bg-white/10"><ShieldCheck aria-hidden="true" className="size-5" /></span>
              <p className="mt-4 text-sm font-semibold">Admin console</p>
              <p className="mt-1 break-all text-xs text-[#bdc8c0]">{email}</p>
            </div>
            <nav aria-label="Admin dashboard" className="mt-4 space-y-1">
              <a href="#overview" className="flex min-h-10 items-center gap-2 rounded-xl bg-[#edf0ec] px-3 py-2 text-sm font-medium text-[#1d2c27]"><Store aria-hidden="true" className="size-4" /> Overview</a>
              <a href="#catalog" className="flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#626b64] transition hover:bg-[#edf0ec] hover:text-[#1d2c27]"><Boxes aria-hidden="true" className="size-4" /> Catalog health</a>
              <a href="#recent-listings" className="flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#626b64] transition hover:bg-[#edf0ec] hover:text-[#1d2c27]"><PackageSearch aria-hidden="true" className="size-4" /> Recent listings</a>
            </nav>
            <div className="mt-5 rounded-2xl bg-[#edf0ec] p-4">
              <p className="text-sm font-medium">Platform tools</p>
              <p className="mt-1 text-xs leading-5 text-[#6b746d]">Catalog data is connected. Orders and seller management tools are not connected yet.</p>
            </div>
          </aside>

          <div className="min-w-0 space-y-6">
            <section id="overview" className="overflow-hidden rounded-3xl bg-[#1d2c27] p-6 text-white sm:p-8 lg:p-10">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <p className="caption-3 uppercase tracking-[0.16em] text-[#bdc8c0]">Platform administration</p>
                  <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.05em] text-balance sm:text-4xl">Welcome back, {name}</h1>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-[#d3d9d4]">A clear view of the FrostFit catalog and listing activity.</p>
                </div>
                <Link href="/all-products" className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-[#1d2c27] transition hover:bg-[#e8ece8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Browse storefront <ArrowUpRight aria-hidden="true" className="size-4" /></Link>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-white/15 pt-5">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-[#e2e8e3]"><span className="size-2 rounded-full bg-[#9bd2a8]" aria-hidden="true" />Catalog connected</span>
                <span className="text-xs text-[#bdc8c0]">Platform overview</span>
              </div>
            </section>

            {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e6d7d4] bg-[#fffaf9] px-5 py-4 text-sm text-[#8b3a2f]"><span className="flex items-center gap-2"><AlertCircle aria-hidden="true" className="size-4 shrink-0" />{error}</span><button type="button" onClick={() => void loadProducts()} className="inline-flex items-center gap-1.5 font-medium underline underline-offset-2"><RefreshCw aria-hidden="true" className="size-3.5" />Retry</button></div>}

            <section aria-label="Platform metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map(({ label, value, note, icon: Icon, color }) => <article key={label} className="rounded-2xl border border-[#e1e4df] bg-[#f9faf8] p-5">
                <div className="flex items-start justify-between gap-3"><p className="text-sm text-[#69736c]">{label}</p><span className={`flex size-9 items-center justify-center rounded-xl ${color}`}><Icon aria-hidden="true" className="size-4" /></span></div>
                <p className="mt-4 min-h-9 text-2xl font-semibold tracking-[-0.04em] text-[#1d2c27]">{isLoading ? "…" : value.toLocaleString()}</p><p className="mt-1 text-xs text-[#89918b]">{note}</p>
              </article>)}
            </section>

            <section aria-labelledby="pending-review-heading" className="rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-5 sm:p-7">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div><p className="caption-3 uppercase tracking-[0.14em] text-[#788079]">Seller submissions</p><h2 id="pending-review-heading" className="mt-2 text-xl font-semibold text-[#1d2c27]">Pending product review</h2><p className="mt-1 text-sm text-[#788079]">Approve listings for the storefront or send the seller a clear reason.</p></div>
                <span className="rounded-full bg-[#f4efe3] px-3 py-1.5 text-xs font-medium text-[#806a37]">{isLoading ? "…" : pendingCount} waiting</span>
              </div>
              {isLoading ? <p className="py-12 text-center text-sm text-[#788079]">Loading pending products…</p> : pendingProducts.length ? <div className="mt-5 space-y-3">
                {pendingProducts.map((product) => <article key={product._id} className="rounded-2xl border border-[#e1e4df] bg-white p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-4">
                      <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#edf0ec] text-[#788079]">{product.images?.thumbnail ? <span aria-hidden="true" className="size-full bg-cover bg-center" style={{ backgroundImage: `url("${product.images.thumbnail}")` }} /> : <Boxes aria-hidden="true" className="size-5" />}</span>
                      <div className="min-w-0"><h3 className="truncate text-sm font-semibold text-[#1d2c27]">{product.name}</h3><p className="mt-1 text-xs text-[#788079]">{product.brand || "FrostFit"} · {product.categoryId || "Uncategorized"} · Seller {product.sellerId}</p><p className="mt-2 line-clamp-2 text-sm text-[#536057]">{product.description || "No product description provided."}</p><p className="mt-2 text-sm font-medium text-[#1d2c27]">{formatPrice(product.pricing?.discountPrice || product.pricing?.price || 0)}</p></div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button type="button" disabled={reviewingProductId === product._id} onClick={() => void handleProductReview(product, "approved")} className="inline-flex items-center gap-1.5 rounded-full bg-[#1d462b] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#24553a] disabled:opacity-50"><Check aria-hidden="true" className="size-3.5" />Approve</button>
                      <button type="button" disabled={reviewingProductId === product._id} onClick={() => { setRejectingProduct(rejectingProduct?._id === product._id ? null : product); setRejectionReason(""); }} className="inline-flex items-center gap-1.5 rounded-full border border-[#e3d2cf] px-3 py-2 text-xs font-medium text-[#9e3f33] transition hover:bg-[#fff5f3] disabled:opacity-50"><X aria-hidden="true" className="size-3.5" />Reject</button>
                    </div>
                  </div>
                  {rejectingProduct?._id === product._id && <div className="mt-4 rounded-xl bg-[#faf7f5] p-4">
                    <label htmlFor={`reject-reason-${product._id}`} className="text-sm font-medium text-[#34201c]">Reason for rejection</label>
                    <p className="mt-1 text-xs text-[#775f59]">The seller will see this message on the product in My products.</p>
                    <textarea id={`reject-reason-${product._id}`} value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} minLength={5} maxLength={500} rows={3} placeholder="Explain what needs to change before this product can be listed" className="mt-3 w-full rounded-xl border border-[#e3d2cf] bg-white px-3 py-2 text-sm text-[#34201c] outline-none focus:border-[#a94e42]" />
                    <div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => { setRejectingProduct(null); setRejectionReason(""); }} className="rounded-full border border-[#d8ddd8] px-3 py-2 text-xs font-medium text-[#536057]">Cancel</button><button type="button" disabled={reviewingProductId === product._id || rejectionReason.trim().length < 5} onClick={() => void handleProductReview(product, "rejected")} className="rounded-full bg-[#a94e42] px-3 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50">{reviewingProductId === product._id ? "Saving…" : "Reject product"}</button></div>
                  </div>}
                </article>)}
              </div> : <div className="mt-5 rounded-2xl border border-dashed border-[#cbd2cc] bg-white px-5 py-9 text-center"><CircleCheck aria-hidden="true" className="mx-auto size-7 text-[#4e795c]" /><p className="mt-3 text-sm font-medium text-[#1d2c27]">All caught up</p><p className="mt-1 text-sm text-[#788079]">There are no products waiting for review.</p></div>}
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <article id="recent-listings" className="min-w-0 rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-5 sm:p-7">
                <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="caption-3 uppercase tracking-[0.14em] text-[#788079]">Catalog activity</p><h2 className="mt-2 text-xl font-semibold text-[#1d2c27]">Recent listings</h2><p className="mt-1 text-sm text-[#788079]">Latest products submitted by sellers</p></div><Link href="/all-products" className="inline-flex items-center gap-1 text-sm font-medium text-[#1d2c27] hover:underline">View storefront <ArrowRight aria-hidden="true" className="size-4" /></Link></div>
                {isLoading ? <p className="py-12 text-center text-sm text-[#788079]">Loading catalog…</p> : recentProducts.length ? <div className="mt-5 overflow-x-auto rounded-2xl border border-[#e1e4df] bg-white"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-[#edf0ec] text-xs uppercase tracking-wide text-[#788079]"><tr><th className="px-4 py-3 font-medium">Product</th><th className="px-4 py-3 font-medium">Seller</th><th className="px-4 py-3 font-medium">Date added</th><th className="px-4 py-3 font-medium">Status</th></tr></thead><tbody className="divide-y divide-[#e9ece8]">{recentProducts.map((product) => <tr key={product._id} className="hover:bg-[#fafbf9]"><td className="px-4 py-3"><div className="flex items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#edf0ec] text-[#788079]">{product.images?.thumbnail ? <span aria-hidden="true" className="size-full bg-cover bg-center" style={{ backgroundImage: `url("${product.images.thumbnail}")` }} /> : <Boxes aria-hidden="true" className="size-4" />}</span><span className="min-w-0"><span className="block max-w-[180px] truncate font-medium text-[#1d2c27]">{product.name}</span><span className="mt-0.5 block text-xs text-[#788079]">{formatPrice(product.pricing?.discountPrice || product.pricing?.price || 0)}</span></span></div></td><td className="max-w-[130px] truncate px-4 py-3 text-xs text-[#536057]">{product.sellerId}</td><td className="whitespace-nowrap px-4 py-3 text-xs text-[#536057]">{formatDate(product.createdAt)}</td><td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyle(product.status)}`}>{product.status}</span></td></tr>)}</tbody></table></div> : <div className="mt-5 rounded-2xl border border-dashed border-[#cbd2cc] bg-white px-5 py-10 text-center"><Boxes aria-hidden="true" className="mx-auto size-7 text-[#9aa39c]" /><p className="mt-3 text-sm font-medium text-[#1d2c27]">No product listings yet</p><p className="mt-1 text-sm text-[#788079]">Seller submissions will appear here.</p></div>}
              </article>

              <article id="catalog" className="rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-5 sm:p-7">
                <p className="caption-3 uppercase tracking-[0.14em] text-[#788079]">Catalog health</p><h2 className="mt-2 text-xl font-semibold text-[#1d2c27]">Listing status</h2><p className="mt-1 text-sm text-[#788079]">Current product review state</p>
                {isLoading ? <p className="py-12 text-center text-sm text-[#788079]">Loading status…</p> : products.length ? <div className="mt-6 space-y-5">{statuses.map(({ label, count, color }) => <div key={label}><div className="flex items-center justify-between text-sm"><span className="text-[#536057]">{label}</span><span className="font-medium text-[#1d2c27]">{count} <span className="font-normal text-[#89918b]">/ {products.length}</span></span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e7eae6]"><div className={`h-full rounded-full ${color}`} style={{ width: `${Math.round((count / products.length) * 100)}%` }} /></div></div>)}<div className="rounded-2xl bg-[#edf0ec] p-4"><p className="text-xs leading-5 text-[#536057]">Pending products are listed above for review. Rejected products remain visible to their seller with the reason.</p></div></div> : <div className="mt-5 rounded-2xl border border-dashed border-[#cbd2cc] bg-white px-5 py-10 text-center"><p className="text-sm text-[#788079]">Catalog status will appear when products are listed.</p></div>}
              </article>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <Link href="/all-products" className="flex items-center justify-between gap-4 rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-5 transition hover:border-[#1d2c27] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]"><span className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-[#edf0ec]"><Store aria-hidden="true" className="size-5" /></span><span><span className="block text-sm font-semibold">View storefront catalog</span><span className="mt-1 block text-xs text-[#788079]">See products as customers see them</span></span></span><ArrowUpRight aria-hidden="true" className="size-4 text-[#788079]" /></Link>
              <div className="flex items-center justify-between gap-4 rounded-3xl border border-dashed border-[#cbd2cc] bg-[#f9faf8] p-5"><span className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-[#edf0ec]"><ShieldCheck aria-hidden="true" className="size-5" /></span><span><span className="block text-sm font-semibold">Admin access</span><span className="mt-1 block text-xs text-[#788079]">Signed in as platform administrator</span></span></span><span className="rounded-full bg-[#e6f1e9] px-2.5 py-1 text-xs font-medium text-[#28563a]">Verified</span></div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
