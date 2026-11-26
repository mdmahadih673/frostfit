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
};

export type CustomerOrder = {
  _id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: CustomerOrderItem[];
  shippingAddress?: ShippingAddress;
  paymentMethod?: PaymentMethod;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type PlaceOrderPayload = {
  savedItemIds: string[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
};

const ORDERS_API_URL = "/api/customer/orders";

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

export async function getCustomerOrders(): Promise<CustomerOrder[]> {
  const response = await fetch(ORDERS_API_URL);
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
  payload: PlaceOrderPayload,
): Promise<CustomerOrder> {
  const response = await fetch(ORDERS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await parseJsonResponse(response);

  if (typeof body !== "object" || body === null || !("order" in body)) {
    throw new Error("Invalid order response.");
  }

  return body.order as CustomerOrder;
}
