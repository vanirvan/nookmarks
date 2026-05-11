import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  // fetching the session instead of directly importing from @/lib/db/auth.ts
  // error `adapterFn is not a function` and `proxy.ts file is not found` keep appearing
  // this is the workaround solution
  const response = await fetch(
    `${request.nextUrl.origin}/api/auth/get-session`,
    {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    },
  );

  const session = await response.json().catch(() => null);

  const { pathname } = request.nextUrl;
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
