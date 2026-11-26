import { Navbar } from "@/components/home/navbar";

type CollectionPageProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function CollectionPage({ eyebrow, title, description }: CollectionPageProps) {
  return (
    <main className="min-h-screen bg-[#efefed] px-3 pt-3 pb-6 text-[#151515] sm:px-6 sm:pt-6 sm:pb-12">
      <Navbar />
      <section className="mx-auto flex min-h-[calc(100vh-24px)] max-w-[1440px] flex-col bg-[#f9f9f7] px-5 py-5 sm:min-h-[calc(100vh-48px)] sm:px-10 sm:py-8 lg:px-14">
        <section className="my-auto max-w-[680px] py-20">
          <p className="caption-3 mb-4 uppercase tracking-[0.18em] text-[#6f746e]">{eyebrow}</p>
          <h1 className="heading-1 text-balance tracking-[-0.075em]">{title}</h1>
          <p className="body-6 mt-5 max-w-md text-pretty text-[#626761]">{description}</p>
        </section>
      </section>
    </main>
  );
}
