import Image from "next/image";
import Link from "next/link";

const trendingItems = [
  { name: "Alpine puffer", tone: "bg-[#d9d5cf]" },
  { name: "Frost shell", tone: "bg-[#cbd0ca]" },
  { name: "Evergreen layer", tone: "bg-[#9eada3]" },
  { name: "Drift jacket", tone: "bg-[#d7d9d6]" },
  { name: "Dune parka", tone: "bg-[#c6b2a1]" },
  { name: "Harbour vest", tone: "bg-[#bdc9ca]" },
];

export function TrendingNow() {
  return (
    <section className="mx-auto mt-6 max-w-[1440px] bg-[#1d2c27] px-5 py-12 text-white shadow-[0_24px_70px_rgba(34,34,31,0.08)] sm:mt-12 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="caption-3 uppercase tracking-[0.18em] text-[#b9c3bc]">Most viewed</p>
          <h2 className="heading-4 mt-3 tracking-[-0.055em]">Trending now</h2>
        </div>
        <Link href="/all-products" className="button-sm shrink-0 rounded-full border border-white px-3 py-2 text-white transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-white hover:text-[#1d2c27] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          See all
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-3">
        {trendingItems.map((item) => (
          <article key={item.name} className="group">
            <Link href="/all-products" className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              <div className={`relative aspect-[4/5] overflow-hidden ${item.tone}`}>
                <Image
                  src="/images/summit-puffer.png"
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px"
                  className="object-contain p-4 mix-blend-multiply transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <h3 className="title-4 text-white">{item.name}</h3>
                <span className="caption-4 text-[#b9c3bc]">Trending</span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
