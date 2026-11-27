"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, Eye, RefreshCw, ShoppingBag, X } from "lucide-react";

import { getSellerOrders, type SellerOrder, updateSellerOrderStatus } from "@/lib/api/seller/orders";

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
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const handleStatusUpdate = async (order: SellerOrder, status: "confirmed" | "rejected") => {
    setUpdatingOrderId(order._id);
    setError(null);
    try {
      await updateSellerOrderStatus(order._id, status);
      setOrders((current) => current.map((item) => item._id === order._id ? { ...item, status } : item));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update order status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

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
        {error ? <p role="alert" className="border-b border-[#ead8d5] bg-[#fff8f6] px-4 py-3 text-sm text-[#98483e]">{error}</p> : null}
        <table className="w-full min-w-[1050px] text-left">
          <thead className="bg-[#edf0ec] text-xs font-medium uppercase tracking-wide text-[#788079]"><tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Items</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody className="divide-y divide-[#e9ece8]">
            {orders.map((order) => (
              <tr key={order._id} className="align-top hover:bg-[#fafbf9]">
                <td className="whitespace-nowrap px-4 py-4 font-mono text-xs font-semibold text-[#1d2c27]">#{order._id.slice(-6).toUpperCase()}</td>
                <td className="px-4 py-4"><p className="text-sm font-medium text-[#1d2c27]">{order.customerName}</p><p className="mt-1 text-xs text-[#788079]">{order.customerEmail}</p></td>
                <td className="px-4 py-4"><div className="space-y-1">{order.items.map((item, index) => <p key={`${order._id}-${item.productId}-${index}`} className="text-xs text-[#536057]"><span className="font-medium text-[#1d2c27]">{item.name}</span><span> · {item.size || "—"} / {item.color || "—"} × {item.quantity}</span></p>)}</div></td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-[#536057]">{formatDate(order.createdAt)}</td>
                <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-[#1d2c27]">{formatPrice(order.totalAmount)}</td>
                <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${order.status === "confirmed" ? "bg-[#e3f0e7] text-[#1d462b]" : order.status === "rejected" ? "bg-[#f5e4e2] text-[#8b3a2f]" : order.status === "delivered" ? "bg-[#e5eee9] text-[#24553a]" : "bg-[#f1eee7] text-[#766641]"}`}>{order.status}</span></td>
                <td className="px-4 py-4"><div className="flex items-center gap-2"><button type="button" onClick={() => setSelectedOrder(selectedOrder === order._id ? null : order._id)} className="button-sm inline-flex items-center gap-1 rounded-full border border-[#d8ddd8] px-3 py-1.5 text-[#536057] hover:bg-[#edf0ec] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d2c27]"><Eye aria-hidden="true" className="size-3.5" />View details</button>{["pending", "new"].includes(order.status.toLowerCase()) ? <><button type="button" disabled={updatingOrderId === order._id} onClick={() => void handleStatusUpdate(order, "confirmed")} className="inline-flex size-8 items-center justify-center rounded-full bg-[#e3f0e7] text-[#1d462b] hover:bg-[#d2e7d8] disabled:opacity-50" aria-label="Confirm order" title="Confirm order"><Check aria-hidden="true" className="size-4" /></button><button type="button" disabled={updatingOrderId === order._id} onClick={() => void handleStatusUpdate(order, "rejected")} className="inline-flex size-8 items-center justify-center rounded-full bg-[#f5e4e2] text-[#8b3a2f] hover:bg-[#efd5d2] disabled:opacity-50" aria-label="Reject order" title="Reject order"><X aria-hidden="true" className="size-4" /></button></> : null}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {selectedOrder ? (() => {
          const order = orders.find((item) => item._id === selectedOrder);
          if (!order) return null;
          return <section className="border-t border-[#e9ece8] bg-[#fafbf9] p-5" aria-live="polite"><div className="flex items-start justify-between gap-4"><div><p className="caption-3 uppercase tracking-[0.14em] text-[#788079]">Order details</p><h2 className="mt-1 text-lg font-semibold text-[#1d2c27]">Order #{order._id.slice(-6).toUpperCase()}</h2></div><button type="button" onClick={() => setSelectedOrder(null)} className="inline-flex size-8 items-center justify-center rounded-lg text-[#536057] hover:bg-[#edf0ec]" aria-label="Close order details"><X aria-hidden="true" className="size-4" /></button></div><div className="mt-5 grid gap-5 lg:grid-cols-2"><div><h3 className="text-sm font-semibold text-[#1d2c27]">Items from your store</h3><div className="mt-2 divide-y divide-[#e9ece8] rounded-xl border border-[#e1e4df] bg-white px-4">{order.items.map((item, index) => <div key={`${order._id}-detail-${index}`} className="flex justify-between gap-4 py-3 text-sm"><div><p className="font-medium text-[#1d2c27]">{item.name}</p><p className="mt-1 text-xs text-[#788079]">SKU {item.sku || "—"} · {item.size || "—"} / {item.color || "—"} · Qty {item.quantity}</p></div><p className="shrink-0 text-[#536057]">{formatPrice(item.unitPrice * item.quantity)}</p></div>)}</div></div><div><h3 className="text-sm font-semibold text-[#1d2c27]">Customer and delivery</h3><dl className="mt-2 grid gap-3 rounded-xl border border-[#e1e4df] bg-white p-4 text-sm sm:grid-cols-2"><div><dt className="text-xs text-[#788079]">Customer</dt><dd className="mt-1 font-medium text-[#1d2c27]">{order.customerName}</dd></div><div><dt className="text-xs text-[#788079]">Email</dt><dd className="mt-1 break-all text-[#536057]">{order.customerEmail || "—"}</dd></div><div><dt className="text-xs text-[#788079]">Phone</dt><dd className="mt-1 text-[#536057]">{order.shippingAddress?.phone || "—"}</dd></div><div><dt className="text-xs text-[#788079]">Payment</dt><dd className="mt-1 uppercase text-[#536057]">{order.paymentMethod || "—"}</dd></div><div className="sm:col-span-2"><dt className="text-xs text-[#788079]">Address</dt><dd className="mt-1 text-[#536057]">{[order.shippingAddress?.address, order.shippingAddress?.city, order.shippingAddress?.postalCode].filter(Boolean).join(", ") || "—"}</dd></div>{order.shippingAddress?.note ? <div className="sm:col-span-2"><dt className="text-xs text-[#788079]">Delivery note</dt><dd className="mt-1 text-[#536057]">{order.shippingAddress.note}</dd></div> : null}</dl></div></div></section>;
        })() : null}
      </div>
    </div>
  );
}
