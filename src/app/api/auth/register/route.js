import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import UserModel from '@/app/models/User';
import { hashPassword } from '@/app/lib/auth';

export async function POST(req) {
    try {
        await dbConnect();

        const body = await req.json();
        const { username, email, password } = body;

        if (!username || !email || !password) {
            return NextResponse.json({ message: 'Todos los campos son obligatorios' }, { status: 400 });
        }

        const existingUser = await UserModel.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return NextResponse.json({ message: 'El usuario o correo electrónico ya existe' }, { status: 409 });
        }

        const hashedPassword = await hashPassword(password); //Hashea la contraseña

        const newUser = new UserModel({
            username,
            email,
            passwordHash: hashedPassword, // Guarda el hash
        });

        await newUser.save();

        return NextResponse.json({ message: 'Usuario registrado con éxito' }, { status: 201 });

    } catch (error) {
        console.error("Error en el registro:", error);
        return NextResponse.json({ message: 'Error en el servidor', error: error.message }, { status: 500 });
    }
}