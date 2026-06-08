/**
 * inferenceRoutes.js — API Routes for Inference & Telemetry Data
 *
 * Endpoints:
 *   GET  /api/v1/stats          → Aggregated production statistics
 *   GET  /api/v1/telemetry      → Latest device telemetry
 *   GET  /api/v1/inferences     → Inference log list (with confidence filter)
 *   GET  /api/v1/yield-trend    → Daily yield trend for charts
 *   POST /api/v1/inferences     → Receive new detection result from Edge device
 */

import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// ─────────────────────────────────────────────
// GET /api/v1/stats
// Returns aggregated production statistics
// ─────────────────────────────────────────────
router.get('/stats', (req, res) => {
  try {
    const total = db.prepare(`SELECT COUNT(*) as count FROM inferences`).get();

    const counts = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM inferences
      GROUP BY status
    `).all();

    const countsMap = { Ripe: 0, Unripe: 0, Overripe: 0, Rotten: 0 };
    for (const row of counts) {
      if (countsMap.hasOwnProperty(row.status)) {
        countsMap[row.status] = row.count;
      }
    }

    const totalInspected = total.count;
    const goodCount = (countsMap.Ripe || 0) + (countsMap.Unripe || 0);
    const yieldRate = totalInspected > 0
      ? parseFloat(((goodCount / totalInspected) * 100).toFixed(1))
      : 0;

    res.json({
      totalInspected,
      yieldRate,
      counts: countsMap,
    });
  } catch (err) {
    console.error('GET /stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ─────────────────────────────────────────────
// GET /api/v1/telemetry
// Returns latest telemetry row, or default if empty
// ─────────────────────────────────────────────
router.get('/telemetry', (req, res) => {
  try {
    const row = db.prepare(`
      SELECT fps, inference_ms as inferenceTimeMs, status
      FROM telemetry
      ORDER BY id DESC
      LIMIT 1
    `).get();

    if (!row) {
      // No data yet — return safe defaults
      return res.json({ fps: 0, inferenceTimeMs: 0, status: 'Waiting for device' });
    }

    res.json(row);
  } catch (err) {
    console.error('GET /telemetry error:', err);
    res.status(500).json({ error: 'Failed to fetch telemetry' });
  }
});

// ─────────────────────────────────────────────
// POST /api/v1/telemetry
// Insert telemetry data from Edge device
// ─────────────────────────────────────────────
router.post('/telemetry', (req, res) => {
  try {
    const { fps, inference_ms, status } = req.body;
    db.prepare(`
      INSERT INTO telemetry (fps, inference_ms, status)
      VALUES (?, ?, ?)
    `).run(fps || 0, inference_ms || 0, status || 'Online');
    
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('POST /telemetry error:', err);
    res.status(500).json({ error: 'Failed to insert telemetry' });
  }
});

// ─────────────────────────────────────────────
// GET /api/v1/inferences
// Query params: ?confidence=80 (filter by min confidence)
// ─────────────────────────────────────────────
router.get('/inferences', (req, res) => {
  try {
    const threshold = parseFloat(req.query.confidence) || 0;

    const rows = db.prepare(`
      SELECT
        id as rawId,
        '#BN-' || printf('%04d', id) as id,
        timestamp,
        fruit_type  as fruitType,
        status      as className,
        confidence,
        quality_score as qualityScore,
        snapshot_url  as snapshotUrl,
        human_label   as humanLabel,
        is_corrected  as isCorrected
      FROM inferences
      WHERE confidence >= ?
      ORDER BY rowid DESC
      LIMIT 50
    `).all(threshold);

    res.json(rows);
  } catch (err) {
    console.error('GET /inferences error:', err);
    res.status(500).json({ error: 'Failed to fetch inferences' });
  }
});

// ─────────────────────────────────────────────
// GET /api/v1/yield-trend
// Returns daily aggregated data for the area chart
// ─────────────────────────────────────────────
router.get('/yield-trend', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT
        strftime('%w', timestamp) as dayOfWeek,
        date(timestamp)           as date,
        COUNT(*)                  as yield,
        SUM(CASE WHEN status = 'Ripe'     THEN 1 ELSE 0 END) as gradeA,
        SUM(CASE WHEN status = 'Unripe'   THEN 1 ELSE 0 END) as gradeB,
        SUM(CASE WHEN status IN ('Overripe', 'Rotten') THEN 1 ELSE 0 END) as rejected
      FROM inferences
      GROUP BY date(timestamp)
      ORDER BY date(timestamp) ASC
      LIMIT 7
    `).all();

    const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = rows.map(row => ({
      name: DAY_NAMES[parseInt(row.dayOfWeek)] || row.date,
      yield: row.yield,
      gradeA: row.gradeA,
      gradeB: row.gradeB,
      rejected: row.rejected,
    }));

    res.json(result);
  } catch (err) {
    console.error('GET /yield-trend error:', err);
    res.status(500).json({ error: 'Failed to fetch yield trend' });
  }
});

