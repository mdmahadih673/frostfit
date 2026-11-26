import type { Metadata } from "next";

import { SellerAnalyticsPage } from "@/components/account/seller-workspace-pages";

export const metadata: Metadata = {
  title: "Analytics | Seller dashboard",
  description: "Review performance analytics for your FrostFit store.",
};

export default function AnalyticsPage() {
  return <SellerAnalyticsPage />;
}
