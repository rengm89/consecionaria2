import express from 'express';
import mongoose from 'mongoose';
import Vehicle from './models/Vehicle.js';
import BrandModel from './models/BrandModel.js';
import { authenticate } from './middleware/auth.js';

const router = express.Router();

const parsePriceQuery = (value) => {
  if (value === undefined || value === null || value === '') return null;

  const cleaned = String(value)
    .trim()
    .replace(/\./g, '')
    .replace(',', '.');

  const parsed = Number(cleaned);
  return Number.isNaN(parsed) ? NaN : parsed;
};

const parseNonNegativeNumber = (value) => {
  if (value === undefined || value === null || value === '') return NaN;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return NaN;
  if (parsed < 0) return NaN;
  return parsed;
};

const normalizeText = (value) => String(value || '').trim();

/* =========================
   GET /catalogo/marcas
   ========================= */
router.get('/catalogo/marcas', async (_req, res) => {
  try {
    const marcas = await BrandModel.distinct('marca', {
      marca: { $exists: true, $type: 'string', $ne: '' }
    });

    const normalizadas = marcas
      .map((m) => m.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'es'));

    res.status(200).json(normalizadas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener marcas del catalogo' });
  }
});

/* =========================
   GET /catalogo/modelos
   Query: marca
   ========================= */
router.get('/catalogo/modelos', async (req, res) => {
  try {
    const { marca } = req.query;

    if (!marca || typeof marca !== 'string' || marca.trim() === '') {
      return res.status(400).json({ error: 'Marca requerida' });
    }

    const modelos = await BrandModel.distinct('modelo', {
      marca: new RegExp(`^${marca.trim()}$`, 'i'),
      modelo: { $exists: true, $type: 'string', $ne: '' }
    });

    const normalizados = modelos
      .map((m) => m.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'es'));

    res.status(200).json(normalizados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener modelos del catalogo' });
  }
});

/* =========================
   POST /catalogo
   ========================= */
router.post('/catalogo', authenticate, async (req, res) => {
  try {
    const marca = normalizeText(req.body?.marca);
    const modelo = normalizeText(req.body?.modelo);

    if (!marca || !modelo) {
      return res.status(400).json({ error: 'Marca y modelo son obligatorios' });
    }

    const exists = await BrandModel.findOne({
      marca: new RegExp(`^${marca}$`, 'i'),
      modelo: new RegExp(`^${modelo}$`, 'i')
    });

    if (exists) {
      return res.status(409).json({ error: 'La combinacion marca/modelo ya existe' });
    }

    const created = await BrandModel.create({ marca, modelo });
    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear item de catalogo' });
  }
});

/* =========================
   GET /vehiculos
   Filtros por query params
   ========================= */
