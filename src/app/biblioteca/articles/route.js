
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb'; 
import ArticleModel from '@/app/models/Article';

export async function GET() {
    await dbConnect(); //

    try {
        const articles = await ArticleModel.find({}).sort({ uploadedAt: -1 });
        return NextResponse.json({ articles }, { status: 200 });
    } catch (error) {
        console.error('[API Get Articles Error]', error);
        return NextResponse.json(
            { message: 'Error al obtener los artículos.', error: error.message },
            { status: 500 }
        );
    }
}