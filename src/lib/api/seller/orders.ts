import { API_BASE_URL } from "@/lib/api/base-url";

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
  returnRequest?: { status: string; reason: string; requestedAt: string; updatedAt?: string } | null;
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

export type SellerOrderStatus = "confirmed" | "rejected" | "delivered";
const SELLER_ORDERS_API_URL = `${API_BASE_URL}/api/seller/orders`;

function sellerHeaders(sellerId: string, json = false) {
  if (!sellerId.trim()) throw new Error("Seller ID is required to manage orders.");
  return {
    "x-seller-id": sellerId,
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
}

export async function getSellerOrders(sellerId: string): Promise<SellerOrder[]> {
  const response = await fetch(SELLER_ORDERS_API_URL, { headers: sellerHeaders(sellerId) });
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
  sellerId: string,
  orderId: string,
  status?: SellerOrderStatus,
  trackingUrl?: string,
) {
  const response = await fetch(SELLER_ORDERS_API_URL, {
    method: "PATCH",
    headers: sellerHeaders(sellerId, true),
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

export async function updateSellerReturnRequest(sellerId: string, orderId: string, returnStatus: "approved" | "rejected" | "refunded") {
  const response = await fetch(SELLER_ORDERS_API_URL, {
    method: "PATCH",
    headers: sellerHeaders(sellerId, true),
    body: JSON.stringify({ orderId, returnStatus }),
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof body === "object" && body !== null && "message" in body && typeof body.message === "string" ? body.message : `Could not update return request (${response.status}).`;
    throw new Error(message);
  }
}
