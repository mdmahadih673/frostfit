import { PufferCutout } from "./puffer-cutout";

export function HeroSection() {
  return (
    <>
      <div className="relative z-10 grid min-h-[760px] items-center pt-14 lg:grid-cols-[minmax(250px,0.72fr)_minmax(420px,1.35fr)_minmax(260px,0.78fr)] lg:pt-0">
        <div className="relative z-20 self-start pt-4 lg:self-center lg:pt-0">
          <p className="caption-3 mb-4 uppercase tracking-[0.18em] text-[#6f746e]">Winter 2026</p>
          <h1 className="heading-1 max-w-[680px] text-balance tracking-[-0.075em] text-[#171817] sm:text-7xl">Made for the <span className="text-[#89908a]">wild cold.</span></h1>
          <p className="body-6 mt-5 max-w-sm text-pretty text-[#626761]">Technical warmth with a quieter point of view. Built for the first frost, long walks, and every layer between.</p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <a id="shop" href="#collection" className="button-sm inline-flex items-center rounded-full bg-[#1d2c27] px-3 py-2 text-white transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-[#344a42] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]">Shop outerwear</a>
            <a href="#collection" className="button-sm border-b border-[#1d2c27] pb-1 text-[#1d2c27] transition-colors duration-300 hover:text-[#718077] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]">View collection</a>
          </div>
        </div>
        <div className="relative order-first mx-auto mb-[-110px] h-[460px] w-full max-w-[510px] self-end lg:order-none lg:mb-0 lg:h-[700px] lg:max-w-[620px]">
          <PufferCutout />
        </div>
        <aside className="relative z-20 mt-8 self-end lg:mb-20 lg:mt-0">
          <p className="flex items-start justify-end gap-2 text-right text-3xl font-medium leading-none tracking-[-0.07em] text-[#1d2c27] sm:text-4xl">
            <span className="mt-1 text-lg font-normal">/</span>
            <span>Styled for<br />Life.</span>
          </p>
        </aside>
      </div>
      <div id="collection" className="absolute bottom-7 left-5 z-20 sm:bottom-10 sm:left-10 lg:left-14"><p className="caption-4 text-[#6f746e]">Scroll to explore</p></div>
    </>
  );
}
