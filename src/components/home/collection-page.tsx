import Link from "next/link";

type CollectionPageProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function CollectionPage({ eyebrow, title, description }: CollectionPageProps) {
  return (
    <main className="min-h-screen bg-[#efefed] p-3 text-[#151515] sm:p-6">
      <section className="mx-auto flex min-h-[calc(100vh-24px)] max-w-[1440px] flex-col bg-[#f9f9f7] px-5 py-5 sm:min-h-[calc(100vh-48px)] sm:px-10 sm:py-8 lg:px-14">
        <header className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]">
            <span className="flex size-7 items-center justify-center rounded-full bg-[#1d2c27] text-xs font-semibold text-white">F</span>
            <span className="title-4 tracking-[-0.06em]">frostfit</span>
          </Link>
          <Link href="/" className="button-sm rounded-full border border-[#1d2c27] px-3 py-2 text-[#1d2c27] transition duration-300 hover:bg-[#1d2c27] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]">Back home</Link>
        </header>
        <section className="my-auto max-w-[680px] py-20">
          <p className="caption-3 mb-4 uppercase tracking-[0.18em] text-[#6f746e]">{eyebrow}</p>
          <h1 className="heading-1 text-balance tracking-[-0.075em]">{title}</h1>
          <p className="body-6 mt-5 max-w-md text-pretty text-[#626761]">{description}</p>
        </section>
      </section>
    </main>
  );
}
