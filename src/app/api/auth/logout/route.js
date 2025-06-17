import { NextResponse } from 'next/server';

export async function POST() { // Maneja la solicitud POST para cerrar sesión
  try {
    return new Response(JSON.stringify({ message: 'Sesión cerrada' }), { // Respuesta JSON indicando que la sesión se ha cerrado
      status: 200,
      headers: {
        'Set-Cookie': `token=; HttpOnly; Path=/; Max-Age=0; Secure; SameSite=Strict`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) { // Manejo de errores en caso de que ocurra un problema al cerrar la sesión
    return NextResponse.json(
      { message: 'Error en el servidor', error: error.message },
      { status: 500 }
    );
  }
}