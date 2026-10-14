const bcrypt = require('bcryptjs');
const db = require('../db');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Nunca se devuelve el password en las respuestas
const CAMPOS_PUBLICOS = 'id_usuario, nombre, email, created_at';

const obtenerPorId = (id) =>
  db.prepare(`SELECT ${CAMPOS_PUBLICOS} FROM usuario WHERE id_usuario = ?`).get(id);

const idValido = (valor) => Number.isInteger(Number(valor)) && Number(valor) > 0;

// CREATE - POST /api/usuarios
exports.crear = (req, res) => {
  const { nombre, email, password } = req.body ?? {};

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Los campos nombre, email y password son obligatorios.' });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'El email no tiene un formato válido.' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'El password debe tener al menos 6 caracteres.' });
  }

  const existe = db.prepare('SELECT 1 FROM usuario WHERE email = ?').get(email);
  if (existe) {
    return res.status(409).json({ error: 'Ya existe un usuario con ese email.' });
  }

  const hash = bcrypt.hashSync(String(password), 10);
  const info = db
    .prepare('INSERT INTO usuario (nombre, email, password) VALUES (?, ?, ?)')
    .run(nombre.trim(), email.trim().toLowerCase(), hash);

  res.status(201).json(obtenerPorId(info.lastInsertRowid));
};

// READ (todos) - GET /api/usuarios
exports.listar = (_req, res) => {
  const usuarios = db.prepare(`SELECT ${CAMPOS_PUBLICOS} FROM usuario ORDER BY id_usuario`).all();
  res.status(200).json(usuarios);
};

// READ (uno) - GET /api/usuarios/:id
exports.obtener = (req, res) => {
  if (!idValido(req.params.id)) {
    return res.status(400).json({ error: 'El id debe ser un número entero positivo.' });
  }
  const usuario = obtenerPorId(req.params.id);
  if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });
  res.status(200).json(usuario);
};

// UPDATE - PUT /api/usuarios/:id
exports.actualizar = (req, res) => {
  const { id } = req.params;
  if (!idValido(id)) {
    return res.status(400).json({ error: 'El id debe ser un número entero positivo.' });
  }
  const actual = db.prepare('SELECT * FROM usuario WHERE id_usuario = ?').get(id);
  if (!actual) return res.status(404).json({ error: 'Usuario no encontrado.' });

  const { nombre, email, password } = req.body ?? {};
  if (!nombre && !email && !password) {
    return res.status(400).json({ error: 'Envía al menos un campo a actualizar: nombre, email o password.' });
  }
  if (email && !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'El email no tiene un formato válido.' });
  }
  if (password && String(password).length < 6) {
    return res.status(400).json({ error: 'El password debe tener al menos 6 caracteres.' });
  }
  if (email) {
    const otro = db
      .prepare('SELECT 1 FROM usuario WHERE email = ? AND id_usuario != ?')
      .get(email.trim().toLowerCase(), id);
    if (otro) return res.status(409).json({ error: 'Ya existe un usuario con ese email.' });
  }

  db.prepare('UPDATE usuario SET nombre = ?, email = ?, password = ? WHERE id_usuario = ?').run(
    nombre ? nombre.trim() : actual.nombre,
    email ? email.trim().toLowerCase() : actual.email,
    password ? bcrypt.hashSync(String(password), 10) : actual.password,
    id
  );

  res.status(200).json(obtenerPorId(id));
};

// DELETE - DELETE /api/usuarios/:id
exports.eliminar = (req, res) => {
  if (!idValido(req.params.id)) {
    return res.status(400).json({ error: 'El id debe ser un número entero positivo.' });
  }
  const info = db.prepare('DELETE FROM usuario WHERE id_usuario = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });
  res.status(200).json({ mensaje: 'Usuario eliminado correctamente.' });
};
