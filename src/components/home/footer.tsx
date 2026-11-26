import Link from "next/link";

const footerGroups = [
  {
    title: "Shop",
    links: [
      { label: "All products", href: "/all-products" },
      { label: "Winter", href: "/winter" },
      { label: "Summer", href: "/summer" },
      { label: "New arrivals", href: "/#new-arrivals" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Shipping & returns", href: "#" },
      { label: "Size guide", href: "#" },
      { label: "Fabric care", href: "#" },
      { label: "Contact", href: "mailto:hello@frostfit.com" },
    ],
  },
  {
    title: "Studio",
    links: [
      { label: "Our story", href: "#" },
      { label: "Journal", href: "#" },
      { label: "Stockists", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
];

const socialLinks = [
  { label: "Instagram", href: "#" },
  { label: "Pinterest", href: "#" },
  { label: "YouTube", href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-[#efefed] px-3 pb-3 sm:px-6 sm:pb-6">
      <div className="mx-auto max-w-[1440px] bg-[#f9f9f7] px-5 pt-14 pb-7 shadow-[0_24px_70px_rgba(34,34,31,0.08)] sm:px-10 sm:pt-16 lg:px-14">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr] lg:gap-16">
          <div>
            <Link href="/" className="group inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]" aria-label="FrostFit home">
              <span className="flex size-7 items-center justify-center rounded-full bg-[#1d2c27] text-xs font-semibold text-white transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-12">F</span>
              <span className="title-4 tracking-[-0.06em]">frostfit</span>
            </Link>
            <p className="body-6 mt-5 max-w-[260px] text-pretty text-[#626761]">
              Technical outerwear made for the wild cold. Designed to layer, built to last.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
              {socialLinks.map((link) => (
                <a key={link.label} href={link.href} className="caption-4 text-[#3f413e] transition-colors duration-300 hover:text-[#1d2c27] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h2 className="caption-3 uppercase tracking-[0.18em] text-[#6f746e]">{group.title}</h2>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith("/") ? (
                        <Link href={link.href} className="caption-4 text-[#3f413e] transition-colors duration-300 hover:text-[#1d2c27] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]">
                          {link.label}
                        </Link>
                      ) : (
                        <a href={link.href} className="caption-4 text-[#3f413e] transition-colors duration-300 hover:text-[#1d2c27] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]">
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-[#dcdcd6] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="caption-4 text-[#6f746e]">© 2026 FrostFit. Made for the wild cold.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href="#" className="caption-4 text-[#6f746e] transition-colors duration-300 hover:text-[#1d2c27] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]">
              Privacy
            </a>
            <a href="#" className="caption-4 text-[#6f746e] transition-colors duration-300 hover:text-[#1d2c27] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]">
              Terms
            </a>
            <a href="#top" className="caption-4 text-[#6f746e] transition-colors duration-300 hover:text-[#1d2c27] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]">
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
