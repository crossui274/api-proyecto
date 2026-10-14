// Pruebas automáticas de la API (node:test, sin dependencias extra)
process.env.DB_FILE = ':memory:';

const { test, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');

let server, base, idCreado;

before(() => new Promise((resolve) => {
  server = app.listen(0, () => {
    base = `http://localhost:${server.address().port}`;
    resolve();
  });
}));
after(() => server.close());

const req = (method, path, body) =>
  fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

test('POST /api/usuarios crea un usuario (201) y no devuelve el password', async () => {
  const r = await req('POST', '/api/usuarios', { nombre: 'Ana Pérez', email: 'ana@mail.com', password: 'clave123' });
  const data = await r.json();
  assert.strictEqual(r.status, 201);
  assert.ok(data.id_usuario);
  assert.strictEqual(data.email, 'ana@mail.com');
  assert.ok(data.created_at);
  assert.strictEqual(data.password, undefined);
  idCreado = data.id_usuario;
});

test('POST con email repetido responde 409', async () => {
  const r = await req('POST', '/api/usuarios', { nombre: 'Otra', email: 'ana@mail.com', password: 'clave123' });
  assert.strictEqual(r.status, 409);
});

test('POST con datos faltantes responde 400', async () => {
  const r = await req('POST', '/api/usuarios', { nombre: 'Sin email' });
  assert.strictEqual(r.status, 400);
});

test('POST con email inválido responde 400', async () => {
  const r = await req('POST', '/api/usuarios', { nombre: 'X', email: 'no-es-email', password: 'clave123' });
  assert.strictEqual(r.status, 400);
});

test('GET /api/usuarios lista los usuarios (200)', async () => {
  const r = await req('GET', '/api/usuarios');
  const data = await r.json();
  assert.strictEqual(r.status, 200);
  assert.ok(Array.isArray(data));
  assert.strictEqual(data.length, 1);
});

test('GET /api/usuarios/:id devuelve un usuario (200)', async () => {
  const r = await req('GET', `/api/usuarios/${idCreado}`);
  const data = await r.json();
  assert.strictEqual(r.status, 200);
  assert.strictEqual(data.nombre, 'Ana Pérez');
});

test('GET /api/usuarios/:id inexistente responde 404', async () => {
  const r = await req('GET', '/api/usuarios/9999');
  assert.strictEqual(r.status, 404);
});

test('GET /api/usuarios/abc responde 400', async () => {
  const r = await req('GET', '/api/usuarios/abc');
  assert.strictEqual(r.status, 400);
});

test('PUT /api/usuarios/:id actualiza el usuario (200)', async () => {
  const r = await req('PUT', `/api/usuarios/${idCreado}`, { nombre: 'Ana María Pérez' });
  const data = await r.json();
  assert.strictEqual(r.status, 200);
  assert.strictEqual(data.nombre, 'Ana María Pérez');
  assert.strictEqual(data.email, 'ana@mail.com');
});

test('PUT sobre usuario inexistente responde 404', async () => {
  const r = await req('PUT', '/api/usuarios/9999', { nombre: 'X' });
  assert.strictEqual(r.status, 404);
});

test('DELETE /api/usuarios/:id elimina el usuario (200)', async () => {
  const r = await req('DELETE', `/api/usuarios/${idCreado}`);
  assert.strictEqual(r.status, 200);
  const r2 = await req('GET', `/api/usuarios/${idCreado}`);
  assert.strictEqual(r2.status, 404);
});

test('DELETE sobre usuario inexistente responde 404', async () => {
  const r = await req('DELETE', '/api/usuarios/9999');
  assert.strictEqual(r.status, 404);
});
