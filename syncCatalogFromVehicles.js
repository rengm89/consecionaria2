import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vehicle from './models/Vehicle.js';
import BrandModel from './models/BrandModel.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/concesionaria';
const DB_NAME = process.env.DB_NAME || 'concesionaria';

async function run() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: DB_NAME });

    const rows = await Vehicle.aggregate([
      {
        $match: {
          marca: { $type: 'string', $ne: '' },
          modelo: { $type: 'string', $ne: '' }
        }
      },
      {
        $project: {
          marca: { $trim: { input: '$marca' } },
          modelo: { $trim: { input: '$modelo' } }
        }
      },
      {
        $match: {
          marca: { $ne: '' },
          modelo: { $ne: '' }
        }
      },
      {
        $group: {
          _id: { marca: '$marca', modelo: '$modelo' }
        }
      }
    ]);

    const docs = rows.map((r) => ({
      marca: r._id.marca,
      modelo: r._id.modelo
    }));

    if (docs.length === 0) {
      console.log('No se encontraron combinaciones marca/modelo en Vehicle.');
      return;
    }

    await BrandModel.insertMany(docs, { ordered: false }).catch(() => {});
    console.log(`Sincronización completada: ${docs.length} combinaciones procesadas.`);
  } catch (error) {
    console.error('Error al sincronizar catálogo:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
