import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const accessCookieName = process.env.NEXT_PUBLIC_AUTH_ACCESS_COOKIE_NAME ?? "lr_access_token";
const publicRoutes = [
  "/login",
  "/cadastro",
  "/esqueci-senha",
  "/redefinir-senha",
  "/verificar-email",
];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get(accessCookieName)?.value;
  const isPublic = isPublicRoute(pathname);

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  if (token && isPublic) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
