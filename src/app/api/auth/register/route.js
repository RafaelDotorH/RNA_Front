import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import UserModel from '@/app/models/User'; 

export async function POST(req) {
    await dbConnect();

    try {
        const body = await req.json();
        const { username, email} = body;

        if (!username || !email ) { 
            return NextResponse.json({ message: 'Faltan campos obligatorios (username, email)' }, { status: 400 });
        }

        // Verificar si el usuario o correo ya existe
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

        const newUser = new UserModel(userDataToSave);

        await newUser.save();

        return NextResponse.json({ message: 'Usuario registrado en mongo con éxito', user: newUser.toObject() }, { status: 201 });

    } catch (error) {
        if (error.name === 'ValidationError') {
            return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
        }
        return NextResponse.json({ message: 'Error en el servidor mongoDB', error: error.message }, { status: 500 });
    }
}