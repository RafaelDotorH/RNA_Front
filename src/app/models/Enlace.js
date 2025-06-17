import mongoose, { Schema } from 'mongoose';

const EnlaceSchema = new Schema({
  titulo: { type: String, required: true, trim: true, minlength: 3, maxlength: 20 },
  descripcion: { type: String, required: true, trim: true, lowercase: true },
  fecha: { type: String,  required: true },
  url: { type: String, required: true }
}, { timestamps: true });

const EnlaceModel = mongoose.models.Enlace || mongoose.model('Enlace', EnlaceSchema);

export default EnlaceModel;