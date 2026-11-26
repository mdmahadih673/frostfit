import { Suspense } from "react";

import { Navbar } from "@/components/home/navbar";
import { ProductDetailsView } from "@/components/product/product-details-view";

async function ProductDetailsLoader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetailsView key={id} productId={id} />;
}

function ProductDetailsFallback() {
  return (
    <div className="grid gap-10 py-10 lg:grid-cols-12 lg:gap-14">
      <div className="aspect-[4/5] animate-pulse bg-[#edf0ec] lg:col-span-6" />
      <div className="space-y-4 lg:col-span-6">
        <div className="h-4 w-32 animate-pulse rounded bg-[#e5e8e4]" />
        <div className="h-10 w-3/4 animate-pulse rounded bg-[#e5e8e4]" />
        <div className="h-6 w-40 animate-pulse rounded bg-[#e5e8e4]" />
        <div className="h-24 w-full animate-pulse rounded bg-[#e5e8e4]" />
      </div>
    </div>
  );
}

export default function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="min-h-screen bg-[#efefed] px-3 pt-3 pb-6 text-[#151515] sm:px-6 sm:pt-6 sm:pb-12">
      <Navbar />
      <section className="mx-auto min-h-[calc(100vh-24px)] max-w-[1440px] bg-[#f9f9f7] px-5 py-5 sm:min-h-[calc(100vh-48px)] sm:px-10 sm:py-8 lg:px-14">
        <Suspense fallback={<ProductDetailsFallback />}>
          <ProductDetailsLoader params={params} />
        </Suspense>
      </section>
    </main>
  );
}
