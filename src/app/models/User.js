import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({ // Definición del esquema de usuario
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 20 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  rol: { type: String,  required: true }
}, { timestamps: true });

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema); // Exporta el modelo UserModel, si ya existe en mongoose lo reutiliza, si no lo crea nuevo

export default UserModel; // Exporta el modelo UserModel para que pueda ser utilizado en otros módulos