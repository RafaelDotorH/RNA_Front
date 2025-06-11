// src/app/api/user/role/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/app/lib/mongodb';
import UserModel from '@/app/models/User';

export async function GET() { // Maneja la solicitud GET para obtener el rol del usuario
    try {
        await dbConnect(); // Conectar a la base de datos MongoDB
    } catch (dbError) {
        console.error('[API /api/user/role] Error de conexión a MongoDB:', dbError);
        return NextResponse.json(
            { message: 'Error al conectar con la base de datos.', error: dbError.message },
            { status: 503 }
        );
    }

    let email; // Variable para almacenar el email extraído del token

    try {
        const cookieStore = cookies(); // Obtener las cookies de la solicitud
        const tokenCookie = cookieStore.get('token'); // Obtener la cookie del token

        if (!tokenCookie) { // Verificar si la cookie del token existe
            return NextResponse.json(
                { message: 'No se encontró el token de autenticación.' },
                { status: 401 }
            );
        }

        const tokenValue = tokenCookie.value; // Extraer el valor del token de la cookie

        const decodedToken = jwt.verify(tokenValue, process.env.JWT_SECRET); // Decodificar el token usando la clave secreta

        if (!decodedToken || !decodedToken.email) { // Verificar si el token decodificado contiene un email
            return NextResponse.json(
                { message: 'Token inválido o no contiene email.' },
                { status: 401 }
            );
        }

        email = decodedToken.email; // Extraer el email del token decodificado

    } catch (error) { // Manejo de errores al decodificar el token
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return NextResponse.json(
                { message: 'Token inválido o expirado.', error: error.message },
                { status: 401 }
            );
        }
        return NextResponse.json( // Manejo de otros errores al procesar el token
            { message: 'Error interno al procesar el token.', error: error.message },
            { status: 500 }
        );
    }

    if (!email) { // Verificar si se pudo extraer el email del token
        console.log('[API /api/user/role] No se pudo extraer el email del token después de la decodificación.');
        return NextResponse.json(
            { message: 'No se pudo extraer el email del token.' },
            { status: 400 }
        );
    }

    try {
        const normalizedEmail = email.trim().toLowerCase(); // Normalizar el email para evitar duplicados por mayúsculas/minúsculas

        const existingUser = await UserModel.findOne({ email: normalizedEmail }).select('+rol'); // Buscar el usuario en la base de datos por email normalizado y seleccionar el campo 'rol'


        if (existingUser) { // Verificar si el usuario existe en la base de datos
            console.log(`[API /api/user/role] Email ENCONTRADO en MongoDB: ${normalizedEmail}, Rol en DB: ${existingUser.rol}`);
            
            const userRole = existingUser.rol || 'cliente'; // Asignar un rol por defecto si no se encuentra uno

            return NextResponse.json( // Devolver la respuesta JSON con el rol del usuario
                {
                    exists: true,
                    role: userRole, // Aquí se devuelve el rol
                    email: normalizedEmail,
                    message: 'El correo electrónico está registrado y se obtuvo el rol.'
                },
                { status: 200 }
            );
        } else {
            return NextResponse.json( // Devolver una respuesta JSON indicando que el correo electrónico no está registrado
                {
                    exists: false,
                    email: normalizedEmail,
                    message: 'El correo electrónico del token no está registrado.'
                },
                { status: 404 }
            );
        }
    } catch (error) { // Manejo de errores al consultar la base de datos
        console.error('[API /api/user/role] Error al verificar el email/rol en MongoDB:', error);
        return NextResponse.json(
            { message: 'Error en el servidor al verificar el correo electrónico y obtener el rol.', error: error.message },
            { status: 500 }
        );
    }
}