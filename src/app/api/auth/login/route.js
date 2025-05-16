import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req) {

    const { email, idToken } = await req.json();

    try {
        
        const token = jwt.sign(
            { userId: idToken, email: email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return new Response(JSON.stringify({ message: 'Inicio de sesión exitoso. Redirigiendo...', token }), { // Devuelve el token en la respuesta JSON *y* en la cookie
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