import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/");
  return session;
}
