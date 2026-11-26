import Link from "next/link";

import { AuthSidebar } from "@/components/auth/auth-sidebar";
import { AuthRoleProvider } from "@/components/auth/auth-role-context";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthRoleProvider>
      <main className="min-h-screen bg-[#efefed] p-3 text-[#151515] sm:p-6">
        <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-[1440px] overflow-hidden bg-[#f9f9f7] shadow-[0_24px_70px_rgba(34,34,31,0.10)] sm:min-h-[calc(100vh-48px)] lg:grid-cols-[1.05fr_1fr]">
          <AuthSidebar />

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
    </AuthRoleProvider>
  );
}
