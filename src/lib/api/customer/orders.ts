import { API_BASE_URL } from "@/lib/api/base-url";

export type CustomerOrderItem = {
  productId: string;
  name: string;
  brand: string;
  sku: string;
  thumbnail: string;
  unitPrice: number;
  size: string;
  color: string;
  quantity: number;
};

export type PaymentMethod = "cod" | "bkash" | "nagad" | "card";

export type ShippingAddress = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode?: string;
  note?: string;
  email?: string;
};

export type CustomerOrder = {
  _id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: CustomerOrderItem[];
  shippingAddress?: ShippingAddress;
  paymentMethod?: PaymentMethod;
  totalAmount: number;
  status: string;
  trackingUrl?: string;
  returnRequest?: { status: string; reason: string; requestedAt: string; updatedAt?: string };
  createdAt: string;
  updatedAt: string;
};

export type PlaceOrderPayload = {
  savedItemIds: string[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
};

const ORDERS_API_URL = `${API_BASE_URL}/api/orders`;

function customerHeaders(customerId: string, json = false) {
  if (!customerId.trim()) throw new Error("Customer ID is required to manage orders.");
  return {
    "x-customer-id": customerId,
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
}

async function parseJsonResponse(response: Response) {
  const text = await response.text();
  let body: unknown = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof body.message === "string"
        ? body.message
        : `Request failed (${response.status}).`;

    throw new Error(message);
  }

  return body;
}

export async function getCustomerOrders(customerId: string): Promise<CustomerOrder[]> {
  const response = await fetch(ORDERS_API_URL, { headers: customerHeaders(customerId) });
  const body = await parseJsonResponse(response);

  if (
    typeof body !== "object" ||
    body === null ||
    !("orders" in body) ||
    !Array.isArray(body.orders)
  ) {
    throw new Error("Invalid orders response.");
  }

  return body.orders as CustomerOrder[];
}

export async function placeCustomerOrder(
  customerId: string,
  payload: PlaceOrderPayload,
): Promise<CustomerOrder> {
  const response = await fetch(ORDERS_API_URL, {
    method: "POST",
    headers: customerHeaders(customerId, true),
    body: JSON.stringify(payload),
  });

  const body = await parseJsonResponse(response);

  if (typeof body !== "object" || body === null || !("order" in body)) {
    throw new Error("Invalid order response.");
  }

  return body.order as CustomerOrder;
}

export async function cancelCustomerOrder(customerId: string, orderId: string): Promise<void> {
  const response = await fetch(`${ORDERS_API_URL}/${encodeURIComponent(orderId)}`, {
    method: "PATCH",
    headers: customerHeaders(customerId, true),
    body: JSON.stringify({ status: "cancelled" }),
  });

  await parseJsonResponse(response);
}

export async function requestOrderReturn(customerId: string, orderId: string, reason: string): Promise<void> {
  const response = await fetch(`${ORDERS_API_URL}/${encodeURIComponent(orderId)}`, {
    method: "PATCH",
    headers: customerHeaders(customerId, true),
    body: JSON.stringify({ action: "request-return", reason }),
  });
  await parseJsonResponse(response);
}
