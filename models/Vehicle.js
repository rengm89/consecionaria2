import mongoose from 'mongoose';

const VehicleSchema = new mongoose.Schema({
  marca: { type: String, required: true, index: true },
  modelo: { type: String },
  anio: { type: Number },
  kilometros: { type: Number, default: 0 },
  precio: { type: Number, default: 0 },
  extra: mongoose.Schema.Types.Mixed
}, { timestamps: true });

VehicleSchema.index({ modelo: 1 });
VehicleSchema.index({ precio: 1 });
VehicleSchema.index({ marca: 1, precio: 1 });

const Vehicle = mongoose.model('Vehicle', VehicleSchema);

export default Vehicle;
