// src/app/api/auth/check-email/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb'; 
import UserModel from '@/app/models/User';  
export async function GET(req) {
    await dbConnect();

     const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json(
            { message: 'El parámetro "email" es requerido en la URL.' },
            { status: 400 }
        );
    }

    try {const normalizedEmail = email.trim().toLowerCase();

        console.log(`[API Check Email] Buscando email en MongoDB: ${normalizedEmail}`);

        const existingUser = await UserModel.findOne({ email: normalizedEmail });

        if (existingUser) {
            console.log(`[API Check Email] Email ENCONTRADO en MongoDB: ${normalizedEmail}`);
            return NextResponse.json(
                { exists: true, message: 'El correo electrónico ya está registrado.' },
                { status: 200 }
            );
        } else {
            console.log(`[API Check Email] Email NO ENCONTRADO en MongoDB: ${normalizedEmail}`);
            return NextResponse.json(
                { exists: false, message: 'El correo electrónico no está registrado.' },
                { status: 200 } 
            );
        }

    } catch (error) {
        console.error('[API Check Email] Error al verificar el email en MongoDB:', error);
        return NextResponse.json(
            { message: 'Error en el servidor al verificar el correo electrónico.', error: error.message },
            { status: 500 } // Internal Server Error
        );
    }
}
