import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { USER_ROLES } from "@/lib/user-roles";

export async function getRequiredSession() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}

export async function getRequiredSellerSession() {
  const session = await getRequiredSession();

  if (session.user.role !== USER_ROLES.seller) {
    redirect("/dashboard");
  }

  return session;
}
