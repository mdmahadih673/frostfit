import { API_BASE_URL } from "@/lib/api/base-url";

export type CustomerAddress = {
  _id: string;
  customerId: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  note: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CustomerAddressPayload = Omit<
  CustomerAddress,
  "_id" | "customerId" | "createdAt" | "updatedAt"
>;

const API_URL = `${API_BASE_URL}/customer-addresses`;

function customerHeaders(customerId: string, json = false) {
  if (!customerId.trim()) throw new Error("Customer ID is required to manage addresses.");
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
      : `Request failed (${response.status}).`;
    throw new Error(message);
  }
  return body;
}

export async function getCustomerAddresses(customerId: string): Promise<CustomerAddress[]> {
  const response = await fetch(API_URL, { headers: customerHeaders(customerId) });
  const body = await parseResponse(response);
  if (typeof body !== "object" || body === null || !("addresses" in body) || !Array.isArray(body.addresses)) {
    throw new Error("Invalid addresses response.");
  }
  return body.addresses as CustomerAddress[];
}

export async function saveCustomerAddress(customerId: string, payload: CustomerAddressPayload): Promise<CustomerAddress> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: customerHeaders(customerId, true),
    body: JSON.stringify(payload),
  });
  const body = await parseResponse(response);
  if (typeof body !== "object" || body === null || !("address" in body)) {
    throw new Error("Invalid address response.");
  }
  return body.address as CustomerAddress;
}

export async function updateCustomerAddress(customerId: string, addressId: string, payload: CustomerAddressPayload): Promise<CustomerAddress> {
  const response = await fetch(API_URL, {
    method: "PATCH",
    headers: customerHeaders(customerId, true),
    body: JSON.stringify({ addressId, ...payload }),
  });
  const body = await parseResponse(response);
  if (typeof body !== "object" || body === null || !("address" in body)) {
    throw new Error("Invalid address response.");
  }
  return body.address as CustomerAddress;
}

export async function removeCustomerAddress(customerId: string, addressId: string): Promise<void> {
  const response = await fetch(`${API_URL}/${encodeURIComponent(addressId)}`, {
    method: "DELETE",
    headers: customerHeaders(customerId),
  });
  await parseResponse(response);
}
