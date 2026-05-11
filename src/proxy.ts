import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const { pathname } = request.nextUrl;
  console.log(pathname);
  const publicRoutes = ["/", "/sign-in", "/sign-up"];

  if (session && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  if (!session && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"], // Match all routes except api, static files, images, and favicon
};
