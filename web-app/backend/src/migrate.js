import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, '../../database/fruit_quality.db');

console.log(`Connecting to ${DB_PATH}...`);
const db = new Database(DB_PATH);

try {
  db.exec(`ALTER TABLE inferences ADD COLUMN human_label TEXT DEFAULT NULL;`);
  console.log('Added human_label column.');
} catch (err) {
  console.log('Column human_label might already exist:', err.message);
}

try {
  db.exec(`ALTER TABLE inferences ADD COLUMN is_corrected INTEGER DEFAULT 0;`);
  console.log('Added is_corrected column.');
} catch (err) {
  console.log('Column is_corrected might already exist:', err.message);
}

console.log('Migration complete.');
