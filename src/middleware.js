import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token"); // Obtiene el token desde las cookies

  const protectedRoutes = ["/menu", "/principal", "/nosotros", "/biblioteca"];

  if (protectedRoutes.includes(req.nextUrl.pathname) && !token) {
    const loginUrl = new URL("/", req.url);
    return NextResponse.redirect(loginUrl); // Redirige al login si no hay token
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/menu", "/principal", "/nosotros", "/biblioteca"], // Define las rutas protegidas
};