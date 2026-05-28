/**
 * db.js — SQLite Connection & Schema Initialization
 *
 * Uses better-sqlite3 (synchronous, zero-config).
 * The DB file is created automatically at: database/fruit_quality.db
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// db.js lives at backend/src/db.js → go up 2 levels to reach web-app/, then into database/
const DB_PATH = path.resolve(__dirname, '../../database/fruit_quality.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

// Auto-create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS inferences (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp     TEXT    DEFAULT (datetime('now', 'localtime')),
    fruit_type    TEXT    NOT NULL,
    quality_score REAL    NOT NULL,
    status        TEXT    NOT NULL,
    confidence    REAL    NOT NULL DEFAULT 0,
    inference_ms  INTEGER DEFAULT 0,
    snapshot_url  TEXT    DEFAULT '',
    human_label   TEXT    DEFAULT NULL,
    is_corrected  INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS telemetry (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp     TEXT    DEFAULT (datetime('now', 'localtime')),
    fps           REAL    NOT NULL DEFAULT 0,
    inference_ms  INTEGER NOT NULL DEFAULT 0,
    status        TEXT    NOT NULL DEFAULT 'Nominal'
  );
`);

console.log(`✅ SQLite connected: ${DB_PATH}`);

export default db;
