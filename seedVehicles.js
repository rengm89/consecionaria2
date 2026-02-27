import fs from 'fs/promises';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vehicle from './models/Vehicle.js';
import BrandModel from './models/BrandModel.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/concesionaria';
const DB_NAME = process.env.DB_NAME || 'concesionaria';
const SEED_PATH = './data/vehiculos.seed.json';
const shouldReset = process.argv.includes('--reset');

const toNonNegativeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) return fallback;
  return parsed;
};

async function run() {
  try {
    const raw = await fs.readFile(SEED_PATH, 'utf-8');
    const seedData = JSON.parse(raw);
    if (!Array.isArray(seedData) || seedData.length === 0) {
      throw new Error('El archivo de seed no contiene vehículos válidos');
    }

    await mongoose.connect(MONGO_URI, { dbName: DB_NAME });

    if (shouldReset) {
      await Vehicle.deleteMany({});
      await BrandModel.deleteMany({});
      console.log('Colección limpiada (--reset).');
    }

    const docs = seedData
      .filter((item) => item && typeof item.marca === 'string' && typeof item.modelo === 'string')
      .map((item) => ({
        marca: item.marca.trim(),
        modelo: item.modelo.trim(),
        kilometros: toNonNegativeNumber(item.kilometros),
        precio: toNonNegativeNumber(item.precio)
      }))
      .filter((item) => item.marca && item.modelo);

    if (docs.length === 0) {
      throw new Error('No quedaron vehículos válidos luego de normalizar');
    }

    await Vehicle.insertMany(docs);

    const uniqueBrandModels = [
      ...new Map(
        docs.map((item) => [`${item.marca.toLowerCase()}|${item.modelo.toLowerCase()}`, { marca: item.marca, modelo: item.modelo }])
      ).values()
    ];

    if (uniqueBrandModels.length > 0) {
      await BrandModel.insertMany(uniqueBrandModels, { ordered: false }).catch(() => {});
    }

    console.log(`Seed completado: ${docs.length} vehículos insertados, ${uniqueBrandModels.length} items de catálogo preparados.`);
  } catch (error) {
    console.error('Error en seedVehicles:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
