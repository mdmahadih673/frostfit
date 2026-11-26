import Link from "next/link";

export function OfferSection() {
  return (
    <section id="offer" className="mx-auto mt-6 max-w-[1440px] bg-[#1d2c27] px-5 py-16 text-white shadow-[0_24px_70px_rgba(34,34,31,0.08)] sm:mt-12 sm:px-10 sm:py-20 lg:px-14">
      <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <p className="caption-3 uppercase tracking-[0.18em] text-[#b9c3bc]">Limited offer</p>
          <h2 className="mt-5 max-w-[560px] text-4xl font-semibold leading-[1.05] tracking-[-0.055em] text-balance sm:text-5xl">
            Take 20% off your first winter layer.
          </h2>
          <p className="body-6 mt-5 max-w-md text-pretty text-[#b9c3bc]">
            A quiet welcome for the season. Use code <span className="font-semibold text-white">FROST20</span> at checkout — valid on new arrivals through the end of the week.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/all-products" className="button-sm inline-flex items-center rounded-full bg-white px-5 py-3 text-[#1d2c27] transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-[#e5e2db] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              Shop the offer
            </Link>
            <Link href="/winter" className="button-sm border-b border-white/50 pb-1 text-white transition-colors duration-300 hover:border-white hover:text-[#b9c3bc] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              Explore winter
            </Link>
          </div>
        </div>

        <div className="flex justify-start lg:justify-end">
          <div className="relative w-full max-w-[320px] border border-white/20 bg-white/5 px-8 py-10">
            <span className="absolute top-4 right-4 size-2 rounded-full bg-[#b9c3bc]" aria-hidden="true" />
            <p className="caption-3 uppercase tracking-[0.18em] text-[#b9c3bc]">Promo code</p>
            <p className="mt-4 text-5xl font-semibold leading-none tracking-[-0.06em] sm:text-6xl">20%</p>
            <p className="title-4 mt-3 text-white">off your first order</p>
            <div className="mt-7 flex items-center justify-between gap-4 border-t border-white/20 pt-5">
              <span className="caption-4 tracking-[0.14em] text-[#e5e2db]">FROST20</span>
              <span className="caption-4 text-[#b9c3bc]">Ends Sunday</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