router.get('/vehiculos', async (req, res) => {
  try {
    const { marca, modelo, precioMin, precioMax, page = '1', limit = '9', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const query = {};
    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 9, 1), 100);
    const allowedSortFields = ['createdAt', 'precio', 'kilometros', 'marca', 'modelo'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder === 'asc' ? 1 : -1;

    if (marca) {
      query.marca = new RegExp(`^${marca}$`, 'i');
    }

    if (modelo) {
      query.modelo = new RegExp(modelo, 'i');
    }

    if (precioMin || precioMax) {
      query.precio = {};

      if (precioMin) {
        const min = parsePriceQuery(precioMin);
        if (Number.isNaN(min)) {
          return res.status(400).json({ error: 'precioMin invalido' });
        }
        query.precio.$gte = min;
      }

      if (precioMax) {
        const max = parsePriceQuery(precioMax);
        if (Number.isNaN(max)) {
          return res.status(400).json({ error: 'precioMax invalido' });
        }
        query.precio.$lte = max;
      }

      if (query.precio.$gte !== undefined && query.precio.$lte !== undefined) {
        if (query.precio.$gte > query.precio.$lte) {
          return res.status(400).json({ error: 'precioMin no puede ser mayor a precioMax' });
        }
      }
    }

    const [vehiculos, total] = await Promise.all([
      Vehicle.find(query)
        .sort({ [safeSortBy]: safeSortOrder })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Vehicle.countDocuments(query)
    ]);

    const totalPages = Math.max(Math.ceil(total / limitNum), 1);

    res.status(200).json({
      items: vehiculos,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      },
      sorting: {
        sortBy: safeSortBy,
        sortOrder: safeSortOrder === 1 ? 'asc' : 'desc'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los vehiculos' });
  }
});

/* =========================
   GET /vehiculos/marcas
   ========================= */
router.get('/vehiculos/marcas', async (_req, res) => {
  try {
    const marcas = await Vehicle.distinct('marca', {
      marca: { $exists: true, $type: 'string', $ne: '' }
    });

    const normalizadas = marcas
      .map((m) => m.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'es'));

    res.status(200).json(normalizadas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener marcas' });
  }
});

/* =========================
   GET /vehiculos/modelos
   Query: marca
   ========================= */
router.get('/vehiculos/modelos', async (req, res) => {
  try {
    const { marca } = req.query;

    if (!marca || typeof marca !== 'string' || marca.trim() === '') {
      return res.status(400).json({ error: 'Marca requerida' });
    }

    const modelos = await Vehicle.distinct('modelo', {
      marca: new RegExp(`^${marca.trim()}$`, 'i'),
      modelo: { $exists: true, $type: 'string', $ne: '' }
    });

    const normalizados = modelos
      .map((m) => m.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'es'));

    res.status(200).json(normalizados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener modelos' });
  }
});

/* =========================
   GET /vehiculos/:id
   ========================= */
router.get('/vehiculos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const vehiculo = await Vehicle.findById(id);

    if (!vehiculo) {
      return res.status(404).json({ error: 'Vehiculo no encontrado' });
    }

    res.status(200).json(vehiculo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al buscar el vehiculo' });
  }
});

/* =========================
   POST /vehiculos
   ========================= */
router.post('/vehiculos', authenticate, async (req, res) => {
  try {
    const { marca, modelo, precio, kilometros } = req.body;

    if (
      typeof marca !== 'string' ||
      typeof modelo !== 'string' ||
      marca.trim() === '' ||
      modelo.trim() === '' ||
      precio === undefined ||
      kilometros === undefined
    ) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const precioNum = parseNonNegativeNumber(precio);
    const kilometrosNum = parseNonNegativeNumber(kilometros);

    if (Number.isNaN(precioNum) || Number.isNaN(kilometrosNum)) {
      return res.status(400).json({ error: 'Precio y kilometros deben ser numericos y no negativos' });
    }

    const nuevoVehiculo = new Vehicle({
      marca: marca.trim(),
      modelo: modelo.trim(),
      precio: precioNum,
      kilometros: kilometrosNum
    });

    await nuevoVehiculo.save();
    res.status(201).json(nuevoVehiculo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el vehiculo' });
  }
});

/* =========================
   PUT /vehiculos/:id
   ========================= */
router.put('/vehiculos/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const payload = {};
    const allowedFields = ['marca', 'modelo', 'precio', 'kilometros'];

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) payload[key] = req.body[key];
    }

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ error: 'No hay datos para actualizar' });
    }

    if (payload.marca !== undefined) {
      if (typeof payload.marca !== 'string' || payload.marca.trim() === '') {
        return res.status(400).json({ error: 'Marca invalida' });
      }
      payload.marca = payload.marca.trim();
    }

    if (payload.modelo !== undefined) {
      if (typeof payload.modelo !== 'string' || payload.modelo.trim() === '') {
        return res.status(400).json({ error: 'Modelo invalido' });
      }
      payload.modelo = payload.modelo.trim();
    }

    if (payload.precio !== undefined) {
      const precioNum = parseNonNegativeNumber(payload.precio);
      if (Number.isNaN(precioNum)) {
        return res.status(400).json({ error: 'Precio invalido' });
      }
      payload.precio = precioNum;
    }

    if (payload.kilometros !== undefined) {
      const kilometrosNum = parseNonNegativeNumber(payload.kilometros);
      if (Number.isNaN(kilometrosNum)) {
        return res.status(400).json({ error: 'Kilometros invalidos' });
      }
      payload.kilometros = kilometrosNum;
    }

    const vehiculoActualizado = await Vehicle.findByIdAndUpdate(id, payload, { new: true });

    if (!vehiculoActualizado) {
      return res.status(404).json({ error: 'Vehiculo no encontrado' });
    }

    res.status(200).json(vehiculoActualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el vehiculo' });
  }
});

/* =========================
   DELETE /vehiculos/:id
   ========================= */
router.delete('/vehiculos/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const vehiculoEliminado = await Vehicle.findByIdAndDelete(id);

    if (!vehiculoEliminado) {
      return res.status(404).json({ error: 'Vehiculo no encontrado' });
    }

    res.status(200).json({ mensaje: 'Vehiculo eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el vehiculo' });
  }
});

export default router;
