"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Compass,
  ExternalLink,
  Heart,
  LayoutDashboard,
  MapPin,
  Package,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { Navbar } from "@/components/home/navbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  deleteCustomerOrder,
  getCustomerOrders,
  type CustomerOrder,
} from "@/lib/api/customer/orders";
import {
  getSavedItems,
  removeSavedItem,
  type SavedOrderItem,
} from "@/lib/api/customer/saved-items";

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

function formatPrice(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value?: string) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function CustomerDashboard({
  name,
  email,
  role,
}: CustomerDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab");
  const activeTab: CustomerTab =
    tabParam === "orders" || tabParam === "saved" || tabParam === "addresses"
      ? tabParam
      : "overview";

  const [savedItems, setSavedItems] = useState<SavedOrderItem[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);
  const [savedError, setSavedError] = useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<CustomerOrder | null>(null);

  const orderedJustNow = searchParams.get("ordered") === "1";

  const setActiveTab = (tab: CustomerTab) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (tab === "overview") {
      nextParams.delete("tab");
    } else {
      nextParams.set("tab", tab);
    }
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const loadSavedItems = async () => {
    setIsLoadingSaved(true);
    setSavedError(null);

    try {
      setSavedItems(await getSavedItems());
    } catch (requestError) {
      setSavedError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load saved items.",
      );
    } finally {
      setIsLoadingSaved(false);
    }
  };

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    setOrdersError(null);

    try {
      setOrders(await getCustomerOrders());
    } catch (requestError) {
      setOrdersError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load orders.",
      );
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;

    getSavedItems()
      .then((items) => {
        if (isCurrent) setSavedItems(items);
      })
      .catch((requestError) => {
        if (isCurrent) {
          setSavedError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load saved items.",
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoadingSaved(false);
      });

    getCustomerOrders()
      .then((allOrders) => {
        if (isCurrent) setOrders(allOrders);
      })
      .catch((requestError) => {
        if (isCurrent) {
          setOrdersError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load orders.",
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoadingOrders(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const validSelectedIds = useMemo(() => {
    const existingIds = new Set(savedItems.map((item) => item._id));
    return selectedIds.filter((id) => existingIds.has(id));
  }, [savedItems, selectedIds]);

  const allSelected =
    savedItems.length > 0 && validSelectedIds.length === savedItems.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(savedItems.map((item) => item._id));
    }
  };

  const toggleSelectItem = (itemId: string) => {
    setSelectedIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const handleRemoveSavedItem = async (itemId: string) => {
    setRemovingItemId(itemId);
    try {
      await removeSavedItem(itemId);
      setSavedItems((prev) => prev.filter((item) => item._id !== itemId));
      setSelectedIds((prev) => prev.filter((id) => id !== itemId));
    } catch (requestError) {
      setSavedError(
        requestError instanceof Error
          ? requestError.message
          : "Could not remove item.",
      );
    } finally {
      setRemovingItemId(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    setCancellingOrderId(orderId);
    setOrdersError(null);
    try {
      await deleteCustomerOrder(orderId);
      setOrders((currentOrders) =>
        currentOrders.filter((order) => order._id !== orderId),
      );
      setOrderToCancel(null);
    } catch (cancelError) {
      setOrdersError(
        cancelError instanceof Error
          ? cancelError.message
          : "Failed to cancel order.",
      );
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleOrderNow = () => {
    if (!validSelectedIds.length) return;
    router.push(`/checkout?items=${encodeURIComponent(validSelectedIds.join(","))}`);
  };

  const savedItemsTotal = savedItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  const selectedSubtotal = useMemo(() => {
    const selectedSet = new Set(validSelectedIds);
    return savedItems
      .filter((item) => selectedSet.has(item._id))
      .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [savedItems, validSelectedIds]);

  const activeOrdersCount = orders.filter(
    (order) => order.status !== "delivered" && order.status !== "cancelled",
  ).length;
  const completedOrdersCount = orders.filter(
    (order) => order.status === "delivered",
  ).length;

  const summaryStats = [
    {
      label: "Active orders",
      value: isLoadingOrders ? "—" : String(activeOrdersCount),
      note:
        activeOrdersCount > 0
          ? `${activeOrdersCount} awaiting fulfillment`
          : "No orders in transit",
      icon: Package,
    },
    {
      label: "Saved items",
      value: isLoadingSaved ? "—" : String(savedItems.length),
      note:
        savedItems.length > 0
          ? `Total ${formatPrice(savedItemsTotal)}`
          : "Save layers for later",
      icon: Heart,
    },
    {
      label: "Completed orders",
      value: isLoadingOrders ? "—" : String(completedOrdersCount),
      note:
        orders.length > 0
          ? `${orders.length} total order${orders.length > 1 ? "s" : ""}`
          : "Order history appears here",
      icon: ShoppingBag,
    },
    {
      label: "Saved addresses",
      value: "0",
      note: "Add a delivery address",
      icon: MapPin,
    },
  ];

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
              const badgeCount =
                id === "saved"
                  ? savedItems.length
                  : id === "orders"
                    ? orders.length
                    : 0;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex min-h-10 items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d2c27] ${
                    isActive
                      ? "bg-[#1d2c27] font-medium text-white"
                      : "text-[#626b64] hover:bg-[#edf0ec] hover:text-[#1d2c27]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon aria-hidden="true" className="size-4 shrink-0" />
                    <span>{label}</span>
                  </span>
                  {badgeCount > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-[#e3e7e2] text-[#1d2c27]"
                      }`}
                    >
                      {badgeCount}
                    </span>
                  )}
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
                        Saved for order
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-[#1d2c27]">
                        Saved items
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("saved")}
                      className="inline-flex items-center gap-1 text-sm font-medium text-[#1d2c27] hover:underline"
                    >
                      View table{" "}
                      <ArrowUpRight aria-hidden="true" className="size-4" />
                    </button>
                  </div>

                  {savedItems.length > 0 ? (
                    <div className="mt-5 space-y-2.5">
                      {savedItems.slice(0, 3).map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-[#e1e4df] bg-white px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[#1d2c27]">
                              {item.name}
                            </p>
                            <p className="text-xs text-[#6f746e]">
                              {item.size || "—"} / {item.color || "—"} ×{" "}
                              {item.quantity}
                            </p>
                          </div>
                          <span className="shrink-0 text-sm font-medium text-[#1d2c27]">
                            {formatPrice(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-dashed border-[#cbd2cc] bg-white px-5 py-9 text-center">
                      <Heart
                        aria-hidden="true"
                        className="mx-auto size-7 text-[#9aa39c]"
                      />
                      <p className="mt-3 text-sm font-medium text-[#1d2c27]">
                        No saved items yet
                      </p>
                      <p className="mt-1 text-sm text-[#788079]">
                        Click &ldquo;Select for order&rdquo; on any product to
                        save it here.
                      </p>
                    </div>
                  )}
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
                      Profile{" "}
                      <ArrowUpRight aria-hidden="true" className="size-4" />
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

              {orderedJustNow && (
                <div className="mt-5 flex items-center gap-2 rounded-2xl border border-[#cde0d3] bg-[#eff7f1] px-4 py-3 text-sm font-medium text-[#1d462b]">
                  <CheckCircle2 aria-hidden="true" className="size-4 shrink-0" />
                  <span>Your order has been placed successfully!</span>
                </div>
              )}

              {isLoadingOrders ? (
                <p className="body-6 py-12 text-center text-[#6f746e]">
                  Loading orders…
                </p>
              ) : ordersError ? (
                <div className="mt-6 rounded-2xl border border-[#e6d7d4] bg-[#fffaf9] px-5 py-10 text-center">
                  <AlertCircle
                    aria-hidden="true"
                    className="mx-auto size-7 text-[#a94e42]"
                  />
                  <p className="mt-3 text-sm font-medium text-[#5f2e28]">
                    Could not load orders
                  </p>
                  <p className="mt-1 text-sm text-[#8b5a52]">{ordersError}</p>
                  <button
                    type="button"
                    onClick={loadOrders}
                    className="button-sm mt-5 inline-flex items-center gap-2 rounded-full bg-[#1d2c27] px-4 py-2 text-white transition hover:bg-[#344a42]"
                  >
                    <RefreshCw aria-hidden="true" className="size-4" />
                    Try again
                  </button>
                </div>
              ) : !orders.length ? (
                <div className="mt-6 rounded-2xl border border-dashed border-[#cbd2cc] bg-white px-5 py-14 text-center">
                  <ShoppingBag
                    aria-hidden="true"
                    className="mx-auto size-8 text-[#9aa39c]"
                  />
                  <p className="mt-3 text-sm font-medium text-[#1d2c27]">
                    You have no orders yet
                  </p>
                  <p className="mt-1 text-sm text-[#788079]">
                    Select items from Saved items and click &ldquo;Order
                    now&rdquo; to place an order.
                  </p>
                  <Link
                    href="/all-products"
                    className="button-sm mt-5 inline-flex items-center gap-2 rounded-full bg-[#1d2c27] px-4 py-2 text-white transition hover:bg-[#344a42]"
                  >
                    Browse products
                  </Link>
                </div>
              ) : (
                <div className="mt-6 overflow-x-auto rounded-2xl border border-[#e1e4df] bg-white">
                  <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#eceee9] bg-[#f9faf8] text-xs font-semibold uppercase tracking-[0.08em] text-[#6f746e]">
                        <th className="px-4 py-3.5">Order ID</th>
                        <th className="px-4 py-3.5">Date</th>
                        <th className="px-4 py-3.5">Items</th>
                        <th className="px-4 py-3.5">Delivery / Payment</th>
                        <th className="px-4 py-3.5">Total</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eef0ec]">
                      {orders.map((order) => (
                        <tr
                          key={order._id}
                          className="transition-colors hover:bg-[#fafbf9]"
                        >
                          <td className="px-4 py-3.5 font-mono text-xs font-semibold text-[#1d2c27]">
                            #{order._id.slice(-6).toUpperCase()}
                          </td>
                          <td className="px-4 py-3.5 text-xs text-[#536057]">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="space-y-1">
                              {order.items.map((item, idx) => (
                                <p
                                  key={`${order._id}-${item.productId}-${idx}`}
                                  className="text-xs text-[#151515]"
                                >
                                  <span className="font-medium">
                                    {item.name}
                                  </span>{" "}
                                  <span className="text-[#6f746e]">
                                    ({item.size || "—"} / {item.color || "—"} ×{" "}
                                    {item.quantity})
                                  </span>
                                </p>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-[#536057]">
                            <p className="font-medium uppercase text-[#1d2c27]">
                              {order.paymentMethod || "COD"}
                            </p>
                            {order.shippingAddress?.city && (
                              <p className="text-[#6f746e]">
                                {order.shippingAddress.city}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-[#1d2c27]">
                            {formatPrice(order.totalAmount)}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                                order.status === "confirmed"
                                  ? "bg-[#e3f0e7] text-[#1d462b]"
                                  : order.status === "cancelled"
                                    ? "bg-[#f5e4e2] text-[#8b3a2f]"
                                    : order.status === "delivered"
                                      ? "bg-[#e5eee9] text-[#24553a]"
                                      : "bg-[#f0ece1] text-[#6a5a32]"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex flex-col gap-1.5">
                              {(order.status === "pending" ||
                                order.status === "processing") && (
                                <button
                                  type="button"
                                  onClick={() => setOrderToCancel(order)}
                                  disabled={cancellingOrderId === order._id}
                                  className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-[#e3d2cf] px-3 py-1.5 text-xs font-medium text-[#9e3f33] transition hover:bg-[#fff5f3] disabled:opacity-50"
                                >
                                  <X aria-hidden="true" className="size-3.5" />
                                  {cancellingOrderId === order._id
                                    ? "Cancelling…"
                                    : "Cancel"}
                                </button>
                              )}

                              {order.status === "confirmed" && (
                                <Link
                                  href={`/dashboard?tab=orders`}
                                  className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-[#1d462b] underline hover:text-[#24553a]"
                                >
                                  <ExternalLink
                                    aria-hidden="true"
                                    className="size-3.5"
                                  />
                                  Track order
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activeTab === "saved" && (
            <section className="rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-6 sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="caption-3 uppercase tracking-[0.14em] text-[#788079]">
                    Selected for order
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-[#1d2c27]">
                    Saved items
                  </h1>
                  <p className="body-6 mt-2 text-[#69736c]">
                    Select one or more products below and click Order now.
                  </p>
                </div>

                {savedItems.length > 0 && (
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-2xl border border-[#e1e4df] bg-white px-4 py-2 text-right">
                      <p className="caption-4 text-[#6f746e]">
                        {validSelectedIds.length > 0
                          ? `Selected (${validSelectedIds.length})`
                          : "Estimated total"}
                      </p>
                      <p className="text-lg font-semibold text-[#1d2c27]">
                        {formatPrice(
                          validSelectedIds.length > 0
                            ? selectedSubtotal
                            : savedItemsTotal,
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={!validSelectedIds.length}
                      onClick={handleOrderNow}
                      className="button-sm inline-flex h-12 items-center gap-2 rounded-full bg-[#1d2c27] px-6 text-white transition duration-300 hover:bg-[#344a42] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#9aa39c]"
                    >
                      <ShoppingBag aria-hidden="true" className="size-4" />
                      {validSelectedIds.length > 0
                        ? `Order now (${validSelectedIds.length})`
                        : "Order now"}
                    </button>
                  </div>
                )}
              </div>

              {isLoadingSaved ? (
                <p className="body-6 py-12 text-center text-[#6f746e]">
                  Loading saved items…
                </p>
              ) : savedError ? (
                <div className="mt-6 rounded-2xl border border-[#e6d7d4] bg-[#fffaf9] px-5 py-10 text-center">
                  <AlertCircle
                    aria-hidden="true"
                    className="mx-auto size-7 text-[#a94e42]"
                  />
                  <p className="mt-3 text-sm font-medium text-[#5f2e28]">
                    Could not load saved items
                  </p>
                  <p className="mt-1 text-sm text-[#8b5a52]">{savedError}</p>
                  <button
                    type="button"
                    onClick={loadSavedItems}
                    className="button-sm mt-5 inline-flex items-center gap-2 rounded-full bg-[#1d2c27] px-4 py-2 text-white transition hover:bg-[#344a42]"
                  >
                    <RefreshCw aria-hidden="true" className="size-4" />
                    Try again
                  </button>
                </div>
              ) : !savedItems.length ? (
                <div className="mt-6 rounded-2xl border border-dashed border-[#cbd2cc] bg-white px-5 py-14 text-center">
                  <Heart
                    aria-hidden="true"
                    className="mx-auto size-8 text-[#9aa39c]"
                  />
                  <p className="mt-3 text-sm font-medium text-[#1d2c27]">
                    No saved items yet
                  </p>
                  <p className="mt-1 text-sm text-[#788079]">
                    Click &ldquo;Select for order&rdquo; on any product details
                    page to add it to this table.
                  </p>
                  <Link
                    href="/all-products"
                    className="button-sm mt-5 inline-flex items-center gap-2 rounded-full bg-[#1d2c27] px-4 py-2 text-white transition hover:bg-[#344a42]"
                  >
                    Explore collection
                  </Link>
                </div>
              ) : (
                <div className="mt-6 overflow-x-auto rounded-2xl border border-[#e1e4df] bg-white">
                  <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#eceee9] bg-[#f9faf8] text-xs font-semibold uppercase tracking-[0.08em] text-[#6f746e]">
                        <th className="w-12 px-4 py-3.5">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={toggleSelectAll}
                            aria-label="Select all saved items"
                            className="size-4 cursor-pointer accent-[#1d2c27]"
                          />
                        </th>
                        <th className="px-4 py-3.5">Product</th>
                        <th className="px-4 py-3.5">SKU</th>
                        <th className="px-4 py-3.5">Variant</th>
                        <th className="px-4 py-3.5">Qty</th>
                        <th className="px-4 py-3.5">Unit price</th>
                        <th className="px-4 py-3.5">Subtotal</th>
                        <th className="px-4 py-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eef0ec]">
                      {savedItems.map((item) => {
                        const isSelected = validSelectedIds.includes(item._id);
                        return (
                          <tr
                            key={item._id}
                            className={`transition-colors ${
                              isSelected ? "bg-[#f3f6f4]" : "hover:bg-[#fafbf9]"
                            }`}
                          >
                            <td className="px-4 py-3.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectItem(item._id)}
                                aria-label={`Select ${item.name} for order`}
                                className="size-4 cursor-pointer accent-[#1d2c27]"
                              />
                            </td>
                            <td className="px-4 py-3.5">
                              <Link
                                href={`/all-products/${encodeURIComponent(item.productId)}`}
                                className="group flex items-center gap-3"
                              >
                                <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-[#edf0ec]">
                                  {item.thumbnail ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={item.thumbnail}
                                      alt={item.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : null}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate font-medium text-[#1d2c27] group-hover:underline">
                                    {item.name}
                                  </p>
                                  <p className="truncate text-xs text-[#6f746e]">
                                    {item.brand}
                                  </p>
                                </div>
                              </Link>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-[#536057]">
                              {item.sku || "—"}
                            </td>
                            <td className="px-4 py-3.5 text-xs text-[#536057]">
                              <span className="inline-block whitespace-nowrap rounded-full bg-[#edf0ec] px-2.5 py-1 font-medium text-[#1d2c27]">
                                {item.size || "—"} / {item.color || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-medium text-[#151515]">
                              {item.quantity}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3.5 text-[#536057]">
                              {formatPrice(item.unitPrice)}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-[#1d2c27]">
                              {formatPrice(item.unitPrice * item.quantity)}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <button
                                type="button"
                                disabled={removingItemId === item._id}
                                onClick={() => handleRemoveSavedItem(item._id)}
                                aria-label={`Remove ${item.name}`}
                                className="inline-flex items-center gap-1.5 rounded-full border border-[#ead8d5] bg-[#fff8f6] px-3 py-1.5 text-xs font-medium text-[#98483e] shadow-sm transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[#d9b8b2] hover:bg-[#f8eeec] hover:text-[#7e372f] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a94e42] disabled:cursor-wait disabled:opacity-60"
                              >
                                <Trash2
                                  aria-hidden="true"
                                  className="size-3.5"
                                />
                                {removingItemId === item._id
                                  ? "Removing…"
                                  : "Remove"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
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

      <AlertDialog
        open={Boolean(orderToCancel)}
        onOpenChange={(open) => {
          if (!open && !cancellingOrderId) setOrderToCancel(null);
        }}
      >
        <AlertDialogContent className="max-w-md gap-5 rounded-2xl border border-[#e5d8d4] bg-[#fffdfc] p-6 shadow-[0_24px_70px_rgba(50,38,34,0.18)]">
          <AlertDialogHeader className="place-items-start gap-3 text-left">
            <AlertDialogMedia className="mb-0 size-11 rounded-xl bg-[#f8e9e6] text-[#a94e42]">
              <AlertCircle aria-hidden="true" className="size-5" />
            </AlertDialogMedia>
            <div>
              <AlertDialogTitle className="text-lg font-semibold tracking-[-0.03em] text-[#34201c]">
                Cancel this order?
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-2 text-pretty text-[#775f59]">
                Order #{orderToCancel?._id.slice(-6).toUpperCase()} will be cancelled. This action cannot be undone.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="-mx-6 -mb-6 border-[#eadeda] bg-[#fff9f7] p-4 sm:justify-end">
            <AlertDialogCancel
              disabled={Boolean(cancellingOrderId)}
              className="border-[#d9ceca] bg-white text-[#5f4b46] hover:bg-[#f6f1ef]"
            >
              Keep order
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={!orderToCancel || Boolean(cancellingOrderId)}
              onClick={() => {
                if (orderToCancel) void handleCancelOrder(orderToCancel._id);
              }}
              className="bg-[#a94e42] text-white hover:bg-[#8d4036]"
            >
              {cancellingOrderId ? "Cancelling…" : "Cancel order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
