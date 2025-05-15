import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req) {

    const { username, idToken } = await req.json();

    try {
        
        const token = jwt.sign(
            { userId: idToken, username: username },
            process.env.JWT_SECRET, // Asegúrate de tener esta variable de entorno definida
            { expiresIn: '1h' } // O el tiempo de expiración que desees
        );

        return new Response(JSON.stringify({ message: 'Inicio de sesión exitoso', token }), { // Devuelve el token en la respuesta JSON *y* en la cookie
            status: 200,
            headers: {
                'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=3600; Secure; SameSite=Strict`, // Mejoras en la cookie
                'Content-Type': 'application/json', // Especifica el tipo de contenido
            },
        });

    } catch (error) {
        console.error('Error en la API de login:', error);
        return NextResponse.json({ message: 'Error en el servidor', error: error.message }, { status: 500 }); // Incluye el mensaje de error para depuración
    }
}