import Link from "next/link";

const perks = ["Early access to winter drops", "Private archive invitations", "Order tracking and saved layers"];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#efefed] p-3 text-[#151515] sm:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-[1440px] overflow-hidden bg-[#f9f9f7] shadow-[0_24px_70px_rgba(34,34,31,0.10)] sm:min-h-[calc(100vh-48px)] lg:grid-cols-[1.05fr_1fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#1d2c27] p-10 text-white lg:flex lg:p-14">
          <Link href="/" className="group relative z-10 inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" aria-label="FrostFit home">
            <span className="flex size-7 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#1d2c27] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-12">F</span>
            <span className="title-4 tracking-[-0.06em]">frostfit</span>
          </Link>

          <div className="relative z-10 max-w-[420px]">
            <p className="caption-3 uppercase tracking-[0.18em] text-[#b9c3bc]">FrostFit members</p>
            <p className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-0.06em] text-balance">Made for the wild cold.</p>
            <p className="body-6 mt-5 max-w-sm text-pretty text-[#b9c3bc]">
              Sign in to track orders, save your layers, and get first access to winter drops.
            </p>
            <ul className="mt-10 space-y-3">
              {perks.map((perk) => (
                <li key={perk} className="caption-4 flex items-center gap-3 text-[#e5e2db]">
                  <span className="size-1.5 rounded-full bg-[#b9c3bc]" aria-hidden="true" />
                  {perk}
                </li>
              ))}
            </ul>
          </div>

          <p className="caption-4 relative z-10 text-[#b9c3bc]">© 2026 FrostFit. Made for the wild cold.</p>

          <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-1/3 size-72 rounded-full border border-white/10" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-8 top-1/3 size-40 rounded-full border border-white/10" />
        </aside>

        <section className="flex flex-col justify-center px-5 py-10 sm:px-10 sm:py-14 lg:px-14">
          <div className="mx-auto w-full max-w-[420px]">
            <div className="mb-10 flex items-center justify-between gap-4">
              <Link href="/" className="group inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27] lg:hidden" aria-label="FrostFit home">
                <span className="flex size-7 items-center justify-center rounded-full bg-[#1d2c27] text-xs font-semibold text-white transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-12">F</span>
                <span className="title-4 tracking-[-0.06em]">frostfit</span>
              </Link>
              <Link href="/" className="caption-4 ml-auto text-[#6f746e] transition-colors duration-300 hover:text-[#1d2c27] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]">
                ← Back home
              </Link>
            </div>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
