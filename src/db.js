const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// En tests se usa una base en memoria; en producción un archivo local.
const dbFile = process.env.DB_FILE || path.join(__dirname, '..', 'database', 'usuarios.db');
const db = new Database(dbFile);

db.pragma('journal_mode = WAL');

// Crea la tabla a partir del esquema SQL si no existe
const schema = fs.readFileSync(path.join(__dirname, '..', 'database', 'schema.sql'), 'utf8');
db.exec(schema);

module.exports = db;
