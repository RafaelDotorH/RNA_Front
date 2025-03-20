import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import User from '@/app/models/User'; // Asegúrate de que el nombre del modelo sea correcto
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // Ya deberías tener bcryptjs en tu package.json

export async function POST(req) {
    await dbConnect();

    const { username, password } = await req.json();

    try {
        if (!username || !password) {
            return NextResponse.json({ message: 'Usuario y contraseña son obligatorios' }, { status: 400 });
        }

        const user = await User.findOne({ username });
        console.log("Usuario encontrado:", user);  // Descomenta para depurar si es necesario

        if (!user) {
            return NextResponse.json({ message: 'Usuario o contraseña incorrecta' }, { status: 401 }); // Mensaje unificado
        }

        if (!user.passwordHash) {
            return NextResponse.json({ message: 'Error interno del servidor (contraseña no encontrada)' }, { status: 500 });
        }

        console.log("contraseña original: ", password) // Descomenta para depurar si es necesario
        console.log ("contraseña hasheada:", user.passwordHash) // Descomenta para depurar si es necesario

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash); // Solo una comparación

        console.log("resultado de comparacion ",isPasswordValid) // Descomenta para depurar si es necesario

        if (!isPasswordValid) {
            return NextResponse.json({ message: 'Usuario o contraseña incorrecta' }, { status: 401 }); // Mensaje unificado
        }
        // --- Generación del JWT ---
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET, // Asegúrate de tener esta variable de entorno definida
            { expiresIn: '1h' } // O el tiempo de expiración que desees
        );

        // --- Respuesta con Cookie ---
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