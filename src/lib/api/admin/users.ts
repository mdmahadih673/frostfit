import { API_BASE_URL } from "@/lib/api/base-url";

export type AdminUserRole = "customer" | "seller" | "admin";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  image: string;
  role: AdminUserRole;
  emailVerified: boolean;
  createdAt: string | null;
};

export type AdminUserUpdate = Pick<AdminUser, "name" | "email" | "phone" | "image" | "role">;

const ADMIN_USERS_URL = `${API_BASE_URL}/admin/users`;

function adminHeaders(adminId: string, json = false) {
  if (!adminId.trim()) throw new Error("Admin ID is required to manage users.");
  return { "x-admin-id": adminId, ...(json ? { "Content-Type": "application/json" } : {}) };
}

async function readResponse(response: Response) {
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof body === "object" && body !== null && "message" in body && typeof body.message === "string"
      ? body.message
      : `User management request failed (${response.status}).`;
    throw new Error(message);
  }
  return body;
}

export async function getAdminUsers(adminId: string): Promise<AdminUser[]> {
  const body = await readResponse(await fetch(ADMIN_USERS_URL, { headers: adminHeaders(adminId) }));
  if (typeof body !== "object" || body === null || !("users" in body) || !Array.isArray(body.users)) {
    throw new Error("Admin users response is invalid.");
  }
  return body.users as AdminUser[];
}

export async function updateAdminUser(adminId: string, userId: string, updates: AdminUserUpdate): Promise<AdminUser> {
  const response = await fetch(`${ADMIN_USERS_URL}/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    headers: adminHeaders(adminId, true),
    body: JSON.stringify(updates),
  });
  const body = await readResponse(response);
  if (typeof body !== "object" || body === null || !("user" in body)) throw new Error("Updated user response is invalid.");
  return body.user as AdminUser;
}

export async function removeAdminUser(adminId: string, userId: string): Promise<void> {
  await readResponse(await fetch(`${ADMIN_USERS_URL}/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    headers: adminHeaders(adminId),
  }));
}
