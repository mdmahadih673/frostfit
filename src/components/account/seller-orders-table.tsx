"use client";

import { useEffect, useState } from "react";
import { AlertCircle, RefreshCw, ShoppingBag } from "lucide-react";

import { getSellerOrders, type SellerOrder } from "@/lib/api/seller/orders";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}

function formatPrice(value: number) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function SellerOrdersTable() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setOrders(await getSellerOrders());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load seller orders.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let current = true;
    getSellerOrders()
      .then((data) => { if (current) setOrders(data); })
      .catch((requestError) => {
        if (current) setError(requestError instanceof Error ? requestError.message : "Unable to load seller orders.");
      })
      .finally(() => { if (current) setIsLoading(false); });
    return () => { current = false; };
  }, []);

  if (isLoading) return <div className="rounded-2xl border border-[#e1e4df] bg-white px-5 py-12 text-center text-sm text-[#788079]">Loading your orders…</div>;

  if (error) {
    return <div className="rounded-2xl border border-[#e6d7d4] bg-[#fffaf9] px-5 py-8 text-center"><AlertCircle aria-hidden="true" className="mx-auto size-7 text-[#a94e42]" /><p className="mt-3 text-sm font-medium text-[#5f2e28]">Could not load orders</p><p className="mt-1 text-sm text-[#8b5a52]">{error}</p><button type="button" onClick={loadOrders} className="button-sm mt-5 inline-flex items-center gap-2 rounded-full bg-[#1d2c27] px-3 py-2 text-white hover:bg-[#344a42] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]"><RefreshCw aria-hidden="true" className="size-4" />Try again</button></div>;
  }

  if (!orders.length) {
    return <div className="rounded-2xl border border-dashed border-[#cbd2cc] bg-white px-5 py-12 text-center"><ShoppingBag aria-hidden="true" className="mx-auto size-8 text-[#9aa39c]" /><h2 className="mt-3 text-base font-semibold text-[#1d2c27]">No orders for your products yet</h2><p className="mx-auto mt-1 max-w-md text-sm text-[#788079]">Orders that include products from your store will appear here.</p></div>;
  }

  const countByStatus = (statuses: string[]) => orders.filter((order) => statuses.includes(order.status.toLowerCase())).length;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {[{ label: "New orders", count: countByStatus(["pending", "new"]) }, { label: "Processing orders", count: countByStatus(["processing", "confirmed", "shipped"]) }, { label: "Completed orders", count: countByStatus(["delivered", "completed"]) }].map((stat) => <article key={stat.label} className="rounded-2xl border border-[#e1e4df] bg-white p-5"><p className="text-sm text-[#788079]">{stat.label}</p><p className="mt-3 text-2xl font-semibold text-[#1d2c27]">{stat.count}</p></article>)}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-[#e1e4df] bg-white">
        <table className="w-full min-w-[760px] text-left">
          <thead className="bg-[#edf0ec] text-xs font-medium uppercase tracking-wide text-[#788079]"><tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Items</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th></tr></thead>
          <tbody className="divide-y divide-[#e9ece8]">
            {orders.map((order) => (
              <tr key={order._id} className="align-top hover:bg-[#fafbf9]">
                <td className="whitespace-nowrap px-4 py-4 font-mono text-xs font-semibold text-[#1d2c27]">#{order._id.slice(-6).toUpperCase()}</td>
                <td className="px-4 py-4"><p className="text-sm font-medium text-[#1d2c27]">{order.customerName}</p><p className="mt-1 text-xs text-[#788079]">{order.customerEmail}</p></td>
                <td className="px-4 py-4"><div className="space-y-1">{order.items.map((item, index) => <p key={`${order._id}-${item.productId}-${index}`} className="text-xs text-[#536057]"><span className="font-medium text-[#1d2c27]">{item.name}</span><span> · {item.size || "—"} / {item.color || "—"} × {item.quantity}</span></p>)}</div></td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-[#536057]">{formatDate(order.createdAt)}</td>
                <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-[#1d2c27]">{formatPrice(order.totalAmount)}</td>
                <td className="px-4 py-4"><span className="inline-flex rounded-full bg-[#f1eee7] px-2.5 py-1 text-xs font-medium capitalize text-[#766641]">{order.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
