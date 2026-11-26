"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, LogOut, UserRound } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { USER_ROLES } from "@/lib/user-roles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NavbarAccount() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setError(null);
    setIsSigningOut(true);

    try {
      const { error: signOutError } = await authClient.signOut();

      if (signOutError) {
        setError(signOutError.message ?? "Could not sign out. Please try again.");
        return;
      }

      router.refresh();
    } catch (signOutError) {
      console.error("Sign-out failed:", signOutError);
      setError("Could not sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  }

  if (isPending || !session) {
    return (
      <div className="flex items-center gap-3 sm:gap-4">
        <Link href="/sign-in" className="caption-4 text-[#3f413e] transition-colors duration-300 hover:text-[#1d2c27] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]">
          Sign in
        </Link>
        <Link href="/sign-up" className="hidden caption-4 rounded-full border border-[#1d2c27] px-3 py-2 text-[#1d2c27] transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#1d2c27] hover:text-white active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27] sm:inline-flex">
          Sign up
        </Link>
      </div>
    );
  }

  const name = session.user.name.trim() || session.user.email;
  const role =
    session.user.role === USER_ROLES.seller
      ? "Seller"
      : session.user.role === USER_ROLES.admin
        ? "Admin"
        : session.user.role === USER_ROLES.customer
          ? "Customer"
          : "Member";
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Open account menu for ${name}`}
          className="inline-flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-[#e9e9e5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d2c27]"
        >
          <Avatar className="size-9 border border-[#d8d8d2]">
            {session.user.image ? <AvatarImage src={session.user.image} alt={name} /> : null}
            <AvatarFallback className="bg-[#1d2c27] text-xs font-medium text-white">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-32 truncate text-left sm:block">
            <span className="caption-4 block font-medium text-[#1d2c27]">{name}</span>
            <span className="caption-4 block text-[#6f746e]">{role}</span>
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60 rounded-xl border border-[#e1e1dc] bg-[#f9f9f7] p-1.5 text-[#1d2c27]">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-2 py-2">
              <span className="block truncate text-sm font-medium">{name}</span>
              <span className="mt-0.5 block truncate text-xs font-normal text-[#6f746e]">{session.user.email}</span>
              <span className="mt-1 block text-xs font-normal text-[#6f746e]">{role}</span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-[#e1e1dc]" />
          <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer rounded-lg px-2 py-2">
            <UserRound aria-hidden="true" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dashboard")} className="cursor-pointer rounded-lg px-2 py-2">
            <LayoutDashboard aria-hidden="true" />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#e1e1dc]" />
          <DropdownMenuItem
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="cursor-pointer rounded-lg px-2 py-2 text-[#b3261e] focus:text-[#b3261e]"
          >
            <LogOut aria-hidden="true" />
            {isSigningOut ? "Signing out…" : "Sign out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {error ? <p role="alert" className="caption-4 text-[#b3261e]">{error}</p> : null}
    </div>
  );
}
