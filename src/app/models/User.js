import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 20 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  rol: { type: String,  required: true }
}, { timestamps: true });

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

export default UserModel;