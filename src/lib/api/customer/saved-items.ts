export type SavedOrderItem = {
  _id: string;
  userId: string;
  productId: string;
  name: string;
  brand: string;
  sku: string;
  thumbnail: string;
  unitPrice: number;
  size: string;
  color: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
};

export type SaveOrderItemPayload = {
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

const SAVED_ITEMS_API_URL = "/api/customer/saved-items";

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

    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return body;
}

export async function getSavedItems(): Promise<SavedOrderItem[]> {
  const response = await fetch(SAVED_ITEMS_API_URL);
  const body = await parseJsonResponse(response);

  if (
    typeof body !== "object" ||
    body === null ||
    !("items" in body) ||
    !Array.isArray(body.items)
  ) {
    throw new Error("Invalid saved items response.");
  }

  return body.items as SavedOrderItem[];
}

export async function saveItemForOrder(
  payload: SaveOrderItemPayload,
): Promise<SavedOrderItem> {
  const response = await fetch(SAVED_ITEMS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await parseJsonResponse(response);

  if (typeof body !== "object" || body === null || !("item" in body)) {
    throw new Error("Invalid save item response.");
  }

  return body.item as SavedOrderItem;
}

export async function removeSavedItem(itemId: string): Promise<void> {
  const response = await fetch(
    `${SAVED_ITEMS_API_URL}?itemId=${encodeURIComponent(itemId)}`,
    { method: "DELETE" },
  );
  await parseJsonResponse(response);
}
