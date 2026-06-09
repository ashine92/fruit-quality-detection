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

// AI Model endpoint — must match realtime.py MODEL_URL
const AI_MODEL_URL = process.env.AI_MODEL_URL || 'http://127.0.0.1:5001/image';
const CONFIDENCE_THRESHOLD = parseFloat(process.env.CONFIDENCE_THRESHOLD || '0.70');

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
// DELETE /api/v1/inferences/:id/label
// Undo human label — clear human_label and reset is_corrected
// ─────────────────────────────────────────────
router.delete('/inferences/:id/label', (req, res) => {
  try {
    const rawId = req.params.id;
    let numericId = rawId;
    if (typeof rawId === 'string' && rawId.startsWith('#BN-')) {
      numericId = parseInt(rawId.replace('#BN-', ''), 10);
    }

    const info = db.prepare(`
      UPDATE inferences
      SET human_label = NULL, is_corrected = 0
      WHERE id = ?
    `).run(numericId);

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Inference record not found' });
    }

    res.json({ success: true, message: 'Label cleared' });
  } catch (err) {
    console.error('DELETE /inferences/:id/label error:', err);
    res.status(500).json({ error: 'Failed to clear label' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/v1/inferences/all
// Wipe ALL inference records and delete all snapshot files
// ─────────────────────────────────────────────
router.delete('/inferences/all', (req, res) => {
  try {
    const snapshotDir = path.join(__dirname, '../../public/snapshots');

    // Delete all snapshot files from disk
    try {
      if (fs.existsSync(snapshotDir)) {
        const files = fs.readdirSync(snapshotDir);
        for (const file of files) {
          try { fs.unlinkSync(path.join(snapshotDir, file)); } catch {}
        }
      }
    } catch {}

    // Wipe all DB records
    const info = db.prepare(`DELETE FROM inferences`).run();

    res.json({ success: true, deletedCount: info.changes });
  } catch (err) {
    console.error('DELETE /inferences/all error:', err);
    res.status(500).json({ error: 'Failed to delete all records' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/v1/inferences/:id
// Delete a single inference record and its snapshot file
// ─────────────────────────────────────────────
router.delete('/inferences/:id', (req, res) => {
  try {
    const rawId = req.params.id;
    let numericId = parseInt(
      typeof rawId === 'string' && rawId.startsWith('#BN-')
        ? rawId.replace('#BN-', '')
        : rawId,
      10
    );

    // Get the snapshot path before deleting the DB row
    const row = db.prepare(`SELECT snapshot_url FROM inferences WHERE id = ?`).get(numericId);
    if (!row) return res.status(404).json({ error: 'Record not found' });

    // Delete DB record
    db.prepare(`DELETE FROM inferences WHERE id = ?`).run(numericId);

    // Delete snapshot file if it exists on disk
    if (row.snapshot_url && row.snapshot_url.startsWith('/public/snapshots/')) {
      const filename = path.basename(row.snapshot_url);
      const filepath = path.join(__dirname, '../../public/snapshots', filename);
      try { if (fs.existsSync(filepath)) fs.unlinkSync(filepath); } catch {}
    }

    res.json({ success: true, message: 'Record deleted' });
  } catch (err) {
    console.error('DELETE /inferences/:id error:', err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/v1/inferences  (bulk)
// Body: { ids: [1, 2, 3] }
// ─────────────────────────────────────────────
router.delete('/inferences', (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Missing ids array' });
    }

    let deletedCount = 0;
    for (const rawId of ids) {
      const numericId = parseInt(
        typeof rawId === 'string' && rawId.startsWith('#BN-')
          ? rawId.replace('#BN-', '')
          : rawId,
        10
      );
      const row = db.prepare(`SELECT snapshot_url FROM inferences WHERE id = ?`).get(numericId);
      if (!row) continue;
      db.prepare(`DELETE FROM inferences WHERE id = ?`).run(numericId);
      if (row.snapshot_url && row.snapshot_url.startsWith('/public/snapshots/')) {
        const filepath = path.join(__dirname, '../../public/snapshots', path.basename(row.snapshot_url));
        try { if (fs.existsSync(filepath)) fs.unlinkSync(filepath); } catch {}
      }
      deletedCount++;
    }

    res.json({ success: true, deletedCount });
  } catch (err) {
    console.error('DELETE /inferences error:', err);
    res.status(500).json({ error: 'Failed to bulk delete' });
  }
});

// ─────────────────────────────────────────────
// POST /api/v1/inferences/cleanup
// Auto-delete DB records whose snapshot file no longer exists on disk
// Returns: { cleaned: number }
// ─────────────────────────────────────────────
router.post('/inferences/cleanup', (req, res) => {
  try {
    const snapshotDir = path.join(__dirname, '../../public/snapshots');
    const rows = db.prepare(`SELECT id, snapshot_url FROM inferences`).all();

    let cleaned = 0;
    for (const row of rows) {
      // Delete if: no snapshot_url OR snapshot_url points to missing file
      if (!row.snapshot_url || row.snapshot_url === '') {
        db.prepare(`DELETE FROM inferences WHERE id = ?`).run(row.id);
        cleaned++;
        continue;
      }
      if (row.snapshot_url.startsWith('/public/snapshots/')) {
        const filepath = path.join(snapshotDir, path.basename(row.snapshot_url));
        if (!fs.existsSync(filepath)) {
          db.prepare(`DELETE FROM inferences WHERE id = ?`).run(row.id);
          cleaned++;
        }
      }
    }

    res.json({ success: true, cleaned, message: `Removed ${cleaned} orphaned record(s)` });
  } catch (err) {
    console.error('POST /inferences/cleanup error:', err);
    res.status(500).json({ error: 'Cleanup failed' });
  }
});

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

// ─────────────────────────────────────────────
// POST /api/v1/classify
// Called by UI to classify uploaded image(s).
// Body: { images: [ { name, dataUrl } ] }   (array, up to 10)
// Returns: [ { name, className, confidence, allPredictions, snapshotUrl, savedId } ]
// ─────────────────────────────────────────────
router.post('/classify', async (req, res) => {
  try {
    const { images } = req.body;
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Missing images array' });
    }
    if (images.length > 10) {
      return res.status(400).json({ error: 'Max 10 images per request' });
    }

    const results = await Promise.all(images.map(async (img) => {
      const { name, dataUrl } = img;

      // ── Extract base64 bytes ──
      const matches = dataUrl.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);
      if (!matches) return { name, error: 'Invalid image format' };

      const ext      = matches[1];
      const b64data  = matches[2];
      const buffer   = Buffer.from(b64data, 'base64');

      // ── Forward to AI model ──
      let className    = 'Unknown';
      let confidence   = 0;
      let allPredictions = [];
      let inferenceMs = 0;

      try {
        // Build multipart form-data manually using FormData-compatible approach
        const FormData = (await import('form-data')).default;
        const { default: fetch } = await import('node-fetch');

        const form = new FormData();
        form.append('imageData', buffer, { filename: name || 'upload.jpg', contentType: `image/${ext}` });

        const t0 = Date.now();
        const aiRes = await fetch(AI_MODEL_URL, { method: 'POST', body: form, headers: form.getHeaders(), timeout: 8000 });
        inferenceMs = Date.now() - t0;

        if (!aiRes.ok) throw new Error(`AI model HTTP ${aiRes.status}`);

        const aiData = await aiRes.json();
        const predictions = aiData.predictions || [];
        allPredictions = predictions.map(p => ({
          label: p.tagName,
          probability: parseFloat((p.probability * 100).toFixed(2)),
        })).sort((a, b) => b.probability - a.probability);

        if (predictions.length > 0) {
          const best = predictions.reduce((a, b) => (a.probability > b.probability ? a : b));
          confidence = parseFloat((best.probability * 100).toFixed(2));
          className  = best.probability >= CONFIDENCE_THRESHOLD ? best.tagName : 'Unknown';
        }
      } catch (aiErr) {
        console.error(`[classify] AI error for "${name}":`, aiErr.message);
        // Return partial result with error flag
        return { name, className: 'Error', confidence: 0, allPredictions: [], error: 'AI model unreachable' };
      }

      // ── Save snapshot to disk ──
      let snapshotUrl = '';
      try {
        const filename  = `upload_${Date.now()}_${Math.random().toString(36).slice(2,7)}.${ext}`;
        const filepath  = path.join(__dirname, '../../public/snapshots', filename);
        fs.mkdirSync(path.dirname(filepath), { recursive: true });
        fs.writeFileSync(filepath, buffer);
        snapshotUrl = `/public/snapshots/${filename}`;
      } catch (fsErr) {
        console.error('[classify] Snapshot save error:', fsErr.message);
      }

      // ── Persist to DB ──
      let savedId = null;
      try {
        const info = db.prepare(`
          INSERT INTO inferences (fruit_type, status, quality_score, confidence, inference_ms, snapshot_url)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run('BANANA', className, confidence, confidence, inferenceMs, snapshotUrl);
        savedId = info.lastInsertRowid;
      } catch (dbErr) {
        console.error('[classify] DB save error:', dbErr.message);
      }

      return { name, className, confidence, allPredictions, snapshotUrl, savedId, inferenceMs };
    }));

    res.json({ results });
  } catch (err) {
    console.error('POST /classify error:', err);
    res.status(500).json({ error: 'Classification failed' });
  }
});

export default router;
