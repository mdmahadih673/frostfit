import { API_BASE_URL } from "@/lib/api/base-url";

export type ProductReview = {
  _id: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductReviewSummary = {
  reviews: ProductReview[];
  averageRating: number;
  reviewCount: number;
};

async function readBody(response: Response) {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(typeof body?.message === "string" ? body.message : `Review request failed (${response.status}).`);
  }
  return body;
}

export async function getProductReviews(productId: string): Promise<ProductReviewSummary> {
  const response = await fetch(`${API_BASE_URL}/api/products/${encodeURIComponent(productId)}/reviews`);
  const body = await readBody(response);
  if (!body || !Array.isArray(body.reviews)) throw new Error("Invalid product reviews response.");
  return body as ProductReviewSummary;
}

export async function saveProductReview(customerId: string, productId: string, rating: number, comment: string): Promise<ProductReview> {
  const response = await fetch(`${API_BASE_URL}/api/products/${encodeURIComponent(productId)}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-customer-id": customerId },
    body: JSON.stringify({ rating, comment }),
  });
  const body = await readBody(response);
  if (!body?.review) throw new Error("Invalid product review response.");
  return body.review as ProductReview;
}
