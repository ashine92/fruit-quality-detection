/**
 * seed.js — Seed sample data into SQLite DB for testing
 *
 * Run once from the web-app/ directory:
 *   node database/seed.js
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, 'fruit_quality.db');

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

// Create tables if not exist
db.exec(`
  CREATE TABLE IF NOT EXISTS inferences (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp     TEXT    DEFAULT (datetime('now', 'localtime')),
    fruit_type    TEXT    NOT NULL,
    quality_score REAL    NOT NULL,
    status        TEXT    NOT NULL,
    confidence    REAL    NOT NULL DEFAULT 0,
    inference_ms  INTEGER DEFAULT 0,
    snapshot_url  TEXT    DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS telemetry (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp     TEXT    DEFAULT (datetime('now', 'localtime')),
    fps           REAL    NOT NULL DEFAULT 0,
    inference_ms  INTEGER NOT NULL DEFAULT 0,
    status        TEXT    NOT NULL DEFAULT 'Nominal'
  );
`);

console.log('🌱 Seeding sample data into SQLite...');

// Clear existing data for a clean seed
db.exec(`DELETE FROM inferences; DELETE FROM telemetry;`);

// Sample inference data — 5 days, various statuses
const STATUSES  = ['Ripe', 'Unripe', 'Overripe', 'Rotten'];
const QUALITIES = { Ripe: 0.92, Unripe: 0.65, Overripe: 0.40, Rotten: 0.10 };

const insertInference = db.prepare(`
  INSERT INTO inferences (timestamp, fruit_type, status, quality_score, confidence, inference_ms)
  VALUES (?, 'Banana', ?, ?, ?, ?)
`);

// Distribution: 60% Ripe, 15% Unripe, 15% Overripe, 10% Rotten
const distribution = [
  ...Array(12).fill('Ripe'),
  ...Array(3).fill('Unripe'),
  ...Array(3).fill('Overripe'),
  ...Array(2).fill('Rotten'),
];

// Generate 100 records spread over the last 5 days
const insertMany = db.transaction(() => {
  for (let i = 0; i < 100; i++) {
    const daysAgo  = Math.floor(i / 20); // ~20 per day
    const hoursAgo = Math.floor(Math.random() * 8); // random hour within the day
    const minsAgo  = Math.floor(Math.random() * 60);

    const ts = new Date();
    ts.setDate(ts.getDate() - daysAgo);
    ts.setHours(ts.getHours() - hoursAgo);
    ts.setMinutes(ts.getMinutes() - minsAgo);
    const timestamp = ts.toISOString().replace('T', ' ').substring(0, 19);

    const status       = distribution[i % distribution.length];
    const qualityScore = QUALITIES[status];
    const confidence   = parseFloat((qualityScore * 100 - Math.random() * 5).toFixed(1));
    const inferenceMs  = Math.floor(Math.random() * 10 + 8); // 8–18ms

    insertInference.run(timestamp, status, qualityScore, confidence, inferenceMs);
  }
});

insertMany();

// Seed 1 telemetry record
db.prepare(`
  INSERT INTO telemetry (fps, inference_ms, status) VALUES (?, ?, ?)
`).run(60.2, 12, 'Nominal');

const total = db.prepare('SELECT COUNT(*) as count FROM inferences').get();
console.log(`✅ Seeding complete! ${total.count} inference records inserted.`);
console.log(`📁 DB file: ${DB_PATH}`);

db.close();
