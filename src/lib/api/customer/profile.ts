import { API_BASE_URL } from "@/lib/api/base-url";

export type CustomerProfile = {
  customerId: string;
  name: string;
  email: string;
  phone: string;
  image: string;
  emailVerified: boolean;
  role: string;
};

export type UpdateCustomerProfile = Pick<CustomerProfile, "name" | "phone" | "image">;

const PROFILE_API_URL = `${API_BASE_URL}/api/customer/profile`;

function customerHeaders(customerId: string, json = false) {
  if (!customerId.trim()) throw new Error("Customer ID is required to load your profile.");
  return {
    "x-customer-id": customerId,
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
}

async function parseResponse(response: Response) {
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof body === "object" && body !== null && "message" in body && typeof body.message === "string"
      ? body.message
      : `Profile request failed (${response.status}).`;
    throw new Error(message);
  }
  return body;
}

export async function getCustomerProfile(customerId: string): Promise<CustomerProfile> {
  const response = await fetch(PROFILE_API_URL, { headers: customerHeaders(customerId) });
  const body = await parseResponse(response);
  if (typeof body !== "object" || body === null || !("profile" in body)) {
    throw new Error("Invalid customer profile response.");
  }
  return body.profile as CustomerProfile;
}

export async function updateCustomerProfile(customerId: string, profile: UpdateCustomerProfile): Promise<void> {
  const response = await fetch(PROFILE_API_URL, {
    method: "PATCH",
    headers: customerHeaders(customerId, true),
    body: JSON.stringify(profile),
  });
  await parseResponse(response);
}
