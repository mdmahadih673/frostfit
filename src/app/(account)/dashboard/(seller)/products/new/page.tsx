import type { Metadata } from "next";

import { SellerAddProductPage } from "@/components/account/seller-workspace-pages";
import { getRequiredSellerSession } from "@/lib/get-required-session";

export const metadata: Metadata = {
  title: "Add product | Seller dashboard",
  description: "Create a product listing for your FrostFit store.",
};

export default async function AddProductPage() {
  const { user } = await getRequiredSellerSession();

  return <SellerAddProductPage sellerId={user.id} />;
}
