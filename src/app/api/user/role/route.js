// src/app/api/user/role/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/app/lib/mongodb';
import UserModel from '@/app/models/User';

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
        const tokenCookie = cookieStore.get('token');

        if (!tokenCookie) {
            return NextResponse.json(
                { message: 'No se encontró el token de autenticación.' },
                { status: 401 }
            );
        }

        const tokenValue = tokenCookie.value;

        const decodedToken = jwt.verify(tokenValue, process.env.JWT_SECRET);

        if (!decodedToken || !decodedToken.email) {
            return NextResponse.json(
                { message: 'Token inválido o no contiene email.' },
                { status: 401 }
            );
        }

        email = decodedToken.email;

    } catch (error) {
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

        const existingUser = await UserModel.findOne({ email: normalizedEmail }).select('+rol');


        if (existingUser) {
            console.log(`[API /api/user/role] Email ENCONTRADO en MongoDB: ${normalizedEmail}, Rol en DB: ${existingUser.rol}`);
            
            const userRole = existingUser.rol || 'cliente';

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