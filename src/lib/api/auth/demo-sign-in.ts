export type DemoAccountRole = "customer" | "seller" | "admin";

export async function signInWithDemoAccount(role: DemoAccountRole): Promise<void> {
  const response = await fetch("/api/demo-sign-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(typeof body?.message === "string" ? body.message : "Could not sign in with this demo account.");
  }
}
