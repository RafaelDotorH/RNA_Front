import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import UserModel from '@/app/models/User'; 

export async function POST(req) {
    await dbConnect();

    try {
        const body = await req.json(); // Obtener el cuerpo de la solicitud
        const { username, email} = body; // Extraer username y email del cuerpo

        if (!username || !email ) {  // Verificar si faltan campos obligatorios
            return NextResponse.json({ message: 'Faltan campos obligatorios (username, email)' }, { status: 400 });
        }

        // Verificar si el usuario o correo ya existe
        const existingUserByUsername = await UserModel.findOne({ username });
        if (existingUserByUsername) {
            return NextResponse.json({ message: 'El nombre de usuario ya existe' }, { status: 409 });
        }
        const existingUserByEmail = await UserModel.findOne({ email });
        if (existingUserByEmail) { // Verificar si el correo electrónico ya está registrado
            return NextResponse.json({ message: 'El correo electrónico ya está registrado' }, { status: 409 });
        }

        const userDataToSave = { // Crear un objeto con los datos del usuario
            username,
            email,
            rol: "cliente"
        };

        const newUser = new UserModel(userDataToSave); // Crear una instancia del modelo UserModel con los datos del usuario

        await newUser.save(); // Guardar el nuevo usuario en la base de datos

        return NextResponse.json({ message: 'Usuario registrado en mongo con éxito', user: newUser.toObject() }, { status: 201 }); // Respuesta JSON indicando que el usuario se ha registrado correctamente

    } catch (error) { // Manejo de errores
        if (error.name === 'ValidationError') {
            return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
        }
        return NextResponse.json({ message: 'Error en el servidor mongoDB', error: error.message }, { status: 500 });
    }
}