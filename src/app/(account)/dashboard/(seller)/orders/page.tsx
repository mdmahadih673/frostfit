import type { Metadata } from "next";

import { SellerOrdersPage } from "@/components/account/seller-workspace-pages";
import { getRequiredSellerSession } from "@/lib/get-required-session";

export const metadata: Metadata = {
  title: "My orders | Seller dashboard",
  description: "Review and manage FrostFit seller orders.",
};

export default async function OrdersPage() {
  const { user } = await getRequiredSellerSession();
  return <SellerOrdersPage sellerId={user.id} />;
}
