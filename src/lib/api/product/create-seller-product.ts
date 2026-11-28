import { API_BASE_URL } from "@/lib/api/base-url";

export type SellerProductPayload = {
  sellerId: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  brand: string;
  sku: string;
  images: {
    thumbnail: string;
    gallery: string[];
  };
  pricing: {
    price: number;
    discountPrice: number;
  };
  variants: Array<{
    size: string;
    color: string;
    stock: number;
  }>;
  details: {
    material: string;
    gender: string;
    season: string;
    weight: number;
  };
  shipping: {
    freeShipping: boolean;
    deliveryCharge: number;
  };
  status: "pending";
  createdAt: string;
  updatedAt: string;
};

const SELLER_PRODUCTS_API_URL = `${API_BASE_URL}/seller-products`;

function getErrorMessage(body: unknown) {
  if (typeof body === "string" && body.trim()) return body;
  if (typeof body !== "object" || body === null) return null;

  if ("message" in body && typeof body.message === "string") return body.message;
  if ("error" in body && typeof body.error === "string") return body.error;

  return null;
}

export async function createSellerProduct(product: SellerProductPayload): Promise<unknown> {
  const response = await fetch(SELLER_PRODUCTS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });

  const responseText = await response.text();
  let responseBody: unknown = null;

  if (responseText) {
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = responseText;
    }
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(responseBody) ?? `Product request failed (${response.status}).`);
  }

  return responseBody;
}
