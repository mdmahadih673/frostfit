export const USER_ROLES = {
  customer: "customer",
  seller: "seller",
  admin: "admin",
} as const;

export const SIGN_UP_ROLES = [USER_ROLES.customer, USER_ROLES.seller] as const;
