import { API_BASE_URL } from "@/lib/api/base-url";
import type { SellerProduct } from "@/lib/api/product/get-seller-products";

const ADMIN_PRODUCTS_URL = `${API_BASE_URL}/admin/seller-products`;

function adminHeaders(adminId: string, json = false) {
  if (!adminId.trim()) throw new Error("Admin ID is required to review products.");
  return { "x-admin-id": adminId, ...(json ? { "Content-Type": "application/json" } : {}) };
}

async function readResponse(response: Response) {
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof body === "object" && body !== null && "message" in body && typeof body.message === "string"
      ? body.message
      : `Admin catalog request failed (${response.status}).`;
    throw new Error(message);
  }
  return body;
}

export async function getAdminProducts(adminId: string): Promise<SellerProduct[]> {
  const body = await readResponse(await fetch(ADMIN_PRODUCTS_URL, { headers: adminHeaders(adminId) }));
  if (typeof body !== "object" || body === null || !("products" in body) || !Array.isArray(body.products)) {
    throw new Error("Admin catalog response is invalid.");
  }
  return body.products as SellerProduct[];
}

export async function reviewSellerProduct(
  adminId: string,
  productId: string,
  decision: "approved" | "rejected",
  reason = "",
): Promise<SellerProduct> {
  const response = await fetch(`${ADMIN_PRODUCTS_URL}/${encodeURIComponent(productId)}/review`, {
    method: "PATCH",
    headers: adminHeaders(adminId, true),
    body: JSON.stringify({ decision, reason }),
  });
  const body = await readResponse(response);
  if (typeof body !== "object" || body === null || !("product" in body)) {
    throw new Error("Product review response is invalid.");
  }
  return body.product as SellerProduct;
}
