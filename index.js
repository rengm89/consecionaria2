import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import router from './routes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

// Conectar a la DB
connectDB();

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api', router);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));