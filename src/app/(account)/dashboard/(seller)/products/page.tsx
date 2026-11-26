import type { Metadata } from "next";

import { SellerProductsPage } from "@/components/account/seller-workspace-pages";
import { getRequiredSellerSession } from "@/lib/get-required-session";

export const metadata: Metadata = {
  title: "My products | Seller dashboard",
  description: "Review and manage products in your FrostFit store.",
};

export default async function ProductsPage() {
  const { user } = await getRequiredSellerSession();

  return <SellerProductsPage sellerId={user.id} />;
}
