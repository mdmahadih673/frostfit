import { Navbar } from "@/components/home/navbar";
import { AllProductsGrid } from "@/components/product/all-products-grid";

export default function AllProductsPage() {
  return (
    <main className="min-h-screen bg-[#efefed] px-3 pt-3 pb-6 text-[#151515] sm:px-6 sm:pt-6 sm:pb-12">
      <Navbar />
      <section className="mx-auto min-h-[calc(100vh-24px)] max-w-[1440px] bg-[#f9f9f7] px-5 py-5 sm:min-h-[calc(100vh-48px)] sm:px-10 sm:py-8 lg:px-14">
        <section className="py-12 sm:py-16">
          <p className="caption-3 uppercase tracking-[0.18em] text-[#6f746e]">
            FrostFit collections
          </p>
          <h1 className="heading-1 mt-4 text-balance tracking-[-0.075em]">
            All products
          </h1>
          <p className="body-6 mt-5 max-w-md text-pretty text-[#626761]">
            Explore every layer made for colder days and changing forecasts.
          </p>
          <div className="mt-10">
            <AllProductsGrid />
          </div>
        </section>
      </section>
    </main>
  );
}
