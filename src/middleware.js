// src/middleware.js
import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token");
  const { pathname } = req.nextUrl;

  const protectedRoutes = ["/menu", "/principal", "/nosotros", "/biblioteca"];

  if (protectedRoutes.includes(pathname) && !token) {
    const loginUrl = new URL("/", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/menu", "/principal", "/nosotros", "/biblioteca"],
};