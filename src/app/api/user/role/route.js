// src/app/api/user/role/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/app/lib/mongodb'; // Ajusta la ruta si es necesario
import UserModel from '@/app/models/User';   // Ajusta la ruta si es necesario

export async function GET() {
    try {
        await dbConnect();
    } catch (dbError) {
        console.error('[API /api/user/role] Error de conexión a MongoDB:', dbError);
        return NextResponse.json(
            { message: 'Error al conectar con la base de datos.', error: dbError.message },
            { status: 503 }
        );
    }

    let email;

    try {
        const cookieStore = cookies();
        const tokenCookie = cookieStore.get('token'); // Lee la cookie 'token'

        if (!tokenCookie) {
            console.log('[API /api/user/role] No se encontró la cookie "token".');
            return NextResponse.json(
                { message: 'No se encontró el token de autenticación.' },
                { status: 401 }
            );
        }

        const tokenValue = tokenCookie.value;
        console.log('[API /api/user/role] Cookie "token" encontrada:', tokenValue ? 'Presente' : 'Vacía');

        const decodedToken = jwt.verify(tokenValue, process.env.JWT_SECRET);

        if (!decodedToken || !decodedToken.email) {
            console.log('[API /api/user/role] Token inválido o no contiene claim "email". Payload:', decodedToken);
            return NextResponse.json(
                { message: 'Token inválido o no contiene email.' },
                { status: 401 }
            );
        }

        email = decodedToken.email;
        console.log(`[API /api/user/role] Email extraído del token: ${email}`);

    } catch (error) {
        console.error('[API /api/user/role] Error al procesar el token:', error.name, error.message);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return NextResponse.json(
                { message: 'Token inválido o expirado.', error: error.message },
                { status: 401 }
            );
        }
        return NextResponse.json(
            { message: 'Error interno al procesar el token.', error: error.message },
            { status: 500 }
        );
    }

    if (!email) {
        console.log('[API /api/user/role] No se pudo extraer el email del token después de la decodificación.');
        return NextResponse.json(
            { message: 'No se pudo extraer el email del token.' },
            { status: 400 }
        );
    }

    try {
        const normalizedEmail = email.trim().toLowerCase();
        // CONSOLE LOG AGREGADO PARA DEBUG:
        console.log(`[API /api/user/role] Email normalizado para búsqueda: "${normalizedEmail}"`);

        const existingUser = await UserModel.findOne({ email: normalizedEmail }).select('+rol');

        // CONSOLE LOG AGREGADO PARA DEBUG:
        console.log(`[API /api/user/role] Usuario encontrado en DB:`, existingUser);

        if (existingUser) {
            console.log(`[API /api/user/role] Email ENCONTRADO en MongoDB: ${normalizedEmail}, Rol en DB: ${existingUser.rol}`);
            
            // PUNTO CRÍTICO:
            const userRole = existingUser.rol || 'cliente'; 
            // Si existingUser.role es undefined, null, o '', userRole será 'cliente'.

            // CONSOLE LOG AGREGADO PARA DEBUG:
            console.log(`[API /api/user/role] Rol a devolver: ${userRole}`);

            return NextResponse.json(
                {
                    exists: true,
                    role: userRole, // Aquí se devuelve el rol
                    email: normalizedEmail,
                    message: 'El correo electrónico está registrado y se obtuvo el rol.'
                },
                { status: 200 }
            );
        } else {
            console.log(`[API /api/user/role] Email NO ENCONTRADO en MongoDB: ${normalizedEmail}`);
            return NextResponse.json(
                {
                    exists: false,
                    email: normalizedEmail,
                    message: 'El correo electrónico del token no está registrado.'
                },
                { status: 404 }
            );
        }
    } catch (error) {
        console.error('[API /api/user/role] Error al verificar el email/rol en MongoDB:', error);
        return NextResponse.json(
            { message: 'Error en el servidor al verificar el correo electrónico y obtener el rol.', error: error.message },
            { status: 500 }
        );
    }
}