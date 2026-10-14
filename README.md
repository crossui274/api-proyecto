# API REST de Usuarios — Evaluación Recuperativa (Taller de Plataformas Web)

API REST desarrollada con **Node.js + Express** y base de datos relacional **SQLite**, que implementa el CRUD completo de la entidad `Usuario`.

## Tecnologías
- Node.js 18+ (probado con Node 22)
- Express 5
- SQLite (`better-sqlite3`)
- bcryptjs (el password se guarda encriptado, nunca en texto plano)

## Modelo de datos

Tabla `usuario` (ver `database/schema.sql`):

| Campo      | Tipo     | Restricciones                      |
|------------|----------|------------------------------------|
| id_usuario | INTEGER  | Clave primaria, autoincremental    |
| nombre     | VARCHAR  | Obligatorio                        |
| email      | VARCHAR  | Obligatorio, **único**             |
| password   | VARCHAR  | Obligatorio (guardado con hash)    |
| created_at | DATETIME | Por defecto la fecha/hora actual   |

## Instalación y ejecución

```bash
npm install
npm start
```

El servidor queda en `http://localhost:3000`. La base de datos (`database/usuarios.db`) se crea sola al iniciar.

## Endpoints

| Método | Ruta                | Descripción               | Códigos                  |
|--------|---------------------|---------------------------|--------------------------|
| POST   | /api/usuarios       | Crear usuario             | 201, 400, 409            |
| GET    | /api/usuarios       | Listar usuarios           | 200                      |
| GET    | /api/usuarios/:id   | Obtener usuario por id    | 200, 400, 404            |
| PUT    | /api/usuarios/:id   | Actualizar usuario        | 200, 400, 404, 409       |
| DELETE | /api/usuarios/:id   | Eliminar usuario          | 200, 400, 404            |

### Ejemplo: crear usuario
```json
POST /api/usuarios
{ "nombre": "Ana Pérez", "email": "ana@mail.com", "password": "clave123" }
```
Respuesta `201`:
```json
{ "id_usuario": 1, "nombre": "Ana Pérez", "email": "ana@mail.com", "created_at": "2026-10-14 18:55:45" }
```

## Pruebas

**Automáticas** (12 pruebas, cubren cada operación CRUD y casos de error):
```bash
npm test
```

**Manuales:** importar `postman/API_Usuarios.postman_collection.json` en Postman (con el servidor corriendo).

## Estructura del proyecto
```
├── database/schema.sql
├── postman/API_Usuarios.postman_collection.json
├── src/
│   ├── app.js
│   ├── server.js
│   ├── db.js
│   ├── routes/usuarios.routes.js
│   └── controllers/usuarios.controller.js
├── tests/usuarios.test.js
├── package.json
└── README.md
```
