"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, BarChart3, Boxes, PackageCheck, RefreshCw, ShoppingBag } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getSellerProducts, type SellerProduct } from "@/lib/api/product/get-seller-products";
import { getSellerOrders, type SellerOrder } from "@/lib/api/seller/orders";

type AnalyticsData = { products: SellerProduct[]; orders: SellerOrder[] };
type SalesPoint = { date: string; label: string; sales: number };

const completedStatuses = new Set(["confirmed", "delivered", "completed"]);

function formatPrice(value: number) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function dateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function buildSalesSeries(orders: SellerOrder[], days: number): SalesPoint[] {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const points: SalesPoint[] = Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - (days - index - 1));
    return {
      date: dateKey(date),
      label: date.toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" }),
      sales: 0,
    };
  });
  const pointByDate = new Map(points.map((point) => [point.date, point]));

  for (const order of orders) {
    if (!completedStatuses.has(order.status.toLowerCase())) continue;
    const createdAt = new Date(order.createdAt);
    if (Number.isNaN(createdAt.getTime())) continue;
    const point = pointByDate.get(dateKey(createdAt));
    if (point) point.sales += Number(order.totalAmount) || 0;
  }

  return points;
}

function statusStyles(status: string) {
  const key = status.toLowerCase();
  if (["delivered", "confirmed", "completed"].includes(key)) return "bg-[#e3f0e7] text-[#1d462b]";
  if (["rejected", "cancelled"].includes(key)) return "bg-[#f5e4e2] text-[#8b3a2f]";
  return "bg-[#f1eee7] text-[#766641]";
}

