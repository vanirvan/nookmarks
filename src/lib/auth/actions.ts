"use server";
import { headers } from "next/headers";

export async function getUserSession() {
  const { auth } = await import("@/lib/auth");
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session?.user) return null;

  return {
    name: session.user.name,
    email: session.user.email,
    avatar: session.user.image || "",
  };
}
