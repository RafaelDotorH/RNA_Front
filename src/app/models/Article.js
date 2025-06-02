// src/app/models/Article.js
import mongoose, { Schema } from 'mongoose';

const ArticleSchema = new Schema({
  name: { type: String, required: true, trim: true },
  firebaseStoragePath: { type: String, required: true, unique: true },
  downloadURL: { type: String, required: true, unique: true },
  contentType: { type: String, default: 'application/pdf' },
  uploadedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const ArticleModel = mongoose.models.Article || mongoose.model('Article', ArticleSchema);

export default ArticleModel;