import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 20 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
}, { timestamps: true });

UserSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.passwordHash);
  };

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

export default UserModel;