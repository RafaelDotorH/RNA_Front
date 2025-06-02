// src/middleware.js

import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
    const token = request.cookies.get('token');
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { pathname } = request.nextUrl;

    // --- LÓGICA DE REDIRECCIÓN POR RECARGA ---
    const pagesToRedirectOnReload = ['/principal', '/biblioteca', '/nosotros'];

    if (pagesToRedirectOnReload.includes(pathname)) {
        const referer = request.headers.get('referer');
        
        if (referer) {
            try {
                const refererUrl = new URL(referer);
                // Si la página a la que vas es la misma de la que vienes, es una recarga.
                if (refererUrl.pathname === pathname) {
                    console.log(`RELOAD DETECTED on ${pathname}. Redirecting to /menu.`);
                    return NextResponse.redirect(new URL('/menu', request.url));
                }
            } catch (error) {
                // El referer podría no ser una URL válida, ignoramos el error.
                console.log("Invalid Referer URL.");
            }
        } else {
            // Si no hay referer, es una carga directa (nuevo tab, etc). Redirigimos.
            console.log(`DIRECT LOAD DETECTED on ${pathname}. Redirecting to /menu.`);
            return NextResponse.redirect(new URL('/menu', request.url));
        }
    }
    // --- FIN DE LA LÓGICA DE REDIRECCIÓN ---


    // --- LÓGICA DE AUTENTICACIÓN (EXISTENTE) ---
    // Si el usuario intenta acceder a la página de login pero ya tiene un token válido,
    // lo redirigimos al menú principal para evitar que inicie sesión de nuevo.
    if (pathname === '/login' || pathname === '/forgot-password') {
        if (token) {
            try {
                await jwtVerify(token.value, secret);
                // Token válido, redirigir al menú
                return NextResponse.redirect(new URL('/menu', request.url));
            } catch (error) {
                // Token no válido, permitir el acceso a login/forgot-password
                return NextResponse.next();
            }
        }
        // Si no hay token, permitir el acceso a login/forgot-password
        return NextResponse.next();
    }

    // Proteger todas las demás rutas si no hay token
    if (!token) {
        // Redirigir a login si no hay token y no es una página pública
        const publicPages = ['/', '/login', '/forgot-password']; // Añade otras páginas públicas si las tienes
        if (!publicPages.includes(pathname)) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.next();
    }

    // Verificar el token para las rutas protegidas
    try {
        await jwtVerify(token.value, secret);
        return NextResponse.next(); // El token es válido, continuar
    } catch (error) {
        // El token no es válido o ha expirado, redirigir a login
        const loginUrl = new URL('/login', request.url);
        // Opcional: añadir un mensaje de error o una redirección de origen
        loginUrl.searchParams.set('from', pathname);
        const response = NextResponse.redirect(loginUrl);
        // Limpiar la cookie del token no válido
        response.cookies.delete('token');
        return response;
    }
}

// Configuración del Matcher para el middleware
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - CSS
         * - js
         * - img
         */
        '/((?!api|_next/static|_next/image|favicon.ico|CSS|js|img).*)',
    ],
};