# Concesionaria

Aplicacion para gestionar catalogo y stock de vehiculos.

## Stack

- Backend: Node.js, Express, MongoDB (Mongoose), JWT
- Frontend: React + Vite

## Requisitos

- Node.js 18 o superior
- MongoDB en ejecucion local (por defecto `mongodb://127.0.0.1:27017`)

## Instalacion

1. Instalar dependencias del backend:

```bash
npm install
```

2. Instalar dependencias del frontend:

```bash
cd frontend
npm install
cd ..
```

## Variables de entorno (backend)

Crear archivo `.env` en la raiz:

```env
MONGO_URI=mongodb://127.0.0.1:27017/concesionaria
DB_NAME=concesionaria
JWT_SECRET=tu_clave_segura
JWT_EXPIRES_IN=2h
PORT=3001
```

## Ejecutar en desarrollo

1. Backend (raiz del proyecto):

```bash
npm run dev
```

2. Frontend (otra terminal):

```bash
cd frontend
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001/api`

## Scripts utiles (backend)

- `npm run start`: iniciar backend en modo normal
- `npm run dev`: iniciar backend con nodemon
- `npm run seed:vehicles`: cargar vehiculos seed
- `npm run seed:vehicles:reset`: reiniciar y recargar vehiculos seed
- `npm run sync:catalog`: sincronizar catalogo de marcas/modelos desde vehiculos

## Autenticacion

- Login: `POST /api/auth/login`
- Endpoints protegidos requieren header:

```http
Authorization: Bearer <token>
```

## Endpoints principales

- `GET /api/vehiculos`
- `GET /api/vehiculos/:id`
- `POST /api/vehiculos` (protegido)
- `PUT /api/vehiculos/:id` (protegido)
- `DELETE /api/vehiculos/:id` (protegido)
- `GET /api/catalogo/marcas`
- `GET /api/catalogo/modelos?marca=...`
- `POST /api/catalogo` (protegido)