// ─────────────────────────────────────────────
// POST /api/v1/inferences
// Called by Edge AI device to submit a detection result
// Body: { fruit_type, status, quality_score, confidence, inference_ms, snapshot_url? }
// ─────────────────────────────────────────────
router.post('/inferences', (req, res) => {
  try {
    const {
      fruit_type,
      status,
      quality_score,
      confidence,
      inference_ms = 0,
      snapshot_url = '',
    } = req.body;

    if (!fruit_type || !status || quality_score == null || confidence == null) {
      return res.status(400).json({
        error: 'Missing required fields: fruit_type, status, quality_score, confidence',
      });
    }

    let final_snapshot_url = snapshot_url;
    if (snapshot_url && snapshot_url.startsWith('data:image')) {
      const matches = snapshot_url.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const ext = matches[1];
        const data = matches[2];
        const buffer = Buffer.from(data, 'base64');
        const filename = `snapshot_${Date.now()}.${ext}`;
        const filepath = path.join(__dirname, '../../public/snapshots', filename);

        fs.mkdirSync(path.dirname(filepath), { recursive: true });
        fs.writeFileSync(filepath, buffer);

        final_snapshot_url = `/public/snapshots/${filename}`;
      }
    }

    const stmt = db.prepare(`
      INSERT INTO inferences (fruit_type, status, quality_score, confidence, inference_ms, snapshot_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(fruit_type, status, quality_score, confidence, inference_ms, final_snapshot_url);

    res.status(201).json({
      success: true,
      id: info.lastInsertRowid,
      message: 'Inference record created',
    });
  } catch (err) {
    console.error('POST /inferences error:', err);
    res.status(500).json({ error: 'Failed to save inference' });
  }
});

// ─────────────────────────────────────────────
// PATCH /api/v1/inferences/:id/label
// Called by UI to assign a human label
// Body: { human_label }
// ─────────────────────────────────────────────
router.patch('/inferences/:id/label', (req, res) => {
  try {
    const rawId = req.params.id;
    let numericId = rawId;
    if (typeof rawId === 'string' && rawId.startsWith('#BN-')) {
      numericId = parseInt(rawId.replace('#BN-', ''), 10);
    }

    const { human_label } = req.body;
    if (!human_label) {
      return res.status(400).json({ error: 'Missing human_label' });
    }

    const stmt = db.prepare(`
      UPDATE inferences
      SET human_label = ?, is_corrected = 1
      WHERE id = ?
    `);

    const info = stmt.run(human_label, numericId);

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Inference record not found' });
    }

    res.json({ success: true, message: 'Label updated' });
  } catch (err) {
    console.error('PATCH /inferences/:id/label error:', err);
    res.status(500).json({ error: 'Failed to update label' });
  }
});

// ─────────────────────────────────────────────
// POST /api/v1/snapshots
// Called by UI to save a snapshot from video stream
// Body: { imageBase64 }
// ─────────────────────────────────────────────
router.post('/snapshots', (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64 || !imageBase64.startsWith('data:image')) {
      return res.status(400).json({ error: 'Invalid or missing imageBase64' });
    }

    const matches = imageBase64.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 format' });
    }

    const ext = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');
    const filename = `snapshot_${Date.now()}.${ext}`;
    const filepath = path.join(__dirname, '../../public/snapshots', filename);
    
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    fs.writeFileSync(filepath, buffer);
    
    const snapshot_url = `/public/snapshots/${filename}`;

    res.json({ success: true, url: snapshot_url });
  } catch (err) {
    console.error('POST /snapshots error:', err);
    res.status(500).json({ error: 'Failed to save snapshot' });
  }
});

export default router;
