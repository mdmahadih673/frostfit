 import type { SellerProductPayload } from "./create-seller-product";

export type SellerProduct = Omit<SellerProductPayload, "status"> & {
  _id: string;
  status: string;
};

const SELLER_PRODUCTS_API_URL = "http://localhost:5000/seller-products";

function getErrorMessage(body: unknown) {
  if (typeof body === "string" && body.trim()) return body;
  if (typeof body !== "object" || body === null) return null;

  if ("message" in body && typeof body.message === "string") return body.message;
  if ("error" in body && typeof body.error === "string") return body.error;

  return null;
}

export async function getSellerProducts(sellerId: string): Promise<SellerProduct[]> {
  const normalizedSellerId = sellerId.trim();

  if (!normalizedSellerId) {
    throw new Error("sellerId is required.");
  }

  const response = await fetch(
    `${SELLER_PRODUCTS_API_URL}/${encodeURIComponent(normalizedSellerId)}`,
  );
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
    throw new Error(
      getErrorMessage(responseBody) ?? `Seller products request failed (${response.status}).`,
    );
  }

  if (
    typeof responseBody !== "object" ||
    responseBody === null ||
    !("products" in responseBody) ||
    !Array.isArray(responseBody.products)
  ) {
    throw new Error("Seller products response is invalid.");
  }

  return responseBody.products as SellerProduct[];
}

export async function getAllProducts(): Promise<SellerProduct[]> {
  const response = await fetch(SELLER_PRODUCTS_API_URL);
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
    throw new Error(
      getErrorMessage(responseBody) ?? `Products request failed (${response.status}).`,
    );
  }

  if (
    typeof responseBody !== "object" ||
    responseBody === null ||
    !("products" in responseBody) ||
    !Array.isArray(responseBody.products)
  ) {
    throw new Error("Products response is invalid.");
  }

  return responseBody.products as SellerProduct[];
}

export type ProductSortOption = "newest" | "price-asc" | "price-desc";

export type ProductSearchParams = {
  q?: string;
  season?: string;
  gender?: string;
  size?: string;
  inStock?: boolean;
  sort?: ProductSortOption;
};

export type ProductSearchResponse = {
  products: SellerProduct[];
  totalCount: number;
  facets: {
    seasons: string[];
    genders: string[];
    sizes: string[];
  };
};

export async function searchProducts(
  params: ProductSearchParams = {},
  signal?: AbortSignal,
): Promise<ProductSearchResponse> {
  const searchParams = new URLSearchParams();

  if (params.q?.trim()) searchParams.set("q", params.q.trim());
  if (params.season && params.season !== "all") {
    searchParams.set("season", params.season);
  }
  if (params.gender && params.gender !== "all") {
    searchParams.set("gender", params.gender);
  }
  if (params.size && params.size !== "all") {
    searchParams.set("size", params.size);
  }
  if (params.inStock) searchParams.set("inStock", "true");
  if (params.sort) searchParams.set("sort", params.sort);

  const queryString = searchParams.toString();
  const response = await fetch(
    `/api/products${queryString ? `?${queryString}` : ""}`,
    { signal },
  );

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
    throw new Error(
      getErrorMessage(responseBody) ??
        `Products search request failed (${response.status}).`,
    );
  }

  if (
    typeof responseBody !== "object" ||
    responseBody === null ||
    !("products" in responseBody) ||
    !Array.isArray(responseBody.products)
  ) {
    throw new Error("Products search response is invalid.");
  }

  return responseBody as ProductSearchResponse;
}

export async function getProductByIdOrSlug(idOrSlug: string): Promise<SellerProduct | null> {
  const normalized = decodeURIComponent(idOrSlug).trim();
  if (!normalized) return null;

  const products = await getAllProducts();
  return (
    products.find(
      (product) => product._id === normalized || product.slug === normalized,
    ) ?? null
  );
}

async function sendSellerProductRequest(
  productId: string,
  sellerId: string,
  options: RequestInit,
) {
  const response = await fetch(
    `${SELLER_PRODUCTS_API_URL}/${encodeURIComponent(productId)}?sellerId=${encodeURIComponent(sellerId)}`,
    options,
  );
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
    throw new Error(
      getErrorMessage(responseBody) ?? `Seller product request failed (${response.status}).`,
    );
  }

  return responseBody;
}

export async function deleteSellerProduct(productId: string, sellerId: string) {
  return sendSellerProductRequest(productId, sellerId, { method: "DELETE" });
}

export async function updateSellerProduct(
  productId: string,
  sellerId: string,
  updates: Pick<SellerProduct, "name" | "description" | "pricing">,
): Promise<SellerProduct> {
  const responseBody = await sendSellerProductRequest(productId, sellerId, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sellerId, ...updates }),
  });

  if (
    typeof responseBody !== "object" ||
    responseBody === null ||
    !("product" in responseBody)
  ) {
    throw new Error("Seller product response is invalid.");
  }

  return responseBody.product as SellerProduct;
}
