import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req) {

    const { email , idToken } = await req.json();

    try {
        
        const token = jwt.sign(
            { userId: idToken, email }, 
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return new Response(JSON.stringify({ message: 'Inicio de sesión exitoso. Redirigiendo...', token }), {
            status: 200,
            headers: {
                'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=3600; Secure; SameSite=Strict`,
                'Content-Type': 'application/json',
            },
        });

    } catch (error) {
        return NextResponse.json({ message: 'Error en el servidor', error: error.message }, { status: 500 });
    }
}