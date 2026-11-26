"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { SIGN_UP_ROLES, USER_ROLES } from "@/lib/user-roles";

type SignUpRole = (typeof SIGN_UP_ROLES)[number];

type AuthRoleContextValue = {
  role: SignUpRole;
  setRole: (role: SignUpRole) => void;
};

const AuthRoleContext = createContext<AuthRoleContextValue | null>(null);

export function AuthRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<SignUpRole>(USER_ROLES.customer);

  return <AuthRoleContext.Provider value={{ role, setRole }}>{children}</AuthRoleContext.Provider>;
}

export function useAuthRole() {
  const context = useContext(AuthRoleContext);

  if (!context) {
    throw new Error("useAuthRole must be used within AuthRoleProvider");
  }

  return context;
}
