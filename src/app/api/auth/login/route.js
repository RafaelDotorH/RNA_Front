import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req) {

    const { email , idToken } = await req.json(); // Extrae email e idToken del cuerpo de la solicitud

    try {
        
        const token = jwt.sign(     // Crea un token JWT con el idToken y email
            { userId: idToken, email }, 
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return new Response(JSON.stringify({ message: 'Inicio de sesión exitoso. Redirigiendo...', token }), { // Respuesta JSON con el token
            status: 200,
            headers: {
                'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=3600; Secure; SameSite=Strict`,
                'Content-Type': 'application/json',
            },
        });

    } catch (error) { // Manejo de errores en caso de que ocurra un problema al crear el token
        return NextResponse.json({ message: 'Error en el servidor', error: error.message }, { status: 500 });
    }
}