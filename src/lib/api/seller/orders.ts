export type SellerOrderItem = {
  productId: string;
  name: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  size?: string;
  color?: string;
};

export type SellerOrder = {
  _id: string;
  customerName: string;
  customerEmail: string;
  items: SellerOrderItem[];
  totalAmount: number;
  status: string;
  trackingUrl?: string;
  createdAt: string;
  paymentMethod: string;
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    note?: string;
  } | null;
};

export type SellerOrderStatus = "confirmed" | "rejected";

export async function getSellerOrders(): Promise<SellerOrder[]> {
  const response = await fetch("/api/seller/orders");
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof body === "object" && body !== null && "message" in body && typeof body.message === "string"
        ? body.message
        : `Could not load seller orders (${response.status}).`;
    throw new Error(message);
  }

  if (typeof body !== "object" || body === null || !("orders" in body) || !Array.isArray(body.orders)) {
    throw new Error("Seller orders response is invalid.");
  }

  return body.orders as SellerOrder[];
}

export async function updateSellerOrderStatus(
  orderId: string,
  status?: SellerOrderStatus,
  trackingUrl?: string,
) {
  const response = await fetch("/api/seller/orders", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, ...(status ? { status } : {}), ...(trackingUrl !== undefined ? { trackingUrl } : {}) }),
  });
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof body === "object" && body !== null && "message" in body && typeof body.message === "string"
        ? body.message
        : `Could not update order (${response.status}).`;
    throw new Error(message);
  }
}
