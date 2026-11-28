import type { Metadata } from "next";
import { Suspense } from "react";

import { CustomerCheckout } from "@/components/account/customer-checkout";
import { Navbar } from "@/components/home/navbar";
import { getRequiredSession } from "@/lib/get-required-session";

export const metadata: Metadata = {
  title: "Checkout | FrostFit",
  description: "Complete your FrostFit order with delivery address and payment.",
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#f1f2ef] text-[#18231f]">
      <Navbar />
      <main className="mx-auto max-w-[1440px] px-4 py-4 sm:px-7 lg:px-10">
        <Suspense
          fallback={
            <p className="body-6 py-16 text-center text-[#6f746e]">
              Loading checkout…
            </p>
          }
        >
          <CheckoutContent />
        </Suspense>
      </main>
    </div>
  );
}

async function CheckoutContent() {
  const { user } = await getRequiredSession();
  const defaultName = user.name.trim() || user.email;

  return (
    <CustomerCheckout customerId={user.id} defaultName={defaultName} defaultEmail={user.email} />
  );
}
