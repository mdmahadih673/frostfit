import type { Metadata } from "next";

import { SellerSettingsPage } from "@/components/account/seller-workspace-pages";

export const metadata: Metadata = {
  title: "Store settings | Seller dashboard",
  description: "Manage your FrostFit store profile settings.",
};

export default function SettingsPage() {
  return <SellerSettingsPage />;
}
