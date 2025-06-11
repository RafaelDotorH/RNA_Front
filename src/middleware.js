import { NextResponse } from 'next/server'; // Importa NextResponse para manejar las respuestas de middleware
import { jwtVerify } from 'jose'; // Importa jwtVerify de la biblioteca jose para verificar tokens JWT

export async function middleware(request) { // Middleware que se ejecuta en cada solicitud entrante
    const token = request.cookies.get('token');
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { pathname } = request.nextUrl;

    if (pathname === '/login' || pathname === '/forgot-password') { // Si la ruta es /login o /forgot-password
        if (token) {
            try {
                await jwtVerify(token.value, secret);
                return NextResponse.redirect(new URL('/menu', request.url));
            } catch (error) {
                console.error("Token verification failed on login/forgot-password:", error);
                return NextResponse.next();
            }
        }
        return NextResponse.next(); // Si no hay token, continuar con la solicitud
    }

    if (!token) { // Si no hay token en la cookie
        const publicPages = ['/', '/login', '/forgot-password'];
        if (!publicPages.includes(pathname)) { // Si la ruta no es pública
            return NextResponse.redirect(new URL('/login', request.url)); // Redirigir a la página de inicio de sesión
        }
        return NextResponse.next(); // Si la ruta es pública, continuar con la solicitud
    }

    // Verificar el token para las rutas protegidas
    try { // Intenta verificar el token JWT
        await jwtVerify(token.value, secret); // Verifica el token usando la clave secreta
        return NextResponse.next(); // El token es válido, continuar
    } catch (error) { // Si la verificación del token falla
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

export const config = { // Configuración del middleware
    matcher: [
      '/((?!api|_next/static|_next/image|favicon.ico).*)', // Excluir rutas de la API, archivos estáticos y favicon.ico
    ],
};