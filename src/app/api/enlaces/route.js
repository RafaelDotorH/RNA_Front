import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import Enlace from '@/app/models/enlace';

export async function GET() {
    await dbConnect();

    try {
        const enlaces = await Enlace.find({}).sort({ fecha: -1 });

        return NextResponse.json({ success: true, enlaces: enlaces }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    await dbConnect();

    try {
        const body = await req.json();

        // LOG 1: Muestra en la TERMINAL lo que el backend recibe.
        console.log('BACKEND RECIBIÓ ESTE CUERPO:', body);

        const newEnlace = await Enlace.create(body);

        return NextResponse.json({ success: true, message: 'Enlace agregado con éxito', data: newEnlace }, { status: 201 });

    } catch (error) {
        // LOG 2: Muestra en la TERMINAL el error COMPLETO de Mongoose.
        // Esto es crucial, nos dirá exactamente qué campo falló la validación.
        console.error('ERROR COMPLETO DEL BACKEND:', error); 

        if (error.name === 'ValidationError') {
            return NextResponse.json({ success: false, message: 'Error de validación del backend.', errors: error.errors }, { status: 400 });
        }
        return NextResponse.json({ success: false, message: 'Error interno del servidor.', error: error.message }, { status: 500 });
    }
}