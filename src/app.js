const express = require('express');
const usuariosRoutes = require('./routes/usuarios.routes');

const app = express();
app.use(express.json());

app.get('/', (_req, res) => res.json({ mensaje: 'API REST de Usuarios funcionando' }));
app.use('/api/usuarios', usuariosRoutes);

// Ruta no encontrada
app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

// Manejo de errores (incluye JSON mal formado)
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

module.exports = app;
