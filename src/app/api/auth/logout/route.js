import { NextResponse } from 'next/server';

export async function POST() {
  try {
    return new Response(JSON.stringify({ message: 'Sesión cerrada' }), {
      status: 200,
      headers: {
        'Set-Cookie': `token=; HttpOnly; Path=/; Max-Age=0; Secure; SameSite=Strict`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return NextResponse.json(
      { message: 'Error en el servidor', error: error.message },
      { status: 500 }
    );
  }
}