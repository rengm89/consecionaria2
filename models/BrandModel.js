import mongoose from 'mongoose';

const BrandModelSchema = new mongoose.Schema({
  marca: { type: String, required: true, trim: true, index: true },
  modelo: { type: String, required: true, trim: true }
}, { timestamps: true });

BrandModelSchema.index({ marca: 1, modelo: 1 }, { unique: true });

const BrandModel = mongoose.model('BrandModel', BrandModelSchema);

export default BrandModel;
