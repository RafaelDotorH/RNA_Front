import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb'; //
import ArticleModel from '@/app/models/Article'; // Ajusta la ruta si es necesario
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app as firebaseApp } from '@/app/lib/firebasedb'; //

export async function POST(req) {
    await dbConnect(); //

    try {
        const formData = await req.formData();
        const file = formData.get('pdf');

        if (!file) {
            return NextResponse.json({ message: 'No se subió ningún archivo.' }, { status: 400 });
        }

        if (file.type !== 'application/pdf') {
            return NextResponse.json({ message: 'Solo se permiten archivos PDF.' }, { status: 400 });
        }

        const storage = getStorage(firebaseApp);
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const storageRef = ref(storage, `biblioteca/${fileName}`);

        const arrayBuffer = await file.arrayBuffer();
        await uploadBytes(storageRef, arrayBuffer, { contentType: 'application/pdf' });

        const downloadURL = await getDownloadURL(storageRef);

        const newArticle = new ArticleModel({
            name: file.name,
            firebaseStoragePath: storageRef.fullPath,
            downloadURL: downloadURL,
            contentType: file.type,
        });

        await newArticle.save();

        return NextResponse.json(
            { message: '¡Archivo subido y metadatos guardados!', article: newArticle },
            { status: 201 }
        );

    } catch (error) {
        console.error('[API Upload Error]', error);
        if (error.code && error.code.startsWith('storage/')) {
             return NextResponse.json({ message: `Error de Firebase Storage: ${error.message}`, code: error.code }, { status: 500 });
        }
        if (error.code === 11000) {
            return NextResponse.json({ message: 'Error: Ya existe un artículo con esa información (ruta o URL duplicada).' }, { status: 409 });
        }
        return NextResponse.json(
            { message: 'Error al subir el archivo o guardar los metadatos.', error: error.message },
            { status: 500 }
        );
    }
}