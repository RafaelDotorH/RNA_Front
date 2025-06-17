import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb'; 
import UserModel from '@/app/models/User';  
export async function GET(req) {
    await dbConnect();

     const { searchParams } = new URL(req.url);
    const email = searchParams.get('email'); //obtiene el parámetro email de la URL
    // Verifica si el parámetro email está presente

    if (!email) {
        return NextResponse.json(
            { message: 'El parámetro "email" es requerido en la URL.' },
            { status: 400 }
        );
    }

    try {const normalizedEmail = email.trim().toLowerCase(); // Normaliza el email para evitar duplicados por mayúsculas/minúsculas
        // Busca el usuario en la base de datos por email normalizado

        const existingUser = await UserModel.findOne({ email: normalizedEmail });

        if (existingUser) {
            return NextResponse.json(
                { exists: true, message: 'El correo electrónico ya está registrado.' },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                { exists: false, message: 'El correo electrónico no está registrado.' },
                { status: 200 } 
            );
        }

    } catch (error) { // Manejo de errores en caso de que ocurra un problema al consultar la base de datos
        console.error('[API Check Email] Error al verificar el email en MongoDB:', error);
        return NextResponse.json(
            { message: 'Error en el servidor al verificar el correo electrónico.', error: error.message },
            { status: 500 } // Internal Server Error
        );
    }
}
