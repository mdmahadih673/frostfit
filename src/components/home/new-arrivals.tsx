import Image from "next/image";
import Link from "next/link";

const arrivals = [
  { name: "Cloud puffer", tone: "bg-[#e5e2db]" },
  { name: "Moss shell", tone: "bg-[#c5cec4]" },
  { name: "Night liner", tone: "bg-[#bac6c4]" },
  { name: "Stone parka", tone: "bg-[#d2cdc2]" },
  { name: "Clay down", tone: "bg-[#d3c2b4]" },
  { name: "Snow vest", tone: "bg-[#dfe2dd]" },
];

export function NewArrivals() {
  return (
    <section id="new-arrivals" className="mx-auto mt-6 max-w-[1440px] bg-[#f9f9f7] px-5 py-12 shadow-[0_24px_70px_rgba(34,34,31,0.08)] sm:mt-12 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="caption-3 uppercase tracking-[0.18em] text-[#6f746e]">Winter 2026</p>
          <h2 className="heading-4 mt-3 tracking-[-0.055em]">New arrivals</h2>
        </div>
        <Link href="/all-products" className="button-sm shrink-0 rounded-full border border-[#1d2c27] px-3 py-2 text-[#1d2c27] transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#1d2c27] hover:text-white active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]">
          See all
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-3">
        {arrivals.map((arrival) => (
          <article key={arrival.name} className="group">
            <Link href="/all-products" className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]">
              <div className={`relative aspect-[4/5] overflow-hidden ${arrival.tone}`}>
                <Image
                  src="/images/summit-puffer.png"
                  alt={arrival.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px"
                  className="object-contain p-4 mix-blend-multiply transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <h3 className="title-4">{arrival.name}</h3>
                <span className="caption-4 text-[#6f746e]">New</span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
