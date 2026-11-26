import type { Metadata } from "next";

import { SellerProductsPage } from "@/components/account/seller-workspace-pages";

export const metadata: Metadata = {
  title: "My products | Seller dashboard",
  description: "Review and manage products in your FrostFit store.",
};

export default function ProductsPage() {
  return <SellerProductsPage />;
}
