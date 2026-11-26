import type { Metadata } from "next";

import { SellerPayoutsPage } from "@/components/account/seller-workspace-pages";

export const metadata: Metadata = {
  title: "Payouts | Seller dashboard",
  description: "Review payout status for your FrostFit store.",
};

export default function PayoutsPage() {
  return <SellerPayoutsPage />;
}
