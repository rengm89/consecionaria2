import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME || 'concesionaria'
    });
    console.log('MongoDB conectado ✔');
  } catch (err) {
    console.error('Error al conectar a Mongo:', err);
    process.exit(1);
  }
}
