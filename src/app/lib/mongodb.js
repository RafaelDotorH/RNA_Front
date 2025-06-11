import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI; // Asegúrate de que la variable de entorno MONGODB_URI esté definida

if (!MONGODB_URI) {
    throw new Error('Por favor, define la variable de entorno MONGODB_URI');
}

let cached = global.mongoose; // Verifica si ya existe una conexión de Mongoose en el objeto global

if (!cached) { // Si no existe, crea un objeto de caché para almacenar la conexión
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() { // Función para conectar a la base de datos MongoDB
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => { // Conectar a la base de datos MongoDB usando Mongoose
            return mongoose;
        });
    }

    try { // Espera a que la promesa de conexión se resuelva
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn; // Devuelve la conexión de Mongoose
}

export default dbConnect; // Exporta la función dbConnect para que pueda ser utilizada en otros módulos