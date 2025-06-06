// src/app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb'; // Asegúrate que esta ruta sea correcta
import UserModel from '@/app/models/User'; // O la ruta correcta a tu modelo
// import bcrypt from 'bcryptjs'; // Necesitarás esto para hashear la contraseña

export async function POST(req) {
    await dbConnect();

    try {
        const body = await req.json();
        const { username, email} = body;

        console.log("Valores recibidos en el cuerpo de la solicitud:", JSON.stringify(body, null, 2));

        if (!username || !email ) { 
            return NextResponse.json({ message: 'Faltan campos obligatorios (username, email)' }, { status: 400 });
        }

        // Verificar si el usuario o correo ya existe (como ya lo tienes)
        const existingUserByUsername = await UserModel.findOne({ username });
        if (existingUserByUsername) {
            return NextResponse.json({ message: 'El nombre de usuario ya existe' }, { status: 409 });
        }
        const existingUserByEmail = await UserModel.findOne({ email });
        if (existingUserByEmail) {
            return NextResponse.json({ message: 'El correo electrónico ya está registrado' }, { status: 409 });
        }

        const userDataToSave = {
            username,
            email,
            rol: "cliente"
        };
        console.log("Datos que se pasarán al constructor de UserModel:", JSON.stringify(userDataToSave, null, 2));

        const newUser = new UserModel(userDataToSave);

        console.log("Instancia de newUser ANTES de .save():", JSON.stringify(newUser.toObject(), null, 2));

        await newUser.save();

        console.log("Instancia de newUser DESPUÉS de .save():", JSON.stringify(newUser.toObject(), null, 2));

        return NextResponse.json({ message: 'Usuario registrado en mongo con éxito', user: newUser.toObject() }, { status: 201 });

    } catch (error) {
        console.error('Error en el registro mongoDB (ruta API):', error);
        if (error.name === 'ValidationError') {
            return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
        }
        return NextResponse.json({ message: 'Error en el servidor mongoDB', error: error.message }, { status: 500 });
    }
}