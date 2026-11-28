import { auth } from "@/lib/auth";

const demoAccounts = {
  customer: {
    email: process.env.DEMO_CUSTOMER_EMAIL,
    password: process.env.DEMO_CUSTOMER_PASSWORD,
  },
  seller: {
    email: process.env.DEMO_SELLER_EMAIL,
    password: process.env.DEMO_SELLER_PASSWORD,
  },
  admin: {
    email: process.env.DEMO_ADMIN_EMAIL,
    password: process.env.DEMO_ADMIN_PASSWORD,
  },
} as const;

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production" || process.env.DEMO_SIGN_IN_ENABLED !== "true") {
    return Response.json({ message: "Demo sign-in is disabled." }, { status: 404 });
  }

  const body: unknown = await request.json().catch(() => null);
  const role = typeof body === "object" && body !== null && "role" in body ? body.role : null;

  if (typeof role !== "string" || !Object.hasOwn(demoAccounts, role)) {
    return Response.json({ message: "Choose a valid demo account." }, { status: 400 });
  }

  const credentials = demoAccounts[role as keyof typeof demoAccounts];
  if (!credentials.email || !credentials.password) {
    return Response.json({ message: "This demo account is not configured on the server." }, { status: 503 });
  }

  const signInRequest = new Request(new URL("/api/auth/sign-in/email", request.url), {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: new URL(request.url).origin },
    body: JSON.stringify({ email: credentials.email, password: credentials.password, callbackURL: "/dashboard" }),
  });
  const signInResponse = await auth.handler(signInRequest);
  return new Response(signInResponse.body, {
    status: signInResponse.status,
    headers: signInResponse.headers,
  });
}
