import { HeroSection } from "@/components/home/hero-section";
import { Navbar } from "@/components/home/navbar";
import { NewArrivals } from "@/components/home/new-arrivals";
import { PrivateDispatch } from "@/components/home/private-dispatch";
import { TrendingNow } from "@/components/home/trending-now";

export default function Home() {
  return (
    <main id="top" className="min-h-screen bg-[#efefed] px-3 py-3 text-[#151515] sm:px-6 sm:py-6">
      <Navbar />
      <section className="relative mx-auto min-h-[calc(100vh-24px)] max-w-[1440px] overflow-hidden bg-[#f9f9f7] px-5 pb-8 shadow-[0_24px_70px_rgba(34,34,31,0.10)] sm:min-h-[calc(100vh-48px)] sm:px-10 lg:px-14">
        <HeroSection />
      </section>
      <NewArrivals />
      <TrendingNow />
      <PrivateDispatch />
    </main>
  );
}
