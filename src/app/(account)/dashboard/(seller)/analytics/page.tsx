import type { Metadata } from "next";

import { SellerAnalyticsPage } from "@/components/account/seller-workspace-pages";
import { getRequiredSellerSession } from "@/lib/get-required-session";

export const metadata: Metadata = {
  title: "Analytics | Seller dashboard",
  description: "Review performance analytics for your FrostFit store.",
};

export default async function AnalyticsPage() {
  const { user } = await getRequiredSellerSession();
  return <SellerAnalyticsPage sellerId={user.id} />;
}
