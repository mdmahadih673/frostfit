import type { Metadata } from "next";

import { SellerOrdersPage } from "@/components/account/seller-workspace-pages";

export const metadata: Metadata = {
  title: "My orders | Seller dashboard",
  description: "Review and manage FrostFit seller orders.",
};

export default function OrdersPage() {
  return <SellerOrdersPage />;
}
