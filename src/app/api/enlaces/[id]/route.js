import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb'; // Importa tu función de conexión a la base de datos
import Enlace from '@/app/models/Enlace'; // Importa tu modelo de Enlace

export async function DELETE(req, context) {
    await dbConnect();

    const { params } = context;
    const { id } = params;

    if (!id) {
        return NextResponse.json({ success: false, message: 'ID no proporcionado' }, { status: 400 }); // Verifica si se proporcionó un ID
    }

    try {
        const enlaceEliminado = await Enlace.findByIdAndDelete(id); // Busca y elimina el enlace por ID

        if (!enlaceEliminado) { // Si no se encontró un enlace con ese ID, devuelve un error 404
            return NextResponse.json({ success: false, message: 'Enlace no encontrado' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Enlace eliminado correctamente' }, { status: 200 });

    } catch (error) {
        if (error.kind === 'ObjectId') {
             return NextResponse.json({ success: false, message: 'ID con formato inválido' }, { status: 400 });
        }
        return NextResponse.json({ success: false, message: 'Error en el servidor', error: error.message }, { status: 500 });
    }
}