export function SellerAnalyticsDashboard({ sellerId }: { sellerId: string }) {
  const [data, setData] = useState<AnalyticsData>({ products: [], orders: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState(30);

  const fetchAnalytics = useCallback(async () => {
    const [products, orders] = await Promise.all([getSellerProducts(sellerId), getSellerOrders(sellerId)]);
    return { products, orders };
  }, [sellerId]);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await fetchAnalytics());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load store analytics.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchAnalytics]);

  useEffect(() => {
    let active = true;
    fetchAnalytics()
      .then((result) => { if (active) setData(result); })
      .catch((requestError) => { if (active) setError(requestError instanceof Error ? requestError.message : "Unable to load store analytics."); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [fetchAnalytics]);

  const salesSeries = useMemo(() => buildSalesSeries(data.orders, period), [data.orders, period]);
  const periodStart = salesSeries[0]?.date ?? "";
  const periodOrders = data.orders.filter((order) => {
    const created = new Date(order.createdAt);
    return !Number.isNaN(created.getTime()) && dateKey(created) >= periodStart && completedStatuses.has(order.status.toLowerCase());
  });
  const periodSales = periodOrders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
  const unitsSold = periodOrders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + (Number(item.quantity) || 0), 0), 0);
  const averageOrderValue = periodOrders.length ? periodSales / periodOrders.length : 0;
  const activeProducts = data.products.filter((product) => product.status.toLowerCase() === "active").length;

  const productTotals = new Map<string, { id: string; name: string; units: number; sales: number }>();
  for (const order of periodOrders) {
    for (const item of order.items) {
      const key = item.productId || item.name;
      const total = productTotals.get(key) ?? { id: key, name: item.name, units: 0, sales: 0 };
      total.units += Number(item.quantity) || 0;
      total.sales += (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
      productTotals.set(key, total);
    }
  }
  const bestSellers = [...productTotals.values()].sort((a, b) => b.units - a.units || b.sales - a.sales).slice(0, 5);

  const statusCounts = data.orders.reduce<Record<string, number>>((counts, order) => {
    const status = order.status.toLowerCase() || "pending";
    counts[status] = (counts[status] ?? 0) + 1;
    return counts;
  }, {});
  const statusOrder = ["pending", "confirmed", "delivered", "rejected", "cancelled"];
  const maxSales = Math.max(...salesSeries.map((point) => point.sales), 0);
  const chartTicks = [0, Math.round(maxSales / 2), maxSales].filter((tick, index, ticks) => index === 0 || tick !== ticks[index - 1]);

  const metrics = [
    { label: `Sales · ${period} days`, value: formatPrice(periodSales), note: "Confirmed and delivered orders", icon: BarChart3 },
    { label: `Orders · ${period} days`, value: periodOrders.length.toLocaleString(), note: "Confirmed and delivered", icon: ShoppingBag },
    { label: `Units sold · ${period} days`, value: unitsSold.toLocaleString(), note: "Across all order items", icon: PackageCheck },
    { label: "Average order", value: formatPrice(averageOrderValue), note: "Per confirmed or delivered order", icon: ShoppingBag },
    { label: "Active products", value: activeProducts.toLocaleString(), note: `Of ${data.products.length} listed products`, icon: Boxes },
  ];

  return (
    <div className="space-y-6">
      {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e6d7d4] bg-[#fffaf9] px-5 py-4 text-sm text-[#8b3a2f]"><span className="flex items-center gap-2"><AlertCircle aria-hidden="true" className="size-4 shrink-0" />{error}</span><button type="button" onClick={() => void loadAnalytics()} className="inline-flex items-center gap-1.5 font-medium underline underline-offset-2"><RefreshCw aria-hidden="true" className="size-3.5" />Retry</button></div>}

      <section aria-label="Store performance metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map(({ label, value, note, icon: Icon }) => <article key={label} className="rounded-2xl border border-[#e1e4df] bg-[#f9faf8] p-5">
          <div className="flex items-start justify-between gap-3"><p className="text-sm text-[#69736c]">{label}</p><span className="flex size-9 items-center justify-center rounded-xl bg-[#edf0ec] text-[#1d2c27]"><Icon aria-hidden="true" className="size-4" /></span></div>
          <p className="mt-4 min-h-9 text-2xl font-semibold tracking-[-0.04em] text-[#1d2c27]">{isLoading ? "…" : value}</p><p className="mt-1 text-xs text-[#89918b]">{note}</p>
        </article>)}
      </section>

      <section className="rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="caption-3 uppercase tracking-[0.14em] text-[#788079]">Store performance</p><h2 className="mt-2 text-xl font-semibold text-[#1d2c27]">Sales over time</h2><p className="mt-1 text-sm text-[#788079]">Confirmed and delivered order totals</p></div>
          <label className="flex items-center gap-2 text-sm text-[#536057]">Period<select aria-label="Sales chart period" value={period} onChange={(event) => setPeriod(Number(event.target.value))} className="h-10 rounded-full border border-[#d6dbd6] bg-white px-3 text-sm font-medium text-[#1d2c27] outline-none focus:border-[#1d2c27]"><option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option></select></label>
        </div>
        {isLoading ? <div className="mt-5 flex h-72 items-center justify-center rounded-2xl bg-white text-sm text-[#788079]">Loading sales data…</div> : periodSales > 0 ? <div className="mt-5 h-72 rounded-2xl border border-[#e9ece8] bg-white p-3 sm:p-5">
          <ResponsiveContainer width="100%" height="100%"><AreaChart data={salesSeries} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
            <defs><linearGradient id="sellerSalesFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#496b59" stopOpacity={0.2} /><stop offset="95%" stopColor="#496b59" stopOpacity={0.02} /></linearGradient></defs>
            <CartesianGrid stroke="#e9ece8" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={28} tick={{ fill: "#788079", fontSize: 12 }} />
            <YAxis width={72} tickLine={false} axisLine={false} tick={{ fill: "#788079", fontSize: 12 }} tickFormatter={(value: number) => formatPrice(value)} ticks={chartTicks} />
            <Tooltip formatter={(value) => [formatPrice(Number(value)), "Sales"]} labelStyle={{ color: "#1d2c27" }} contentStyle={{ border: "1px solid #e1e4df", borderRadius: 12, background: "#fff" }} />
            <Area type="monotone" dataKey="sales" stroke="#1d462b" strokeWidth={2.5} fill="url(#sellerSalesFill)" activeDot={{ r: 5, fill: "#1d462b" }} />
          </AreaChart></ResponsiveContainer>
        </div> : <div className="mt-5 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-[#cbd2cc] bg-white px-5 text-center">
          <BarChart3 aria-hidden="true" className="size-8 text-[#9aa39c]" /><p className="mt-3 text-sm font-medium text-[#1d2c27]">No sales in this period</p><p className="mt-1 max-w-sm text-sm text-[#788079]">The chart will fill in as confirmed or delivered orders arrive.</p>
        </div>}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-5 sm:p-7">
          <div><p className="caption-3 uppercase tracking-[0.14em] text-[#788079]">Catalog</p><h2 className="mt-2 text-xl font-semibold text-[#1d2c27]">Top products</h2><p className="mt-1 text-sm text-[#788079]">Ranked by units sold in the selected period</p></div>
          {isLoading ? <p className="py-8 text-center text-sm text-[#788079]">Loading products…</p> : bestSellers.length ? <div className="mt-5 overflow-x-auto rounded-2xl border border-[#e1e4df] bg-white"><table className="w-full min-w-[420px] text-left text-sm"><thead className="bg-[#edf0ec] text-xs uppercase tracking-wide text-[#788079]"><tr><th className="px-4 py-3 font-medium">Product</th><th className="px-4 py-3 text-right font-medium">Units</th><th className="px-4 py-3 text-right font-medium">Sales</th></tr></thead><tbody className="divide-y divide-[#e9ece8]">{bestSellers.map((item) => <tr key={item.id}><td className="max-w-[190px] truncate px-4 py-3 font-medium text-[#1d2c27]">{item.name}</td><td className="px-4 py-3 text-right text-[#536057]">{item.units}</td><td className="whitespace-nowrap px-4 py-3 text-right text-[#536057]">{formatPrice(item.sales)}</td></tr>)}</tbody></table></div> : <div className="mt-5 rounded-2xl border border-dashed border-[#cbd2cc] bg-white px-5 py-8 text-center text-sm text-[#788079]">No product sales in this period yet.</div>}
        </article>

        <article className="rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-5 sm:p-7">
          <div><p className="caption-3 uppercase tracking-[0.14em] text-[#788079]">Fulfillment</p><h2 className="mt-2 text-xl font-semibold text-[#1d2c27]">Order status</h2><p className="mt-1 text-sm text-[#788079]">Current status for orders containing your products</p></div>
          {isLoading ? <p className="py-8 text-center text-sm text-[#788079]">Loading orders…</p> : data.orders.length ? <div className="mt-5 space-y-4">{statusOrder.filter((status) => statusCounts[status]).map((status) => {
            const count = statusCounts[status];
            const percent = Math.round((count / data.orders.length) * 100);
            return <div key={status}><div className="flex items-center justify-between gap-3 text-sm"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles(status)}`}>{status}</span><span className="text-[#536057]">{count} <span className="text-[#89918b]">· {percent}%</span></span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e7eae6]"><div className="h-full rounded-full bg-[#496b59] transition-[width]" style={{ width: `${percent}%` }} /></div></div>;
          })}</div> : <div className="mt-5 rounded-2xl border border-dashed border-[#cbd2cc] bg-white px-5 py-8 text-center text-sm text-[#788079]">Orders will be summarized here when customers purchase your products.</div>}
        </article>
      </section>
    </div>
  );
}
