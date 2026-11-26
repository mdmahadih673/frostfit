import Link from "next/link";

const navItems = [
  { label: "Home", href: "#top" },
  { label: "All Product", href: "/all-products" },
  { label: "Winter", href: "/winter" },
  { label: "Summer", href: "/summer" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 bg-[#f9f9f7]/95 px-5 py-5 backdrop-blur-sm sm:px-10 lg:px-14">
      <Link href="/" className="group flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]" aria-label="FrostFit home">
        <span className="flex size-7 items-center justify-center rounded-full bg-[#1d2c27] text-xs font-semibold text-white transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-12">F</span>
        <span className="title-4 tracking-[-0.06em]">frostfit</span>
      </Link>
      <nav aria-label="Primary navigation" className="hidden items-center gap-8 lg:flex">
        {navItems.map((item) => (
          <Link key={item.label} href={item.href} className="caption-4 inline-flex items-center gap-1 border-b border-transparent pb-1 text-[#3f413e] transition-colors duration-300 hover:border-[#1d2c27] hover:text-[#1d2c27] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]">
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3 sm:gap-4">
        <Link href="/sign-in" className="caption-4 text-[#3f413e] transition-colors duration-300 hover:text-[#1d2c27] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]">
          Sign in
        </Link>
        <Link href="/sign-up" className="hidden caption-4 rounded-full border border-[#1d2c27] px-3 py-2 text-[#1d2c27] transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#1d2c27] hover:text-white active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27] sm:inline-flex">
          Sign up
        </Link>
      </div>
    </header>
  );
}
