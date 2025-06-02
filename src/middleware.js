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
                console.log("Invalid Referer URL.", error);
            }
        } else {
            // Si no hay referer, es una carga directa (nuevo tab, etc). Redirigimos.
            console.log(`DIRECT LOAD DETECTED on ${pathname}. Redirecting to /menu.`);
            return NextResponse.redirect(new URL('/menu', request.url));
        }
    }
    if (pathname === '/login' || pathname === '/forgot-password') {
        if (token) {
            try {
                await jwtVerify(token.value, secret);
                return NextResponse.redirect(new URL('/menu', request.url));
            } catch (error) {
                console.error("Token verification failed on login/forgot-password:", error);
                return NextResponse.next();
            }
        }
        return NextResponse.next();
    }

    if (!token) {
        const publicPages = ['/', '/login', '/forgot-password'];
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
        console.error("Token verification failed:", error);
        const loginUrl = new URL('/login', request.url);
        // Opcional: añadir un mensaje de error o una redirección de origen
        loginUrl.searchParams.set('from', pathname);
        const response = NextResponse.redirect(loginUrl);
        // Limpiar la cookie del token no válido
        response.cookies.delete('token');
        return response;
    }
}

export const config = {
    matcher: [
    ],
};