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
  createdAt: string;
  paymentMethod: string;
};

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
